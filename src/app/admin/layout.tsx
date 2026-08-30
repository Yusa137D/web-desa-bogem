"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading, loginWithSupabase, logout } = useAuth();

  // Form states
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const cleanUser = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    try {
      const res = await loginWithSupabase(cleanUser, cleanPass);
      if (!res.success) {
        setErrorMsg(res.error || "Email atau kata sandi admin tidak sesuai. Silakan periksa kembali.");
      }
    } catch {
      setErrorMsg("Gagal memverifikasi akun admin. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Loading state while verifying auth session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#063321] animate-spin" />
        <div className="text-slate-600 text-xs font-semibold">
          Memverifikasi Hak Akses Pengelola Desa...
        </div>
      </div>
    );
  }

  // If user is not logged in or role is not admin, show Admin Login Gate
  if (!user || user.role !== "admin") {
    return (
      <main className="min-h-screen bg-[#063321] flex flex-col justify-center items-center p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="w-full max-w-md space-y-6 relative z-10">
          {/* Back to Public Web */}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-100 hover:text-white transition bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full border border-white/10 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Website Utama</span>
          </Link>

          {/* Login Card */}
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-16 flex items-center justify-center mx-auto">
                <img
                  src="/images/logo-magetan.png"
                  alt="Logo Kabupaten Magetan"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Login Pengelola Desa
              </h1>
              <p className="text-xs text-slate-500">
                Pemerintah Desa Bogem, Kec. Kawedanan, Kab. Magetan
              </p>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {user && user.role !== "admin" && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3.5 rounded-2xl flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Akun Anda ({user.email}) terdaftar sebagai Warga, bukan Admin Desa. Silakan masuk menggunakan akun pengelola yang berwenang.</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase">
                  Email Admin
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@desabogem.id"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle kata sandi"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#063321] hover:bg-[#073d28] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? "Memverifikasi..." : "Masuk ke Panel Pengelola"}</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // If authenticated as admin, render Admin Layout with top control bar
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Admin Top Sticky Bar */}
      <header className="bg-[#063321] text-white sticky top-0 z-40 shadow-sm border-b border-emerald-900/60 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="flex items-center space-x-2.5 text-white font-bold text-xs sm:text-sm hover:text-emerald-200 transition"
            >
              <div className="w-6 h-7 flex-shrink-0 flex items-center justify-center">
                <img
                  src="/images/logo-magetan.png"
                  alt="Logo Magetan"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="hidden sm:inline">Panel Pengelola Desa Bogem</span>
              <span className="sm:hidden">Panel Admin</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="hidden md:inline-flex text-xs text-emerald-200/90 font-medium">
              {user.email}
            </span>
            <Link
              href="/"
              target="_blank"
              className="text-[11px] sm:text-xs text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition border border-white/10"
            >
              Buka Web Publik ↗
            </Link>
            <button
              onClick={handleLogout}
              className="text-[11px] sm:text-xs text-rose-200 hover:text-white bg-rose-900/40 hover:bg-rose-900/80 px-3 py-1.5 rounded-xl transition flex items-center space-x-1 border border-rose-500/20 active:scale-95"
              title="Keluar dari Panel Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content View */}
      <div className="flex-grow">{children}</div>
    </div>
  );
}
