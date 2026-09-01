"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "admin" | "warga";

export interface UserProfile {
  id?: string;
  nik?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  isProfileComplete?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithSupabase: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; emailNotConfirmed?: boolean; email?: string }>;
  loginWithGoogle: (redirectPath?: string) => Promise<{ success: boolean; error?: string }>;
  registerWithSupabase: (data: {
    email: string;
    password: string;
    nama?: string;
    nik?: string;
    phone?: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: {
    nik: string;
    nama: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  demoLogin: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithSupabase: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  registerWithSupabase: async () => ({ success: false }),
  resendVerificationEmail: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  logout: async () => {},
  demoLogin: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse user profile from Supabase user session and profiles table
  const parseUserProfile = async (supabaseUser: SupabaseUser): Promise<UserProfile> => {
    const meta = supabaseUser.user_metadata || {};
    let role: UserRole = meta.role === "admin" ? "admin" : "warga";
    let name: string =
      meta.full_name ||
      meta.name ||
      meta.nama ||
      supabaseUser.email?.split("@")[0] ||
      "Warga Desa";
    let nik: string = meta.nik || "";
    let phone: string = meta.phone || meta.no_hp || "";
    let avatar_url: string = meta.avatar_url || meta.picture || "";

    try {
      if (supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseUser.id)
          .maybeSingle();

        if (profile) {
          if (profile.role === "admin" || profile.role === "warga") {
            role = profile.role as UserRole;
          }
          if (profile.nama) name = profile.nama;
          if (profile.nik) nik = profile.nik;
          if (profile.no_hp) phone = profile.no_hp;
          if (profile.avatar_url) avatar_url = profile.avatar_url;
        }
      }
    } catch (err) {
      console.warn("Could not fetch user profile from profiles table:", err);
    }

    const isProfileComplete =
      role === "admin" ||
      Boolean(nik && /^[0-9]{16}$/.test(nik.trim()) && phone && phone.trim().length >= 9);

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      nik,
      name,
      role,
      phone,
      avatar_url,
      isProfileComplete,
    };
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user && mounted) {
          const profile = await parseUserProfile(data.session.user);
          setUser(profile);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (!supabase) return;

    // Listen to Supabase Auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && mounted) {
        const profile = await parseUserProfile(session.user);
        setUser(profile);
      } else if (mounted) {
        setUser(null);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Secure Login with Supabase (Supports Email OR NIK)
  const loginWithSupabase = async (identifier: string, password: string) => {
    if (!supabase) {
      return { success: false, error: "Layanan autentikasi belum siap." };
    }

    try {
      const cleanIdentifier = identifier.trim();
      let targetEmail = cleanIdentifier.toLowerCase();

      // If user enters 16-digit NIK instead of email
      const isNik = /^[0-9]{16}$/.test(cleanIdentifier);
      if (isNik) {
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("email")
          .eq("nik", cleanIdentifier)
          .maybeSingle();

        if (profileErr || !profile?.email) {
          return {
            success: false,
            error: "NIK tidak terdaftar sebagai akun warga. Silakan daftar terlebih dahulu.",
          };
        }
        targetEmail = profile.email.toLowerCase();
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        let errorMsg = "Gagal masuk. Periksa kembali NIK/Email dan kata sandi Anda.";
        const isNotConfirmed = error.message.toLowerCase().includes("email not confirmed") || error.message.toLowerCase().includes("not confirmed");
        
        if (isNotConfirmed) {
          errorMsg = "Alamat email Anda belum diverifikasi. Silakan periksa kotak masuk atau folder spam di Gmail Anda.";
          return { success: false, error: errorMsg, emailNotConfirmed: true, email: targetEmail };
        } else if (error.message.includes("Invalid login credentials")) {
          errorMsg = isNik ? "Kata sandi tidak cocok untuk NIK ini." : "Email atau kata sandi tidak cocok.";
        }
        return { success: false, error: errorMsg };
      }

      if (data.user) {
        const profile = await parseUserProfile(data.user);
        setUser(profile);
        return { success: true };
      }

      return { success: false, error: "Gagal memproses data pengguna." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan koneksi server.";
      return { success: false, error: msg };
    }
  };

  // Secure Citizen Registration (Stage 1: Email & Password)
  const registerWithSupabase = async (data: {
    email: string;
    password: string;
    nama?: string;
    nik?: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> => {
    if (!supabase) {
      return { success: false, error: "Layanan autentikasi belum siap." };
    }

    try {
      const cleanNik = data.nik ? data.nik.trim() : "";

      if (cleanNik) {
        if (cleanNik.length !== 16 || !/^[0-9]{16}$/.test(cleanNik)) {
          return {
            success: false,
            error: "NIK wajib 16 digit angka sesuai KTP.",
          };
        }

        // Check if NIK is already registered
        try {
          const { data: existingNik } = await supabase
            .from("profiles")
            .select("id")
            .eq("nik", cleanNik)
            .maybeSingle();

          if (existingNik) {
            return {
              success: false,
              error: "NIK ini sudah terdaftar di sistem desa. Silakan masuk menggunakan NIK Anda.",
            };
          }
        } catch {
          // Table check failure is non-fatal
        }
      }

      const cleanEmail = data.email.trim().toLowerCase();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/callback?redirect=/lengkapi-profil`;

      const userMetadata: Record<string, any> = {
        role: data.role || "warga",
      };
      if (data.nama) {
        userMetadata.name = data.nama;
        userMetadata.nama = data.nama;
      }
      if (cleanNik) {
        userMetadata.nik = cleanNik;
      }
      if (data.phone) {
        userMetadata.phone = data.phone;
        userMetadata.no_hp = data.phone;
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          emailRedirectTo,
          data: userMetadata,
        },
      });

      if (error) {
        let errorMsg = error.message;
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          errorMsg = "Email ini sudah terdaftar. Silakan masuk ke akun Anda.";
        } else if (error.message.includes("Password should be at least")) {
          errorMsg = "Kata sandi minimal 8 karakter.";
        } else if (error.message.toLowerCase().includes("error sending confirmation email")) {
          errorMsg = "Gagal mengirim email konfirmasi. Pastikan Custom SMTP telah aktif di Supabase Dashboard.";
        } else if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("exceeded")) {
          errorMsg = "Batas pengiriman email Supabase tercapai. Mohon tunggu beberapa saat lagi.";
        }
        return { success: false, error: errorMsg };
      }

      // Upsert initial profile into profiles table
      if (authData.user) {
        try {
          await supabase.from("profiles").upsert(
            [
              {
                id: authData.user.id,
                nik: cleanNik || null,
                email: cleanEmail,
                nama: data.nama || cleanEmail.split("@")[0] || "Warga Desa",
                no_hp: data.phone || null,
                role: data.role || "warga",
                updated_at: new Date().toISOString(),
              },
            ],
            { onConflict: "id" }
          );
        } catch {
          // Non-fatal if trigger handles insertion or user is not logged in yet
        }

        const needsConfirmation = !authData.session;

        if (!needsConfirmation) {
          const profile: UserProfile = {
            id: authData.user.id,
            nik: cleanNik,
            email: cleanEmail,
            name: data.nama || cleanEmail.split("@")[0] || "Warga Desa",
            role: data.role || "warga",
            phone: data.phone,
            isProfileComplete: Boolean(cleanNik && cleanNik.length === 16 && data.phone && data.phone.length >= 9),
          };
          setUser(profile);
          return { success: true, needsEmailConfirmation: false };
        } else {
          return { success: true, needsEmailConfirmation: true };
        }
      }

      return { success: true, needsEmailConfirmation: false };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mendaftar.";
      return { success: false, error: msg };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: "Layanan autentikasi belum siap." };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/callback?redirect=/lengkapi-profil`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: {
          emailRedirectTo,
        },
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("exceeded")) {
          msg = "Batas frekuensi email tercapai. Silakan tunggu 1-2 menit sebelum meminta kirim ulang.";
        }
        return { success: false, error: msg };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim email konfirmasi.";
      return { success: false, error: msg };
    }
  };

  // Update profile for Google users & existing citizens
  const updateProfile = async (data: {
    nik: string;
    nama: string;
    phone: string;
  }) => {
    if (!supabase) {
      return { success: false, error: "Layanan database belum siap." };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak aktif. Silakan masuk kembali." };
      }

      const cleanNik = data.nik.trim();
      const cleanPhone = data.phone.trim();
      const cleanNama = data.nama.trim();

      // 1. Check if NIK is already registered to another user
      const { data: existingNik, error: nikCheckErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("nik", cleanNik)
        .neq("id", currentUser.id)
        .maybeSingle();

      if (!nikCheckErr && existingNik) {
        return {
          success: false,
          error: "NIK ini sudah terdaftar pada akun warga lain. Periksa kembali NIK KTP Anda.",
        };
      }

      // 2. Upsert into profiles table
      const basePayload: Record<string, any> = {
        id: currentUser.id,
        nik: cleanNik,
        nama: cleanNama,
        no_hp: cleanPhone,
        email: currentUser.email,
        role: "warga",
        updated_at: new Date().toISOString(),
      };

      const { error: profileErr } = await supabase.from("profiles").upsert(
        [basePayload],
        { onConflict: "id" }
      );

      if (profileErr) {
        console.error("updateProfile DB error:", profileErr);
        return { success: false, error: `Gagal memperbarui database: ${profileErr.message}` };
      }

      // 3. Update auth user metadata
      await supabase.auth.updateUser({
        data: {
          nik: cleanNik,
          name: cleanNama,
          nama: cleanNama,
          phone: cleanPhone,
          no_hp: cleanPhone,
          role: "warga",
        },
      });

      // 4. Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              nik: cleanNik,
              name: cleanNama,
              phone: cleanPhone,
              isProfileComplete: true,
            }
          : {
              id: currentUser.id,
              email: currentUser.email || "",
              nik: cleanNik,
              name: cleanNama,
              phone: cleanPhone,
              role: "warga",
              isProfileComplete: true,
            }
      );

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui profil data warga.";
      return { success: false, error: msg };
    }
  };

  // 1-Click Google OAuth Sign-in
  const loginWithGoogle = async (redirectPath?: string) => {
    if (!supabase) {
      return { success: false, error: "Layanan autentikasi belum siap." };
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.url) {
        window.location.href = data.url;
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghubungkan ke layanan Google.";
      return { success: false, error: msg };
    }
  };

  // Demo mode login
  const demoLogin = (role: UserRole) => {
    const demoProfile: UserProfile = {
      id: role === "admin" ? "demo-admin-id" : "demo-warga-id",
      nik: role === "warga" ? "3520012345670001" : undefined,
      email: role === "admin" ? "admin@desa.id" : "warga@desa.id",
      name: role === "admin" ? "Admin Desa" : "Budi Santoso (Warga)",
      role: role,
      phone: "081234567890",
      isProfileComplete: true,
    };
    setUser(demoProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem("desa_demo_user", JSON.stringify(demoProfile));
    }
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Sign out error:", err);
      }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("desa_demo_user");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithSupabase,
        loginWithGoogle,
        registerWithSupabase,
        resendVerificationEmail,
        updateProfile,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
