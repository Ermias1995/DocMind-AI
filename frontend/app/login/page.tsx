"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    alert(error.message);
    return;
  }
  console.log("------Login successfull redirecting to dashboard------")
  alert("------Login successfull redirecting to dashboard------")
  // force full page reload
  window.location.href = "/dashboard";
};

  return (
    <main className="p-10 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Login
      </h1>

      <input
        placeholder="Email"
        className="border p-2 w-full mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={login}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Login
      </button>
    </main>
  );
}