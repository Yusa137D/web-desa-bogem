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
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithSupabase: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (redirectPath?: string) => Promise<{ success: boolean; error?: string }>;
  registerWithSupabase: (data: {
    nik?: string;
    email: string;
    password: string;
    nama: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithSupabase: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  registerWithSupabase: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse user profile from Supabase user session and profiles table
  const parseUserProfile = async (supabaseUser: SupabaseUser): Promise<UserProfile> => {
    const meta = supabaseUser.user_metadata || {};
    let role: UserRole = "warga";
    let name: string = meta.name || meta.nama || supabaseUser.email?.split("@")[0] || "Warga Desa";
    let nik: string = meta.nik || "";
    let phone: string = meta.phone || meta.no_hp || "";

    try {
      if (supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, nama, nik, no_hp")
          .eq("id", supabaseUser.id)
          .maybeSingle();

        if (profile) {
          if (profile.role === "admin" || profile.role === "warga") {
            role = profile.role as UserRole;
          }
          if (profile.nama) name = profile.nama;
          if (profile.nik) nik = profile.nik;
          if (profile.no_hp) phone = profile.no_hp;
        }
      }
    } catch (err) {
      console.warn("Could not fetch user profile from profiles table:", err);
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      nik,
      name,
      role,
      phone,
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
        if (error.message.includes("Invalid login credentials")) {
          errorMsg = isNik ? "Kata sandi tidak cocok untuk NIK ini." : "Email atau kata sandi tidak cocok.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMsg = "Alamat email belum dikonfirmasi.";
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

  // Secure Citizen Registration
  const registerWithSupabase = async (data: {
    nik?: string;
    email: string;
    password: string;
    nama: string;
    phone: string;
  }): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> => {
    if (!supabase) {
      return { success: false, error: "Layanan autentikasi belum siap." };
    }

    try {
      const cleanNik = data.nik ? data.nik.trim() : "";

      if (cleanNik && (cleanNik.length !== 16 || !/^[0-9]{16}$/.test(cleanNik))) {
        return {
          success: false,
          error: "NIK wajib 16 digit angka sesuai KTP.",
        };
      }

      const cleanEmail = data.email.trim().toLowerCase();
      const { data: authData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            nik: cleanNik,
            name: data.nama,
            phone: data.phone,
            role: "warga",
          },
        },
      });

      if (error) {
        let errorMsg = error.message;
        if (error.message.includes("already registered")) {
          errorMsg = "Email ini sudah terdaftar. Silakan lakukan Login.";
        } else if (error.message.includes("Password should be at least")) {
          errorMsg = "Kata sandi minimal 6 karakter.";
        }
        return { success: false, error: errorMsg };
      }

      const needsConfirmation = !authData.session;

      if (!needsConfirmation && authData.user) {
        const profile: UserProfile = {
          id: authData.user.id,
          nik: cleanNik,
          email: cleanEmail,
          name: data.nama,
          role: "warga",
          phone: data.phone,
        };
        setUser(profile);
      }

      return { success: true, needsEmailConfirmation: needsConfirmation };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mendaftar.";
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

      const { error } = await supabase.auth.signInWithOAuth({
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
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghubungkan ke layanan Google.";
      return { success: false, error: msg };
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
