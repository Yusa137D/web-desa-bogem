"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "admin" | "warga";

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithSupabase: (data: {
    email: string;
    password: string;
    nama: string;
    phone: string;
    role: UserRole;
    adminSecret?: string;
  }) => Promise<{ success: boolean; error?: string }>;
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

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      if (profile) {
        if (profile.role) role = profile.role as UserRole;
        if (profile.nama) name = profile.nama;
      }
    } catch {
      // Ignore table error if profile table is not initialized yet
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name,
      role,
      phone: meta.phone || "",
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

  // Secure Real Login with Supabase
  const loginWithSupabase = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        let errorMsg = "Gagal masuk. Periksa kembali email dan kata sandi Anda.";
        if (error.message.includes("Invalid login credentials")) {
          errorMsg = "Email atau kata sandi tidak cocok.";
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

  // Secure Register with Supabase & Role Escalation Protection
  const registerWithSupabase = async (data: {
    email: string;
    password: string;
    nama: string;
    phone: string;
    role: UserRole;
    adminSecret?: string;
  }) => {
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

      const cleanEmail = data.email.trim().toLowerCase();
      const { data: authData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
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
        }
        return { success: false, error: errorMsg };
      }

      // Try inserting to profiles table
      if (authData.user) {
        try {
          await supabase.from("profiles").insert([
            {
              id: authData.user.id,
              email: cleanEmail,
              nama: data.nama,
              no_hp: data.phone,
              role: data.role,
            },
          ]);
        } catch {
          // Table insert failure is non-fatal if profiles table isn't created yet
        }

        const profile: UserProfile = {
          id: authData.user.id,
          email: cleanEmail,
          name: data.nama,
          role: data.role,
          phone: data.phone,
        };
        setUser(profile);
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mendaftar.";
      return { success: false, error: msg };
    }
  };

  // Demo mode login for testing offline or presentation
  const demoLogin = (role: UserRole) => {
    const demoProfile: UserProfile = {
      id: role === "admin" ? "demo-admin-id" : "demo-warga-id",
      email: role === "admin" ? "admin@desa.id" : "warga@desa.id",
      name: role === "admin" ? "Admin Desa" : "Warga Desa",
      role: role,
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
