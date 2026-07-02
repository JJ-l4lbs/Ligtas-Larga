import { createClient } from "@supabase/supabase-js";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

export async function getUserIdFromSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;
    if (!token) return null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    // Check if user profile exists in database. If not, auto-create it to prevent foreign key issues.
    let profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      const role = user.email?.toLowerCase().includes("admin") ? "ADMIN" : "USER";
      profile = await prisma.userProfile.create({
        data: {
          id: user.id,
          email: user.email || "",
          role,
        },
      });
    }

    return user.id;
  } catch (err) {
    console.error("Error in getUserIdFromSession:", err);
    return null;
  }
}
