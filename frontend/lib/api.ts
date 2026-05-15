const API_URL = "http://127.0.0.1:8000";

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  return res.json();
}

export async function askQuestion(question: string) {
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  return res.json();
}