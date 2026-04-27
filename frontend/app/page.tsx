"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

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
  };

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Doc Upload</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <br />

      <button
        onClick={uploadFile}
        className="bg-black text-white px-4 py-2 rounded cursor-pointer"
      >
        Upload
      </button>

      <p className="mt-4">{message}</p>
    </main>
  );
}