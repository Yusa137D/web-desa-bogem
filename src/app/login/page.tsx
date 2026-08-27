"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import { isValidGmail } from "@/utils/validators";
import { ShieldCheck, User, Lock, Mail, ArrowRight, Store, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithSupabase, demoLogin, user } = useAuth();

  const [role, setRole] = useState<UserRole>("warga");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Form Client Validation
    if (!isValidGmail(email)) {
      setError("Email wajib menggunakan format @gmail.com. Contoh: nama@gmail.com");
      return;
    }

    if (!password || password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);

    const res = await loginWithSupabase(email, password);

    if (!res.success) {
      setError(res.error || "Gagal masuk. Silakan coba lagi.");
      setLoading(false);
    } else {
      setLoading(false);
      router.push(role === "admin" ? "/admin" : "/");
    }
  };

  const handleQuickLogin = (selectedRole: UserRole) => {
    demoLogin(selectedRole);
    if (selectedRole === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
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
          <h1 className="text-2xl font-extrabold text-slate-900">Masuk ke Portal Desa</h1>
          <p className="text-xs text-slate-500">
            Masuk dengan akun Warga atau Perangkat Desa
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 space-y-6">
          
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole("warga")}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition ${
                role === "warga"
                  ? "bg-white text-[#004329] shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Warga Desa</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition ${
                role === "admin"
                  ? "bg-[#004329] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Desa</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-medium flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "admin@desa.id" : "warga@gmail.com"}
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
              className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md mt-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk sebagai {role === "admin" ? "Admin" : "Warga"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Uji Coba Langsung (Demo Mode)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("warga")}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold py-2.5 px-3 rounded-xl border border-emerald-200/60 transition flex items-center justify-center space-x-1"
              >
                <span>👤 Demo Warga</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold py-2.5 px-3 rounded-xl border border-amber-200/60 transition flex items-center justify-center space-x-1"
              >
                <span>🛡️ Demo Admin</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Belum punya akun?{" "}
              <Link href="/register" className="font-bold text-[#004329] hover:underline">
                Daftar Akun Baru
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
