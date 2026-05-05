from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import fitz
from dotenv import load_dotenv
from openai import OpenAI
import logging
import math

load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI()

stored_chunks = []
stored_vectors = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_client() -> OpenAI:
    api_key = os.getenv("GITHUB_TOKEN") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Missing GITHUB_TOKEN or OPENAI_API_KEY environment variable",
        )

    return OpenAI(
        base_url="https://models.github.ai/inference",
        api_key=api_key,
    )

def chunk_text(text, chunk_size=500, overlap=100):
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)

        start += chunk_size - overlap

    return chunks

def get_embedding(text: str) -> list[float]:
    try:
        client = get_client()
        response = client.embeddings.create(
            model="openai/text-embedding-3-small",
            input=text,
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")


def generate_answer(question: str, context: str) -> str:
    try:
        client = get_client()
        response = client.chat.completions.create(
            model="openai/gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You answer questions using only the provided document context. Keep the answer concise and factual.",
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {question}",
                },
            ],
            temperature=0,
            max_tokens=4096,
            top_p=1,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"Error generating answer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Answer generation failed: {str(e)}")

def cosine_similarity(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0
    return dot / (norm_a * norm_b)

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = ""

        if file.filename.endswith(".pdf"):
            doc = fitz.open(file_path)

            for page in doc:
                extracted_text += page.get_text()

            doc.close()

        chunks = chunk_text(extracted_text)[:10]

        if not chunks:
            return {"message": "No text found", "chunks": 0}

        global stored_chunks, stored_vectors

        stored_chunks = chunks

        # 👇 CRITICAL: add logging
        stored_vectors = []
        for i, chunk in enumerate(chunks):
            print(f"Embedding chunk {i+1}/{len(chunks)}")
            vec = get_embedding(chunk)
            stored_vectors.append(vec)

        return {
            "message": "Uploaded and embedded",
            "chunks": len(chunks),
            "sample_chunks": chunks[:3],
        }

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        raise

@app.post("/ask")
async def ask_question(data: dict):
    question = data["question"]

    if not stored_vectors:
        return {"message": "No document has been uploaded yet"}

    query_vector = get_embedding(question)

    scores = []

    for i, vec in enumerate(stored_vectors):
        score = cosine_similarity(query_vector, vec)
        scores.append((score, stored_chunks[i]))

    scores.sort(reverse=True)

    best_chunk = scores[0][1]
    answer = generate_answer(question, best_chunk)

    return {
        "question": question,
        "best_match": best_chunk,
        "answer": answer,
    }