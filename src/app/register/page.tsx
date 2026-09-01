"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isValidGmail, isValidPhone, isValidNIK, validatePassword } from "@/utils/validators";
import {
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  CreditCard,
  MailCheck,
  RefreshCw,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "";
  const { registerWithSupabase, resendVerificationEmail, loginWithGoogle, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passReqs = validatePassword(password);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // If already logged in, redirect safely
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !emailConfirmationRequired) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else if (user.isProfileComplete === false) {
        router.replace(`/lengkapi-profil${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`);
      } else {
        router.replace(redirectPath || "/");
      }
    }
  }, [user, redirectPath, router, emailConfirmationRequired]);

  // Cooldown timer for resend email
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidGmail(cleanEmail)) {
      setError("Email wajib menggunakan domain Google Mail (@gmail.com). Contoh: nama@gmail.com");
      return;
    }

    if (!passReqs.isValid) {
      setError("Kata sandi wajib minimal 8 karakter dan merupakan kombinasi huruf besar (A-Z), huruf kecil (a-z), dan angka (0-9).");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok dengan kata sandi di atas.");
      return;
    }

    setLoading(true);

    const res = await registerWithSupabase({
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Gagal melakukan pendaftaran.");
    } else {
      setRegisteredEmail(cleanEmail);
      if (res.needsEmailConfirmation) {
        setEmailConfirmationRequired(true);
        setResendCooldown(60);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/lengkapi-profil${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`);
        }, 1200);
      }
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);
    const res = await loginWithGoogle(redirectPath || "/lengkapi-profil");
    if (!res.success) {
      setError(res.error || "Gagal mendaftar dengan akun Google.");
      setGoogleLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const target = registeredEmail || email.trim();
    if (!target) return;
    if (resendCooldown > 0) return;

    setResending(true);
    setResendStatus("");

    const res = await resendVerificationEmail(target);
    setResending(false);

    if (!res.success) {
      setResendStatus(`Gagal mengirim ulang: ${res.error}`);
    } else {
      setResendStatus("✓ Tautan aktivasi baru berhasil dikirimkan ke Gmail Anda. Silakan cek Inbox atau folder Spam.");
      setResendCooldown(60);
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
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <span>Tahap 1: Registrasi Akun Warga</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Akun Baru</h1>
          <p className="text-xs text-slate-500">
            Daftarkan email Anda untuk verifikasi akun & akses layanan digital desa
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          
          {/* SCREEN: EMAIL CONFIRMATION SENT */}
          {emailConfirmationRequired ? (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200 py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <MailCheck className="w-8 h-8 text-emerald-700" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full inline-block border border-emerald-200">
                  Verifikasi Email Dikirim
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Periksa Kotak Masuk Gmail Anda
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Tautan aktivasi akun telah dikirimkan ke: <br />
                  <strong className="text-slate-900 font-mono text-sm bg-slate-100 px-2.5 py-1 rounded inline-block mt-1.5 border border-slate-200">
                    {registeredEmail || email}
                  </strong>
                </p>
                
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 text-left space-y-1 mt-3">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Langkah Selanjutnya:</span>
                  </div>
                  <ol className="text-[11px] text-amber-800 list-decimal list-inside space-y-1 pl-0.5">
                    <li>Buka Gmail (periksa folder <strong>Inbox / Spam / Promosi</strong>).</li>
                    <li>Klik tombol <strong>&quot;Confirm your mail&quot;</strong> pada email yang masuk.</li>
                    <li>Setelah aktif, Anda akan langsung diarahkan untuk <strong>mengisi data kependudukan (NIK KTP)</strong>.</li>
                  </ol>
                </div>
              </div>

              {resendStatus && (
                <div className={`p-3 rounded-xl text-xs font-semibold border ${
                  resendStatus.startsWith("✓") ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                }`}>
                  {resendStatus}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md active:scale-95"
                >
                  <span>Buka Web / Aplikasi Gmail ↗</span>
                </a>

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resending || resendCooldown > 0}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-xl border border-slate-200 transition flex items-center justify-center space-x-1.5 text-xs active:scale-95 disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin text-emerald-700" : ""}`} />
                  <span>
                    {resending
                      ? "Mengirim Ulang..."
                      : resendCooldown > 0
                      ? `Kirim Ulang Email (${resendCooldown}s)`
                      : "Kirim Ulang Email Konfirmasi"}
                  </span>
                </button>

                <div className="pt-2">
                  <Link
                    href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sudah klik konfirmasi di Gmail? Masuk di sini</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* FORM DAFTAR AKUN WARGA (TAHAP 1: EMAIL & PASSWORD) */
            <>
              {/* 1-Click Google Sign Up */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl border border-slate-300/90 transition flex items-center justify-center space-x-3 text-xs shadow-sm active:scale-95 disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{googleLoading ? "Menghubungkan ke Google..." : "Daftar Cepat dengan Akun Google"}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider absolute">
                  atau gunakan email gmail
                </span>
              </div>

              {success && (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Pendaftaran Berhasil! Membuka halaman berikutnya...</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-medium flex items-center space-x-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email (@gmail.com) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                    <span>Alamat Email Gmail</span>
                    <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                      @gmail.com
                    </span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="namaanda@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Tautan konfirmasi aktivasi akun akan dikirimkan ke Gmail ini.
                  </span>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                    <span>Kata Sandi</span>
                    <span className="text-[10px] text-slate-400 font-normal">Min. 8 Karakter</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs text-slate-800 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Real-time Password Requirements Checklist */}
                  {password.length > 0 && (
                    <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 animate-in fade-in duration-200">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                        Standar Kata Sandi Aman:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className={`flex items-center space-x-1.5 ${passReqs.hasMinLength ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${passReqs.hasMinLength ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-200 text-slate-500"}`}>
                            {passReqs.hasMinLength ? "✓" : "•"}
                          </span>
                          <span>Min. 8 karakter</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 ${passReqs.hasUpperCase ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${passReqs.hasUpperCase ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-200 text-slate-500"}`}>
                            {passReqs.hasUpperCase ? "✓" : "•"}
                          </span>
                          <span>Huruf besar (A-Z)</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 ${passReqs.hasLowerCase ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${passReqs.hasLowerCase ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-200 text-slate-500"}`}>
                            {passReqs.hasLowerCase ? "✓" : "•"}
                          </span>
                          <span>Huruf kecil (a-z)</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 ${passReqs.hasNumber ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${passReqs.hasNumber ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-200 text-slate-500"}`}>
                            {passReqs.hasNumber ? "✓" : "•"}
                          </span>
                          <span>Angka (0-9)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
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
                      placeholder="Ulangi kata sandi"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <span className="text-[10px] text-rose-500 mt-1 block">Konfirmasi kata sandi belum cocok.</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md mt-2 disabled:opacity-70 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mendaftarkan & Mengirim Email...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar & Kirim Email Verifikasi</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Sudah memiliki akun warga?{" "}
                  <Link
                    href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                    className="text-[#004329] font-bold hover:underline"
                  >
                    Masuk di sini
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#004329]" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
