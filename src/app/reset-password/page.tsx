"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, Store, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validatePassword } from "@/utils/validators";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passReqs = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passReqs.isValid) {
      setError("Kata sandi wajib minimal 8 karakter dan merupakan kombinasi huruf besar (A-Z), huruf kecil (a-z), dan angka (0-9).");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateErr) {
        setError(updateErr.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center group mb-1">
            <div className="relative w-12 h-14 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <img
                src="/images/logo-magetan.png"
                alt="Logo Kabupaten Magetan"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Buat Kata Sandi Baru</h1>
          <p className="text-xs text-slate-500">
            Masukkan kata sandi baru yang kuat dan aman untuk akun Anda
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          
          {success ? (
            <div className="space-y-4 text-center animate-in zoom-in-95 duration-200 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Kata Sandi Berhasil Diperbarui!</h2>
                <p className="text-xs text-slate-600">
                  Anda akan otomatis dialihkan ke halaman masuk dalam beberapa detik...
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 hover:underline"
                >
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-medium flex items-center space-x-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 karakter, huruf besar, kecil, angka"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs text-slate-800 font-medium"
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

                {/* Password Complexity Checklist */}
                {password.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Kriteria Keamanan Kata Sandi:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div className={`flex items-center space-x-1.5 ${passReqs.hasMinLength ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                        <span>{passReqs.hasMinLength ? "✓" : "○"} Min. 8 Karakter</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${passReqs.hasUpperCase ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                        <span>{passReqs.hasUpperCase ? "✓" : "○"} Huruf Besar (A-Z)</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${passReqs.hasLowerCase ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                        <span>{passReqs.hasLowerCase ? "✓" : "○"} Huruf Kecil (a-z)</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${passReqs.hasNumber ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                        <span>{passReqs.hasNumber ? "✓" : "○"} Angka (0-9)</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#063321] hover:bg-[#073d28] text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-sm mt-2 disabled:opacity-70 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Kata Sandi...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan Kata Sandi Baru</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#004329]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
