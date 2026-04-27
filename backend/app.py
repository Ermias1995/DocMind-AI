from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import fitz

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"

def chunk_text(text, chunk_size=500, overlap=100):
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)

        start += chunk_size - overlap

    return chunks

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = ""

    if file.filename.endswith(".pdf"):
        doc = fitz.open(file_path)

        for page in doc:
            extracted_text += page.get_text()

        doc.close()

    # Chunk the text
    chunks = chunk_text(extracted_text)

    return {
        "filename": file.filename,
        "message": "Upload successful",
        "total_chunks": len(chunks),
        "sample_chunks": chunks[:3]  # send only first 3
    }