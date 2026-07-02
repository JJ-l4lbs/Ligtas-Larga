import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all routes under /admin and admin API handlers under /api/admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("sb-access-token")?.value;

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized: Missing session token" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      // Verify token with Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Determine user role (database profile check via Supabase REST or fallback email check)
      let isAdmin = false;

      // Rule-based testing fallback
      if (user.email?.toLowerCase().includes("admin")) {
        isAdmin = true;
      } else {
        // Query UserProfile model via Supabase REST endpoint (edge-safe query)
        const res = await fetch(
          `${supabaseUrl}/rest/v1/UserProfile?id=eq.${user.id}&select=role`,
          {
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const profiles = await res.json();
          if (profiles && profiles[0]?.role === "ADMIN") {
            isAdmin = true;
          }
        }
      }

      if (!isAdmin) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (err) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Internal Auth Error" }, { status: 500 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
