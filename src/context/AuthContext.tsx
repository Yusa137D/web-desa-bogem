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
  registerWithSupabase: (data: {
    nik?: string;
    email: string;
    password: string;
    nama: string;
    phone: string;
    role: UserRole;
  }) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  demoLogin: (role: UserRole) => void;
}

// Secret key required to register as Admin Desa
export const AdminSecretKey = "DESA-ADMIN-2026";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithSupabase: async () => ({ success: false }),
  registerWithSupabase: async () => ({ success: false }),
  logout: async () => {},
  demoLogin: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse user profile from Supabase user session or fallback metadata
  const parseUserProfile = async (supabaseUser: SupabaseUser): Promise<UserProfile> => {
    const meta = supabaseUser.user_metadata || {};
    let role: UserRole = meta.role === "admin" ? "admin" : "warga";
    let name: string = meta.name || meta.nama || supabaseUser.email?.split("@")[0] || "User Desa";
    let nik: string = meta.nik || "";
    let phone: string = meta.phone || meta.no_hp || "";

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      if (profile) {
        if (profile.role) role = profile.role as UserRole;
        if (profile.nama) name = profile.nama;
        if (profile.nik) nik = profile.nik;
        if (profile.no_hp) phone = profile.no_hp;
      }
    } catch {
      // Ignore table error if profile table is not initialized yet
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
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user && mounted) {
          const profile = await parseUserProfile(data.session.user);
          setUser(profile);
        } else {
          // Check local demo session
          const savedDemo = localStorage.getItem("desa_demo_user");
          if (savedDemo && mounted) {
            setUser(JSON.parse(savedDemo));
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase Auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await parseUserProfile(session.user);
        setUser(profile);
      } else {
        const savedDemo = localStorage.getItem("desa_demo_user");
        if (savedDemo) {
          setUser(JSON.parse(savedDemo));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Secure Real Login with Supabase (Supports Email OR NIK)
  const loginWithSupabase = async (identifier: string, password: string) => {
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
        localStorage.removeItem("desa_demo_user");
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

  // Secure Register with Supabase & NIK Validation
  const registerWithSupabase = async (data: {
    nik?: string;
    email: string;
    password: string;
    nama: string;
    phone: string;
    role: UserRole;
    adminSecret?: string;
  }): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> => {
    try {
      // Validate Admin Secret Code if requesting Admin Role
      if (data.role === "admin") {
        if (!data.adminSecret || data.adminSecret !== "DESA-ADMIN-2026") {
          return {
            success: false,
            error: "Kode Rahasia Admin Desa salah. Hanya perangkat desa berwenang yang dapat mendaftar sebagai Admin.",
          };
        }
      }

      const cleanNik = data.nik ? data.nik.trim() : "";

      // Validate NIK for warga
      if (data.role === "warga") {
        if (!cleanNik || cleanNik.length !== 16 || !/^[0-9]{16}$/.test(cleanNik)) {
          return {
            success: false,
            error: "NIK wajib 16 digit angka sesuai KTP.",
          };
        }

        // Check if NIK already registered
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
          // Non-fatal if profiles table does not have RLS yet
        }
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
            role: data.role,
          },
        },
      });

      if (error) {
        let errorMsg = error.message;
        if (error.message.includes("already registered")) {
          errorMsg = "Email ini sudah terdaftar. Silakan lakukan Login.";
        } else if (error.message.includes("Password should be at least")) {
          errorMsg = "Kata sandi minimal 6 karakter.";
        } else if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("exceeded")) {
          errorMsg = "Batas pengiriman email Supabase tercapai. Harap nonaktifkan 'Confirm email' di dashboard Supabase atau aktifkan Custom SMTP.";
        }
        return { success: false, error: errorMsg };
      }

      // Try inserting to profiles table
      if (authData.user) {
        try {
          await supabase.from("profiles").upsert([
            {
              id: authData.user.id,
              nik: cleanNik,
              email: cleanEmail,
              nama: data.nama,
              no_hp: data.phone,
              role: data.role,
              updated_at: new Date().toISOString(),
            },
          ]);
        } catch {
          // Table insert failure is non-fatal if profiles table isn't created yet
        }

        // Check if user session was created immediately or requires email confirmation
        const needsConfirmation = !authData.session;

        if (!needsConfirmation) {
          const profile: UserProfile = {
            id: authData.user.id,
            nik: cleanNik,
            email: cleanEmail,
            name: data.nama,
            role: data.role,
            phone: data.phone,
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

  // Demo mode login for testing offline or presentation
  const demoLogin = (role: UserRole) => {
    const demoProfile: UserProfile = {
      id: role === "admin" ? "demo-admin-id" : "demo-warga-id",
      nik: role === "warga" ? "3520012345670001" : undefined,
      email: role === "admin" ? "admin@desa.id" : "warga@desa.id",
      name: role === "admin" ? "Admin Desa" : "Budi Santoso (Warga)",
      role: role,
      phone: "081234567890",
    };
    setUser(demoProfile);
    localStorage.setItem("desa_demo_user", JSON.stringify(demoProfile));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    localStorage.removeItem("desa_demo_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithSupabase,
        registerWithSupabase,
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
