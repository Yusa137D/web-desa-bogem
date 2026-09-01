"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { isValidNIK, isValidPhone } from "@/utils/validators";
import {
  CreditCard,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import Link from "next/link";

function LengkapiProfilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/layanan-surat";
  const { user, updateProfile, logout, loading: authLoading } = useAuth();

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  } | null>(null);

  const [checkingSession, setCheckingSession] = useState(true);
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 1. Initial Session Check: Fetch directly from Supabase session
  useEffect(() => {
    let isMounted = true;

    async function checkCurrentSession() {
      try {
        if (!supabase) {
          if (isMounted) setCheckingSession(false);
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const activeUser = sessionData.session?.user;

        if (!activeUser) {
          if (!authLoading && isMounted) {
            router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
          }
          if (isMounted) setCheckingSession(false);
          return;
        }

        // Active user found
        const meta = activeUser.user_metadata || {};
        const googleName =
          meta.full_name ||
          meta.name ||
          meta.nama ||
          activeUser.email?.split("@")[0] ||
          "Warga Desa";
        const avatarUrl = meta.avatar_url || meta.picture || "";

        if (isMounted) {
          setCurrentUser({
            id: activeUser.id,
            email: activeUser.email || "",
            name: googleName,
            avatar_url: avatarUrl,
          });
        }

        // Fetch existing database profile if any
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", activeUser.id)
          .maybeSingle();

        if (isMounted) {
          if (profile?.nama) setNama(profile.nama);
          else setNama(googleName);

          if (profile?.nik) setNik(profile.nik);
          if (profile?.no_hp) setPhone(profile.no_hp);

          // If the profile is ALREADY completely filled with valid 16-digit NIK and phone, redirect forward
          const isComplete = Boolean(
            profile?.nik &&
            /^[0-9]{16}$/.test(profile.nik.trim()) &&
            profile?.no_hp &&
            profile.no_hp.trim().length >= 9
          );

          if (isComplete) {
            router.replace(redirectPath);
            return;
          }

          setCheckingSession(false);
        }
      } catch (err) {
        console.warn("LengkapiProfil init error:", err);
        if (isMounted) setCheckingSession(false);
      }
    }

    checkCurrentSession();

    return () => {
      isMounted = false;
    };
  }, [authLoading, redirectPath, router]);

  // Sync from AuthContext user if available
  useEffect(() => {
    if (user) {
      if (!currentUser) {
        setCurrentUser({
          id: user.id || "",
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
        });
      }
      if (!nama && user.name && user.name !== "Warga Desa" && user.name !== "User Desa") {
        setNama(user.name);
      }
      if (!phone && user.phone) {
        setPhone(user.phone);
      }
      if (!nik && user.nik) {
        setNik(user.nik);
      }
    }
  }, [user, currentUser, nama, phone, nik]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanNik = nik.replace(/[^0-9]/g, "").trim();

    if (!isValidNIK(cleanNik)) {
      setError("NIK wajib 16 digit angka sesuai KTP Anda.");
      return;
    }

    if (!nama || nama.trim().length < 2) {
      setError("Silakan masukkan nama lengkap yang valid sesuai KTP.");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Nomor WhatsApp / HP tidak valid. Contoh: 081234567890");
      return;
    }

    setSaving(true);

    const res = await updateProfile({
      nik: cleanNik,
      nama: nama.trim(),
      phone: phone.trim(),
    });

    setSaving(false);

    if (!res.success) {
      setError(res.error || "Gagal menyimpan data profil warga.");
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.replace(redirectPath);
      }, 1000);
    }
  };

  if (checkingSession && authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#004329]" />
        <span className="text-xs font-bold text-slate-600">Menyiapkan Form Data Warga...</span>
      </div>
    );
  }

  const activeEmail = currentUser?.email || user?.email || "";
  const activeName = currentUser?.name || user?.name || "Akun Google";
  const activeAvatar = currentUser?.avatar_url || user?.avatar_url || "";

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        
        {/* Header Logo & Title */}
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
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tahap 2: Data Kependudukan Warga</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Lengkapi Data Profil</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Email Anda telah terverifikasi. Masukkan NIK KTP Anda untuk mengaktifkan akses Layanan Surat Mandiri Desa Bogem secara resmi.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Email Verified Badge Card */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden flex-shrink-0">
                {activeAvatar ? (
                  <img src={activeAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{activeName.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-emerald-950 block truncate">{activeName}</span>
                <span className="text-[11px] text-emerald-700 font-mono block truncate">{activeEmail}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1 flex-shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Email Terverifikasi</span>
            </span>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Data profil berhasil disimpan! Mengalihkan ke layanan surat...</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-medium flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* NIK Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                <span>NIK KTP (16 Digit)</span>
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs text-slate-800 font-bold tracking-wider font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">NIK diperlukan untuk validasi legalitas dokumen permohonan surat warga.</span>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Nama Lengkap (Sesuai KTP)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* No. WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                <span>No. WhatsApp / HP Aktif</span>
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                  Untuk Notifikasi Surat
                </span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs text-slate-800 font-medium font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || success}
              className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md mt-2 disabled:opacity-70 active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Data Profil...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Simpan Data Profil & Lanjutkan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Account / Logout option */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-600 transition font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Gunakan Akun Google Lain / Keluar</span>
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function LengkapiProfilPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#004329]" />
        </div>
      }
    >
      <LengkapiProfilForm />
    </Suspense>
  );
}
