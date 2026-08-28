"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isValidGmail } from "@/utils/validators";
import { User, Lock, Mail, ArrowRight, Store, AlertCircle, Eye, EyeOff, Loader2, CreditCard } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "";
  const { loginWithSupabase, user } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push(redirectPath || "/");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const clean = identifier.trim();
    const isNik = /^[0-9]{16}$/.test(clean);

    if (!isNik && !isValidGmail(clean) && !clean.includes("@")) {
      setError("Masukkan 16 digit NIK KTP atau Alamat Email yang valid.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);

    const res = await loginWithSupabase(clean, password);

    if (!res.success) {
      setError(res.error || "Gagal masuk. Silakan periksa kembali data Anda.");
      setLoading(false);
    } else {
      setLoading(false);
      router.push(redirectPath || "/");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-[#004329] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <Store className="w-6 h-6 text-emerald-300" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Masuk Akun Warga</h1>
          <p className="text-xs text-slate-500">
            Masuk dengan NIK KTP (16 Digit) atau Alamat Email terdaftar
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 space-y-6">
          
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-medium flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                <span>NIK KTP atau Alamat Email</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  16 Digit / Email
                </span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: 3520xxxxxxxxxxxx atau budi@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md mt-2 disabled:opacity-70 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun Warga</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Belum punya akun warga?{" "}
              <Link href={`/register${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} className="font-bold text-[#004329] hover:underline">
                Daftar Akun Baru
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004329]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
