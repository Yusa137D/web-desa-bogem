"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2, ArrowLeft, KeyRound, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isValidGmail } from "@/utils/validators";

function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successEmail, setSuccessEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessEmail("");

    const clean = identifier.trim();
    if (!clean) {
      setError("Silakan masukkan NIK KTP atau Alamat Email Anda.");
      return;
    }

    setLoading(true);

    try {
      let targetEmail = clean.toLowerCase();
      const isNik = /^[0-9]{16}$/.test(clean);

      // If user inputs 16-digit NIK, lookup registered email from profiles table
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
          setError("NIK tidak terdaftar di sistem desa. Silakan periksa kembali NIK Anda.");
          setLoading(false);
          return;
        }
        targetEmail = profile.email.toLowerCase();
      } else if (!isValidGmail(targetEmail) && !targetEmail.includes("@")) {
        setError("Alamat email tidak valid.");
        setLoading(false);
        return;
      }

      if (!supabase) {
        setError("Layanan database belum siap.");
        setLoading(false);
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/reset-password`;

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo,
      });

      if (resetErr) {
        let msg = resetErr.message;
        if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("exceeded")) {
          msg = "Batas pengiriman email Supabase tercapai. Silakan coba kembali dalam beberapa saat.";
        }
        setError(msg);
      } else {
        setSuccessEmail(targetEmail);
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
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
            Masukkan NIK KTP atau Email untuk menerima tautan reset kata sandi
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          
          {successEmail ? (
            <div className="space-y-5 text-center animate-in zoom-in-95 duration-200 py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Tautan Reset Telah Dikirim!
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Kami telah mengirimkan tautan reset kata sandi ke: <br />
                  <strong className="text-slate-900 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">{successEmail}</strong>
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto pt-1">
                  Silakan buka inbox atau folder spam email Anda, lalu klik tautan tersebut untuk membuat kata sandi baru.
                </p>
              </div>

              <div className="pt-3">
                <Link
                  href="/login"
                  className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Halaman Masuk</span>
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
                      <span>Mengirim Tautan...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Tautan Reset Kata Sandi</span>
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
