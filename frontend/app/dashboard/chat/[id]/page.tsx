"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { askQuestion } from "@/lib/api";

export default function DocumentChatPage() {
  const params = useParams();

  const documentId = params.id as string;

  const [question, setQuestion] = useState("");

  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    const data = await askQuestion(
      question,
      documentId
    );

    setAnswer(data.answer);
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        Document Chat
      </h1>

      <textarea
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
        placeholder="Ask question about this document..."
        className="w-full border rounded-lg p-4 h-32"
      />

      <button
        onClick={handleAsk}
        className="bg-black text-white px-5 py-2 rounded mt-4"
      >
        Ask
      </button>

      {answer && (
        <div className="mt-8 border rounded-xl p-6">
          <h2 className="font-bold mb-3">
            Answer
          </h2>

          <p className="whitespace-pre-wrap">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}