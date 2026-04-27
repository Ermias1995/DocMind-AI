"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [text, setText] = useState("");

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
    setText(data.text_preview || "");
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
          className="bg-black text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </div>

      <p className="mt-4 font-medium">{message}</p>

      <div className="mt-8 border p-4 rounded whitespace-pre-wrap">
        {text}
      </div>
    </main>
  );
}