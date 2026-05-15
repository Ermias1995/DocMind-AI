"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const signup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful");
      router.push("/dashboard"); 
    }
  };

  return (
    <main className="p-10 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Sign Up
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
        onClick={signup}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Sign Up
      </button>
    </main>
  );
}