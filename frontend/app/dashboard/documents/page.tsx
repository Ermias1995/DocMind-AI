"use client";

import { useEffect, useState } from "react";
import { uploadDocument, getDocuments } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Document = {
  id: string;
  name: string;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);

  const [file, setFile] = useState<File | null>(null);

  const loadDocuments = async () => {
    const data = await getDocuments();

    setDocuments(data);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    await uploadDocument(file);

    setFile(null);

    loadDocuments();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">
          Documents
        </h1>

        <div className="flex gap-3">
          <input
            type="file"
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
          />

          <Button onClick={handleUpload}>
            Upload
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/dashboard/chat/${doc.id}`}
            className="block border rounded-xl p-5 hover:bg-muted"
          >
            <h2 className="font-semibold text-lg">
              {doc.name}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
}