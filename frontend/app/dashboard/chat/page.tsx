"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ChatPage() {
  const [question, setQuestion] = useState("");

  return (
    <div className="flex h-screen">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 text-xl font-bold">
          AI Document Chat
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="bg-muted p-4 rounded-lg max-w-2xl">
            Ask questions about your documents.
          </div>
        </div>

        <div className="border-t p-4 flex gap-4">
          <Textarea
            placeholder="Ask about your document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <Button>
            Send
          </Button>
        </div>
      </div>

      {/* Sources Panel */}
      <aside className="w-80 border-l p-4">
        <h2 className="font-bold mb-4">
          Sources
        </h2>

        <div className="space-y-3">
          <div className="border rounded p-3 text-sm">
            Retrieved chunk appears here...
          </div>
        </div>
      </aside>
    </div>
  );
}