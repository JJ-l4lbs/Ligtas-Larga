import { createClient } from "@supabase/supabase-js";
import { prisma } from "../../../../lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Sign up failed" },
        { status: 400 }
      );
    }

    const session = data.session;

    const role = email.toLowerCase().includes("admin") ? "ADMIN" : "USER";

    // Check if profile already exists by email address (e.g. out of sync ID)
    let profile = await prisma.userProfile.findUnique({
      where: { email },
    });

    if (profile) {
      // Update existing profile's ID to align with the new Supabase Auth user ID
      profile = await prisma.userProfile.update({
        where: { email },
        data: { id: data.user.id },
      });
    } else {
      profile = await prisma.userProfile.create({
        data: {
          id: data.user.id,
          email: data.user.email || email,
          role,
        },
      });
    }

    if (session) {
      const cookieStore = await cookies();
      cookieStore.set("sb-access-token", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: session.expires_in,
        sameSite: "lax",
        path: "/",
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        sessionActive: !!session,
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
