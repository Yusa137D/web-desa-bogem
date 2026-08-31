"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isValidNIK, isValidPhone } from "@/utils/validators";
import {
  CreditCard,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Store,
} from "lucide-react";
import Link from "next/link";

function LengkapiProfilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/layanan-surat";
  const { user, updateProfile, loading: authLoading } = useAuth();

  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [alamat, setAlamat] = useState("");
  const [dusun, setDusun] = useState("Dusun I");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Initialize fields from user if available
  useEffect(() => {
    if (user) {
      if (user.nik) setNik(user.nik);
      if (user.name && user.name !== "User Desa" && user.name !== "Warga Desa") {
        setNama(user.name);
      }
      if (user.phone) setPhone(user.phone);
      if (user.alamat) setAlamat(user.alamat);

      // If user already has a complete profile with valid 16-digit NIK, redirect forward!
      if (user.isProfileComplete && user.nik && user.nik.length === 16 && user.phone) {
        router.push(redirectPath);
      }
    }
  }, [user, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidNIK(nik)) {
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

    const fullAlamat = dusun ? `${dusun}, ${alamat}`.trim() : alamat;

    const res = await updateProfile({
      nik: nik.trim(),
      nama: nama.trim(),
      phone: phone.trim(),
      alamat: fullAlamat,
    });

    setSaving(false);

    if (!res.success) {
      setError(res.error || "Gagal menyimpan data profil.");
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push(redirectPath);
      }, 1200);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#004329]" />
        <span className="text-xs font-bold text-slate-600">Memeriksa Akun...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        
        {/* Header Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-[#004329] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <Store className="w-6 h-6 text-emerald-300" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Lengkapi Profil Akun Warga</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Satu langkah terakhir untuk mengaktifkan akses layanan surat & administrasi Desa Bogem
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Google Connected Badge Card */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  user?.name?.charAt(0) || "G"
                )}
              </div>
              <div>
                <span className="font-bold text-emerald-950 block">{user?.name || "Akun Google"}</span>
                <span className="text-[11px] text-emerald-700 font-mono">{user?.email}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Terhubung</span>
            </span>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Data profil berhasil disimpan! Mengalihkan ke halaman layanan...</span>
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
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-bold tracking-wider font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">NIK diperlukan untuk validasi legalitas dokumen permohonan surat.</span>
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* No. WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                <span>No. WhatsApp / HP Aktif</span>
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium font-mono"
                />
              </div>
            </div>

            {/* Dusun / Alamat */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Alamat / Wilayah Dusun di Desa Bogem
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Dusun I", "Dusun II", "Dusun III"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDusun(d)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      dusun === d
                        ? "bg-[#004329] text-white border-[#004329] shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="RT / RW / Nama Jalan (Contoh: RT 02 / RW 01)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || success}
              className="w-full bg-[#004329] hover:bg-[#00321F] text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md mt-2 disabled:opacity-70 active:scale-95"
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
