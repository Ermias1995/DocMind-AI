"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Check existing session first (handles post-reload case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });

    // ✅ Then listen for future auth changes (logout, token expiry, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);


  const logout = async () => {
    await supabase.auth.signOut();

    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col">
        <div>
          <h1 className="text-2xl font-bold mb-8">
            DocMind AI
          </h1>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block p-2 rounded hover:bg-muted"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/documents"
              className="block p-2 rounded hover:bg-muted"
            >
              Documents
            </Link>

            <Link
              href="/dashboard/chat"
              className="block p-2 rounded hover:bg-muted"
            >
              Chats
            </Link>
          </nav>
        </div>

        <div className="mt-auto pt-4 border-t">
          <button
            onClick={logout}
            className="w-full border rounded p-2 hover:bg-muted"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}