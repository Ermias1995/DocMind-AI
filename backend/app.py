from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import fitz
from dotenv import load_dotenv
from openai import OpenAI
import logging
import math
from db import SessionLocal
from sqlalchemy import text
import uuid

load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI()


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
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a document assistant.\n"
                        "Answer ONLY using the provided context.\n"
                        "If the answer is not in the context, say 'I don't know'.\n"
                        "Be concise and factual."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {question}",
                },
            ],
            temperature=0,
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

        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = ""

        # Extract PDF text
        if file.filename.endswith(".pdf"):
            doc = fitz.open(file_path)

            for page in doc:
                extracted_text += page.get_text()

            doc.close()

        if not extracted_text.strip():
            return {
                "message": "No text found in document",
                "chunks": 0,
            }

        # Chunk text
        chunks = chunk_text(extracted_text)

        # Optional: limit chunks during development
        chunks = chunks[:10]

        # Generate embeddings
        stored_vectors = []

        for i, chunk in enumerate(chunks):
            print(f"Embedding chunk {i+1}/{len(chunks)}")

            vector = get_embedding(chunk)

            stored_vectors.append(vector)

        # Database connection
        db = SessionLocal()

        # Create document ID
        document_id = str(uuid.uuid4())

        # Insert document
        db.execute(
            text("""
                INSERT INTO documents (id, name)
                VALUES (:id, :name)
            """),
            {
                "id": document_id,
                "name": file.filename,
            }
        )

        # Insert chunks
        for chunk, vector in zip(chunks, stored_vectors):

            vector_string = "[" + ",".join(map(str, vector)) + "]"

            db.execute(
                text("""
                    INSERT INTO document_chunks
                    (document_id, content, embedding)
                    VALUES (:document_id, :content, :embedding)
                """),
                {
                    "document_id": document_id,
                    "content": chunk,
                    "embedding": vector_string,
                }
            )

        db.commit()
        db.close()

        return {
            "message": "Uploaded and embedded successfully",
            "document_id": document_id,
            "chunks": len(chunks),
            "sample_chunks": chunks[:3],
        }

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(data: dict):
    try:
        question = data["question"]

        # Generate embedding for question
        query_vector = get_embedding(question)

        vector_string = "[" + ",".join(map(str, query_vector)) + "]"

        db = SessionLocal()

        # Semantic similarity search
        result = db.execute(
            text("""
                SELECT content
                FROM document_chunks
                ORDER BY embedding <-> CAST(:embedding AS vector)
                LIMIT 3
            """),
            {
                "embedding": vector_string
            }
        )

        rows = result.fetchall()

        db.close()

        if not rows:
            return {
                "message": "No matching document chunks found"
            }

        # Extract top chunks
        top_chunks = [row[0] for row in rows]

        # Combine context
        combined_context = "\n\n---\n\n".join(top_chunks)

        # Generate AI answer
        answer = generate_answer(question, combined_context)

        return {
            "question": question,
            "answer": answer,
            "sources": top_chunks,
        }

    except Exception as e:
        print("ASK ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))