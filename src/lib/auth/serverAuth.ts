import { createClient } from "@/lib/supabase/server";

export async function verifyAdminSession(): Promise<{ isAdmin: boolean; error?: string; user?: any }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { isAdmin: false, error: "Unauthorized: Silakan masuk terlebih dahulu." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return { isAdmin: false, error: "Forbidden: Hak akses pengelola desa diperlukan." };
    }

    return { isAdmin: true, user };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memverifikasi sesi admin.";
    return { isAdmin: false, error: msg };
  }
}
