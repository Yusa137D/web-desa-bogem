"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2, ArrowLeft, KeyRound, CreditCard, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { isValidGmail, validatePassword } from "@/utils/validators";
import OtpCodeInput from "@/components/auth/OtpCodeInput";

function ForgotPasswordForm() {
  const router = useRouter();
  const { verifyRecoveryOtp, resendRecoveryOtp } = useAuth();

  // Step 1: Identifier (NIK / Email)
  // Step 2: OTP Verification
  // Step 3: New Password Creation
  const [step, setStep] = useState<"identifier" | "otp" | "new_password">("identifier");

  const [identifier, setIdentifier] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // New Password State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passReqs = validatePassword(password);

  // STEP 1: Request Recovery OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const clean = identifier.trim();
    if (!clean) {
      setError("Silakan masukkan NIK KTP atau Alamat Email Anda.");
      return;
    }

    setLoading(true);

    try {
      let resolvedEmail = clean.toLowerCase();
      const isNik = /^[0-9]{16}$/.test(clean);

      // If citizen inputs 16-digit NIK, lookup registered email from profiles table
      if (isNik) {
        if (!supabase) {
          setError("Layanan database belum siap.");
          setLoading(false);
          return;
        }

        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("email")
          .eq("nik", clean)
          .maybeSingle();

        if (profileErr || !profile?.email) {
          setError("NIK tidak terdaftar di sistem desa. Periksa kembali NIK KTP Anda.");
          setLoading(false);
          return;
        }
        resolvedEmail = profile.email.toLowerCase();
      } else if (!isValidGmail(resolvedEmail) && !resolvedEmail.includes("@")) {
        setError("Alamat email tidak valid.");
        setLoading(false);
        return;
      }

      setTargetEmail(resolvedEmail);

      const res = await resendRecoveryOtp(resolvedEmail);

      setLoading(false);

      if (!res.success) {
        let msg = res.error || "Gagal mengirim kode OTP.";
        if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("exceeded")) {
          msg = "Batas pengiriman email tercapai. Silakan coba kembali dalam beberapa saat.";
        }
        setError(msg);
      } else {
        setStep("otp");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  // STEP 2: Verify Recovery OTP Code
  const handleVerifyOtp = async (code: string) => {
    setError("");
    setVerifyingOtp(true);

    const res = await verifyRecoveryOtp(targetEmail, code);

    setVerifyingOtp(false);

    if (!res.success) {
      setError(res.error || "Kode OTP pemulihan tidak valid.");
    } else {
      setStep("new_password");
    }
  };

  // STEP 3: Submit New Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
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

    if (!supabase) {
      setError("Layanan database belum siap.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: password,
      });

      setLoading(false);

      if (updateErr) {
        setError(updateErr.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setError("Terjadi kesalahan saat menyimpan kata sandi.");
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
          <h1 className="text-2xl font-bold text-slate-900">Pemulihan Kata Sandi</h1>
          <p className="text-xs text-slate-500">
            {step === "identifier" && "Masukkan NIK KTP atau Email untuk menerima 6-Digit Kode OTP"}
            {step === "otp" && "Masukkan 6-Digit Kode OTP yang dikirim ke email Anda"}
            {step === "new_password" && "Buat kata sandi baru yang aman untuk akun warga Anda"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-medium flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================== */}
          {/* STEP 1: FORM INPUT NIK / EMAIL */}
          {/* ========================================================== */}
          {step === "identifier" && (
            <>
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                    <span>NIK KTP atau Alamat Email</span>
                    <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md mt-2 disabled:opacity-70 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Kode OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Kode OTP Pemulihan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ingat kata sandi? Masuk di sini</span>
                </Link>
              </div>
            </>
          )}

          {/* ========================================================== */}
          {/* STEP 2: VERIFIKASI KODE OTP 6-DIGIT */}
          {/* ========================================================== */}
          {step === "otp" && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200 py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <KeyRound className="w-8 h-8 text-emerald-700" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full inline-block border border-emerald-200">
                  Verifikasi Pemulihan
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Masukkan Kode OTP 6-Digit
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Kode verifikasi pemulihan kata sandi telah dikirim ke: <br />
                  <strong className="text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">{targetEmail}</strong>
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto pt-1">
                  Periksa inbox atau folder spam email Anda dan masukkan 6 digit angka di bawah ini.
                </p>
              </div>

              <OtpCodeInput
                email={targetEmail}
                onComplete={handleVerifyOtp}
                onResend={() => resendRecoveryOtp(targetEmail)}
                loading={verifyingOtp}
              />

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setStep("identifier");
                    setError("");
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 transition font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ubah NIK / Email Lain</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* STEP 3: BUAT KATA SANDI BARU */}
          {/* ========================================================== */}
          {step === "new_password" && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              {success ? (
                <div className="space-y-4 text-center py-4 animate-in fade-in">
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
                <form onSubmit={handleUpdatePassword} className="space-y-4">
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
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Real-time Checklist */}
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
                    className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md mt-2 disabled:opacity-70 active:scale-95"
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
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#004329]" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
