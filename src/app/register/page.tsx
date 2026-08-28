"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isValidGmail, isValidPhone, isValidPassword, isValidNIK } from "@/utils/validators";
import { User, Lock, Mail, Phone, ArrowRight, Store, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, CreditCard, MailCheck, RefreshCw, LogIn } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "";
  const { registerWithSupabase, user } = useAuth();

  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

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

    // NIK validation
    if (!isValidNIK(nik)) {
      setError("NIK wajib 16 digit angka sesuai KTP Anda.");
      return;
    }

    // Form Client Validations
    if (!nama || nama.trim().length < 2) {
      setError("Silakan masukkan nama lengkap yang valid sesuai KTP.");
      return;
    }

    if (!isValidGmail(email)) {
      setError("Email wajib menggunakan domain Google Mail (@gmail.com). Contoh: nama@gmail.com");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Silakan masukkan nomor telepon/WhatsApp aktif yang valid.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok dengan kata sandi di atas.");
      return;
    }

    setLoading(true);

    const res = await registerWithSupabase({
      nik: nik.trim(),
      email,
      password,
      nama,
      phone,
      role: "warga",
    });

    if (!res.success) {
      setError(res.error || "Gagal melakukan pendaftaran.");
      setLoading(false);
    } else {
      setLoading(false);
      if (res.needsEmailConfirmation) {
        setEmailConfirmationRequired(true);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(redirectPath || "/");
        }, 1200);
      }
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    setResending(true);
    setResendStatus("");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });
      if (error) {
        setResendStatus("Gagal mengirim ulang: " + error.message);
      } else {
        setResendStatus("✓ Email konfirmasi baru telah dikirimkan ke inbox Anda.");
      }
    } catch {
      setResendStatus("Terjadi kesalahan jaringan.");
    } finally {
      setResending(false);
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
          <h1 className="text-2xl font-extrabold text-slate-900">Pendaftaran Akun Warga</h1>
          <p className="text-xs text-slate-500">
            Daftarkan NIK KTP Anda untuk mengajukan surat mandiri & layanan digital desa
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 space-y-6">
          
          {/* SCREEN: EMAIL CONFIRMATION SENT */}
          {emailConfirmationRequired ? (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-inner">
                <MailCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                  Langkah Terakhir
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Periksa Email Konfirmasi Anda
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Tautan aktivasi akun telah dikirim ke: <br />
                  <strong className="text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">{email}</strong>
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto pt-1">
                  Silakan buka inbox (atau folder spam) email Anda dan klik tautan konfirmasi untuk mengaktifkan akun warga Anda.
                </p>
              </div>

              {resendStatus && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
                  {resendStatus}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Link
                  href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                  className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Buka Halaman Masuk</span>
                </Link>

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-xl border border-slate-200 transition flex items-center justify-center space-x-1.5 text-xs active:scale-95 disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin text-emerald-700" : ""}`} />
                  <span>{resending ? "Mengirim Ulang..." : "Kirim Ulang Email Konfirmasi"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* FORM DAFTAR AKUN WARGA */
            <>
              {success && (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Pendaftaran berhasil! Mengalihkan ke sistem...</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-medium flex items-center space-x-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* NIK Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                    <span>NIK KTP (16 Digit)</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      Wajib Sesuai KTP
                    </span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Contoh: 3520xxxxxxxxxxxx"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-bold tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

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
                      placeholder="budi@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    No. HP / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
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
                      placeholder="Minimal 6 karakter"
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md mt-2 disabled:opacity-70 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Akun Warga Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Sudah punya akun warga?{" "}
                  <Link href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} className="font-bold text-[#004329] hover:underline">
                    Masuk di Sini
                  </Link>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004329]" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
