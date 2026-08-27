"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Form states
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if session exists in localStorage
    const session = localStorage.getItem("bogem_admin_session");
    if (session === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const cleanUser = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Check credentials:
    // Email/Username: "admindesabogem@gmail.com" or "admindesabogem"
    // Password: "Bogem241"
    const validUsername =
      cleanUser === "admindesabogem@gmail.com" ||
      cleanUser === "admindesabogem" ||
      cleanUser === "admindesabogem@desa.id";
    const validPassword = cleanPass === "Bogem241";

    setTimeout(() => {
      if (validUsername && validPassword) {
        localStorage.setItem("bogem_admin_session", "true");
        setIsAuthenticated(true);
        setErrorMsg("");
      } else {
        setErrorMsg("Email atau kata sandi tidak sesuai. Silakan periksa kembali.");
      }
      setLoading(false);
    }, 400);
  };

  const handleLogout = () => {
    localStorage.removeItem("bogem_admin_session");
    setIsAuthenticated(false);
    setEmailInput("");
    setPasswordInput("");
    setErrorMsg("");
  };

  // Prevent flash before hydration mount
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-pulse text-emerald-800 text-sm font-bold">
          Memuat Panel Desa...
        </div>
      </div>
    );
  }

  // If not authenticated, show Admin Login Gate
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#002517] via-[#003822] to-[#004D2E] flex flex-col justify-center items-center p-4 sm:p-6 text-white relative overflow-hidden">
        
        {/* Subtle decorative background lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-6 relative z-10">
          
          {/* Back to Public Web */}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-200 hover:text-white transition bg-white/10 hover:bg-white/20 backdrop-blur px-3.5 py-1.5 rounded-full border border-emerald-400/20 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Website Utama</span>
          </Link>

          {/* Login Card */}
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6 animate-in fade-in zoom-in duration-300">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-16 flex items-center justify-center mx-auto">
                <img
                  src="/images/logo-magetan.png"
                  alt="Logo Kabupaten Magetan"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
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

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Email Admin
                </label>
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Masukkan email / username..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
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
                className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition shadow-lg hover:shadow-emerald-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
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

  // If authenticated, render Admin Layout with top control bar
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Admin Top Sticky Bar */}
      <header className="bg-[#002B1B] text-white sticky top-0 z-40 shadow-sm border-b border-emerald-800/60 px-4 sm:px-6 lg:px-8 py-3">
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
            <Link
              href="/"
              target="_blank"
              className="text-[11px] sm:text-xs text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition border border-emerald-400/20"
            >
              Buka Web Publik ↗
            </Link>
            <button
              onClick={handleLogout}
              className="text-[11px] sm:text-xs text-rose-200 hover:text-white bg-rose-900/60 hover:bg-rose-800 px-3 py-1.5 rounded-xl transition flex items-center space-x-1 border border-rose-500/30 active:scale-95"
              title="Kunci Akses / Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Kunci Akses</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content View */}
      <div className="flex-grow">{children}</div>
    </div>
  );
}
