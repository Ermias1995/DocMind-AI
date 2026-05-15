import { supabase } from "./supabase";

const API_URL = "http://127.0.0.1:8000";

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token;
}

export async function uploadDocument(file: File) {
  const token = await getAccessToken();

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return res.json();
}

export async function askQuestion(question: string) {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question }),
  });

  return res.json();
}

export async function getDocuments() {
  const res = await fetch(`${API_URL}/documents`);

  return res.json();
}