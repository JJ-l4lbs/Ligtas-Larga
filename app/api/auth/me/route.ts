import { createClient } from "@supabase/supabase-js";
import { prisma } from "../../../../lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || "USER",
      }
    });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}

// DELETE: Permanently delete account and clear session
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // 1. Delete user profile (cascades to saved places and saved routes in PostgreSQL)
    try {
      await prisma.userProfile.delete({
        where: { id: userId },
      });
    } catch (e) {
      console.warn("UserProfile record might already be missing:", e);
    }

    // 2. Delete user from Supabase Auth users table directly using Postgres raw SQL
    await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE id = $1`, userId);

    // 3. Clear session cookie
    cookieStore.delete("sb-access-token");

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
