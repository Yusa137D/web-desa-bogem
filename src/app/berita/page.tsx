"use client";

import { useState } from "react";
import Link from "next/link";
import { useBerita } from "@/hooks/useBerita";
import { formatDateIndonesian } from "@/utils/formatters";
import {
  Newspaper,
  Calendar,
  ArrowRight,
  Loader2,
  Image as ImageIcon,
  Search,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { KATEGORI_BERITA_PRESETS } from "@/types/berita";

export default function BeritaPage() {
  const { data: listBerita, loading } = useBerita();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const categories = ["Semua", ...KATEGORI_BERITA_PRESETS];

  const filteredBerita = listBerita.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.konten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ringkasan && item.ringkasan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory =
      selectedCategory === "Semua" ||
      (item.kategori && item.kategori.toLowerCase() === selectedCategory.toLowerCase());

    return matchSearch && matchCategory;
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-28 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-[#00321F] via-[#004A2F] to-[#006643] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 sm:w-72 sm:h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white px-3 py-1 rounded-full text-xs font-bold transition backdrop-blur border border-emerald-400/20 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda</span>
              </Link>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Newspaper className="w-3.5 h-3.5" />
                <span>Kabar & Warta Desa</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Warta & Informasi Desa
            </h1>

            <p className="text-emerald-100/90 text-xs sm:text-sm lg:text-base leading-relaxed">
              Publikasi resmi pengumuman pemerintah desa, laporan pembangunan, agenda posyandu, dan dokumentasi kegiatan masyarakat Desa Bogem.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Horizontally scrollable category pills on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap active:scale-95 ${
                  selectedCategory === cat
                    ? "bg-[#004329] text-white shadow-emerald-900/10"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari judul atau topik berita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-[#004329] space-y-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-bold text-slate-500">Memuat kabar warta desa...</p>
          </div>
        ) : filteredBerita.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-2">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Tidak ada berita ditemukan</h3>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau kategori filter di atas.</p>
          </div>
        ) : (
          /* Berita Cards Grid with Banner Photo */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredBerita.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* News Banner Photo with Link */}
                <Link href={`/berita/${item.id}`} className="block relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  {item.gambar ? (
                    <img
                      src={item.gambar}
                      alt={item.judul}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold">
                      <ImageIcon className="w-10 h-10 stroke-[1.5]" />
                    </div>
                  )}
                  {item.created_at && (
                    <div className="absolute top-3 left-3 bg-[#004329]/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center space-x-1.5">
                      <Calendar className="w-3 h-3 text-emerald-300 flex-shrink-0" />
                      <span>{formatDateIndonesian(item.created_at)}</span>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {item.kategori && (
                      <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {item.kategori}
                      </span>
                    )}

                    <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#004329] transition line-clamp-2 leading-snug">
                      <Link href={`/berita/${item.id}`}>
                        {item.judul}
                      </Link>
                    </h2>
                    
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {item.ringkasan || item.konten}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/berita/${item.id}`}
                      className="text-xs font-bold text-emerald-800 flex items-center space-x-1 group-hover:translate-x-1 transition"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}