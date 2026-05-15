import { createServerClient } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ Fix: correct env var name
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        // ✅ Fix: actually set cookies so session persists
        set(name: string, value: string, options) {
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({
            request: { headers: req.headers },
          });
          res.cookies.set({ name, value, ...options });
        },
        // ✅ Fix: actually remove cookies
        remove(name: string, options) {
          req.cookies.set({ name, value: "", ...options });
          res = NextResponse.next({
            request: { headers: req.headers },
          });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};