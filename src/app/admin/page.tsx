"use client";

import Link from "next/link";
import {
  Newspaper,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Users,
  Target,
  ArrowLeft,
  Settings,
  PieChart,
  FileText,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#004329] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Website Utama</span>
          </Link>
          <div className="inline-flex items-center space-x-1.5 text-xs text-slate-500 font-semibold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            <Settings className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mode Pengelola Desa</span>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-[#00321F] via-[#004A2F] to-[#006643] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panel Pengelola Desa Bogem</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Portal Kelola Data Desa
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Pusat pengelolaan mandiri data website Desa Bogem. Perubahan yang Anda simpan di sini akan langsung tampil pada website utama.
          </p>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Permohonan Surat Online (Baru & Unggulan) */}
          <Link
            href="/admin/surat"
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border-2 border-emerald-500/40 hover:border-emerald-600 transition-all duration-300 group flex flex-col justify-between active:scale-95 ring-4 ring-emerald-500/10"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 text-[#004329] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#004329] transition">
                Layanan Surat Online
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verifikasi permohonan surat warga (SKU, SKTM, Domisili, SKCK), buat draf cetak resmi, dan kirimkan via Email / WhatsApp.
              </p>
            </div>
            <div className="pt-5 flex items-center text-xs font-bold text-[#004329] group-hover:translate-x-1 transition">
              <span>Buka Kelola Surat</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Card 2: Kelola Infografis, Demografi & APBDes */}
          <Link
            href="/admin/infografis"
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-[#004329] flex items-center justify-center group-hover:scale-110 transition-transform">
                <PieChart className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#004329] transition">
                Infografis, APBDes & IDM
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ubah jumlah penduduk, rasio gender, mata pencaharian, tingkat pendidikan, APBDes, dan Skor Status IDM desa.
              </p>
            </div>
            <div className="pt-5 flex items-center text-xs font-bold text-[#004329] group-hover:translate-x-1 transition">
              <span>Buka Kelola Infografis</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Card 3: Kelola SOTK & Perangkat Desa */}
          <Link
            href="/admin/sotk"
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-[#004329] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#004329] transition">
                Kelola SOTK & Aparatur
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tambah, edit nama, jabatan, foto potret resmi, nomor WhatsApp, dan susunan hierarki aparatur pemerintahan desa.
              </p>
            </div>
            <div className="pt-5 flex items-center text-xs font-bold text-[#004329] group-hover:translate-x-1 transition">
              <span>Buka Kelola SOTK</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Card 4: Kelola Profil, Kontak & Jam Pelayanan */}
          <Link
            href="/admin/profil-desa"
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-[#004329] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#004329] transition">
                Profil, Kontak & Jam Layanan
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sesuaikan visi misi, sambutan kades, bagan organisasi, serta <strong>jam pelayanan kantor, alamat, email, dan nomor WhatsApp</strong> resmi desa.
              </p>
            </div>
            <div className="pt-5 flex items-center text-xs font-bold text-[#004329] group-hover:translate-x-1 transition">
              <span>Buka Kelola Profil & Kontak</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Card 5: Kelola Berita */}
          <Link
            href="/admin/berita"
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-[#004329] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#004329] transition">
                Kelola & Terbitkan Berita
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Publikasikan warta kegiatan kemasyarakatan baru, pengumuman pemerintah desa, atau kelola berita yang sudah terbit.
              </p>
            </div>
            <div className="pt-5 flex items-center text-xs font-bold text-[#004329] group-hover:translate-x-1 transition">
              <span>Buka Kelola Berita</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Card 6: Kelola UMKM */}
          <Link
            href="/admin/umkm"
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-[#004329] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#004329] transition">
                Kelola Produk UMKM Desa
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Daftarkan produk karya warga lokal, foto produk, harga, deskripsi usaha, dan nomor pemesanan WhatsApp.
              </p>
            </div>
            <div className="pt-5 flex items-center text-xs font-bold text-[#004329] group-hover:translate-x-1 transition">
              <span>Buka Kelola UMKM</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

        </div>

      </div>
    </main>
  );
}
