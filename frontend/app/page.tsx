"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setMessage(data.message);
    setChunks(data.sample_chunks || []);
  };

  const askQuestion = async () => {
  const res = await fetch("http://127.0.0.1:8000/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const data = await res.json();
  setAnswer(data.answer);
  setSources(data.sources || []);
};

  return (
    <main className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload PDF</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <div className="mt-4">
        <button
          onClick={uploadFile}
          className="bg-black text-white px-4 py-2 rounded cursor-pointer"
        >
          Upload
        </button>
      </div>

      <p className="mt-4 font-medium">{message}</p>

      <div className="mt-8 space-y-4">
        {chunks.map((chunk, index) => (
          <div key={index} className="border p-4 rounded">
            <h3 className="font-bold mb-2">Chunk {index + 1}</h3>
            <p className="whitespace-pre-wrap">{chunk}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask question..."
        className="border p-2 w-full"
      />

      <button
        onClick={askQuestion}
        className="bg-blue-600 text-white px-4 py-2 mt-2 rounded cursor-pointer"
      >
        Ask
      </button>

      <div className="mt-4 border p-4 rounded">
        {answer}
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="font-bold">Sources</h3>

        {sources.map((src, index) => (
          <div key={index} className="border p-3 rounded text-sm">
            {src}
          </div>
        ))}
      </div>
    </div>
    </main>
  );
}