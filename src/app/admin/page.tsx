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
    <main className="min-h-screen bg-[#F8FAFC] pb-24 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Website Utama</span>
          </Link>
          <div className="inline-flex items-center space-x-1.5 text-xs text-slate-500 font-semibold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            <Settings className="w-3.5 h-3.5 text-emerald-700" />
            <span>Mode Pengelola Desa</span>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-[#073623] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-sm relative overflow-hidden">
          <div className="space-y-3 sm:space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-500/40 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Panel Pengelola Desa Bogem</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Portal Kelola Data Desa
            </h1>
            <p className="text-emerald-100/85 text-xs sm:text-sm leading-relaxed">
              Pusat pengelolaan mandiri data website Desa Bogem. Perubahan yang Anda simpan di sini akan langsung tampil pada website utama.
            </p>
          </div>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Permohonan Surat Online */}
          <Link
            href="/admin/surat"
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-emerald-200 transition-all duration-200 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition">
                Layanan Surat Online
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verifikasi permohonan surat warga (SKU, SKTM, Domisili, SKCK), buat draf cetak resmi, dan kirimkan via Email / WhatsApp.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition">
              <span>Buka Kelola Surat</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 2: Kelola Infografis, Demografi & APBDes */}
          <Link
            href="/admin/infografis"
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100">
                <PieChart className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition">
                Infografis, APBDes & IDM
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ubah jumlah penduduk, rasio gender, mata pencaharian, tingkat pendidikan, APBDes, dan Skor Status IDM desa.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition">
              <span>Buka Kelola Infografis</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 3: Kelola SOTK & Perangkat Desa */}
          <Link
            href="/admin/sotk"
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition">
                Kelola SOTK & Aparatur
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tambah, edit nama, jabatan, foto potret resmi, nomor WhatsApp, dan susunan hierarki aparatur pemerintahan desa.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition">
              <span>Buka Kelola SOTK</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 4: Kelola Profil, Kontak & Jam Pelayanan */}
          <Link
            href="/admin/profil-desa"
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition">
                Profil, Kontak & Jam Layanan
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sesuaikan visi misi, sambutan kades, bagan organisasi, serta jam pelayanan kantor, alamat, email, dan nomor WhatsApp resmi desa.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition">
              <span>Buka Kelola Profil & Kontak</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 5: Kelola Berita */}
          <Link
            href="/admin/berita"
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100">
                <Newspaper className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition">
                Kelola & Terbitkan Berita
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Publikasikan warta kegiatan kemasyarakatan baru, pengumuman pemerintah desa, atau kelola berita yang sudah terbit.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition">
              <span>Buka Kelola Berita</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 6: Kelola UMKM */}
          <Link
            href="/admin/umkm"
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 group flex flex-col justify-between active:scale-95"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition">
                Kelola Produk UMKM Desa
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Daftarkan produk karya warga lokal, foto produk, harga, deskripsi usaha, dan nomor pemesanan WhatsApp.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition">
              <span>Buka Kelola UMKM</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

        </div>

      </div>
    </main>
  );
}
