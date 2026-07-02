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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    const { user, access_token, expires_in } = data.session;

    // Check if user profile exists in database. If not, create it.
    let profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      // Check if profile exists under this email address (e.g. out of sync ID)
      const existingEmailProfile = await prisma.userProfile.findUnique({
        where: { email },
      });

      if (existingEmailProfile) {
        // Update the ID to align with the current Supabase Auth user ID
        profile = await prisma.userProfile.update({
          where: { email },
          data: { id: user.id },
        });
      } else {
        // Auto-promote emails containing "admin" to ADMIN for testing
        const role = email.toLowerCase().includes("admin") ? "ADMIN" : "USER";
        profile = await prisma.userProfile.create({
          data: {
            id: user.id,
            email: user.email || email,
            role,
          },
        });
      }
    }

    // Set HTTP-only secure session cookie
    const cookieStore = await cookies();
    cookieStore.set("sb-access-token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expires_in,
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
