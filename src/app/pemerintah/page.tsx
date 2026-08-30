"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  ShieldCheck,
  Landmark,
  Network,
  ArrowLeft,
  Search,
} from "lucide-react";
import { fetchPerangkatList, fallbackPerangkatList } from "@/services/perangkatService";
import { PerangkatItem } from "@/types/perangkat";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

export default function PemerintahPage() {
  const [perangkatList, setPerangkatList] = useState<PerangkatItem[]>(fallbackPerangkatList);
  const [loading, setLoading] = useState(false);
  const [filterKategori, setFilterKategori] = useState<string>("semua");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchPerangkatList();
        setPerangkatList(data);
      } catch (err) {
        console.error("Failed to load perangkat list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredList = perangkatList.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jabatan.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (filterKategori === "pimpinan") {
      return (
        item.jabatan.toLowerCase().includes("kepala desa") ||
        item.jabatan.toLowerCase().includes("sekretaris")
      );
    }
    if (filterKategori === "kaur") {
      return item.jabatan.toLowerCase().includes("kaur") || item.jabatan.toLowerCase().includes("urusan");
    }
    if (filterKategori === "kasi") {
      return item.jabatan.toLowerCase().includes("kasi") || item.jabatan.toLowerCase().includes("seksi");
    }
    if (filterKategori === "kasun") {
      return item.jabatan.toLowerCase().includes("dusun") || item.jabatan.toLowerCase().includes("kasun");
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-28 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* 1. Header Banner */}
        <div className="bg-[#073623] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-3 sm:space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/#sotk"
                className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white px-3 py-1 rounded-full text-xs font-semibold transition border border-white/10 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda</span>
              </Link>
              <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-500/40 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-emerald-300" />
                <span>SOTK Pemerintah Desa</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Pemerintah Desa Bogem
            </h1>

            <p className="text-emerald-100/85 text-xs sm:text-sm lg:text-base leading-relaxed">
              Daftar susunan aparatur dan perangkat Pemerintah Desa Bogem, Kecamatan Kawedanan, Kabupaten Magetan yang berdedikasi melayani seluruh kebutuhan masyarakat secara prima dan transparan.
            </p>
          </div>
        </div>

        {/* 2. Bagan Tata Hubungan & Hierarki Ringkas */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex items-center space-x-3 text-emerald-900 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-100">
              <Network className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Hierarki Tata Kerja Pemerintahan</h2>
              <p className="text-xs text-slate-500">Alur koordinasi dan penugasan aparatur Desa Bogem</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center text-xs">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              <span className="font-bold text-[#063321] block text-sm mb-1">Kepala Desa</span>
              <span className="text-slate-600 leading-relaxed">Pimpinan Tertinggi & Penanggung Jawab Kebijakan Desa</span>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              <span className="font-bold text-[#063321] block text-sm mb-1">Sekretariat Desa</span>
              <span className="text-slate-600 leading-relaxed">Sekretaris Desa membawahi Kaur Keuangan, Umum, & Perencanaan</span>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              <span className="font-bold text-[#063321] block text-sm mb-1">Pelaksana Teknis</span>
              <span className="text-slate-600 leading-relaxed">Kasi Pemerintahan, Kasi Kesejahteraan, & Kasi Pelayanan</span>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              <span className="font-bold text-[#063321] block text-sm mb-1">Pelaksana Wilayah</span>
              <span className="text-slate-600 leading-relaxed">Kepala Dusun (Kasun) membina wilayah rukun warga</span>
            </div>
          </div>
        </section>

        {/* 3. Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Category Pills with horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "semua", label: "Semua Perangkat" },
              { id: "pimpinan", label: "Pimpinan" },
              { id: "kaur", label: "Kaur" },
              { id: "kasi", label: "Kasi" },
              { id: "kasun", label: "Kasun" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterKategori(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap active:scale-95 ${
                  filterKategori === tab.id
                    ? "bg-[#063321] text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 shadow-sm"
            />
          </div>
        </div>

        {/* 4. Complete SOTK Member Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Memuat data aparatur pemerintah desa...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Tidak ada perangkat ditemukan</h3>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau filter kategori di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {filteredList.map((p) => {
              const isKades =
                p.jabatan.toLowerCase().includes("kepala desa") &&
                !p.jabatan.toLowerCase().includes("dusun");
              const isSekdes = p.jabatan.toLowerCase().includes("sekretaris");

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border transition-all duration-200 flex flex-col justify-between space-y-3 group hover:shadow-md ${
                    isKades
                      ? "border-emerald-300 shadow-sm ring-1 ring-emerald-500/30"
                      : isSekdes
                      ? "border-emerald-200/90 shadow-sm"
                      : "border-slate-200/80 shadow-sm hover:border-slate-300"
                  }`}
                >
                  {/* Portrait photo */}
                  <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <ImageWithSkeleton
                      src={p.foto}
                      alt={p.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackIcon={<UserCheck className="w-10 h-10 sm:w-14 sm:h-14 text-slate-300" />}
                    />

                    {isKades && (
                      <div className="absolute top-2 left-2 bg-[#063321] text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full shadow flex items-center space-x-1 border border-emerald-400/30 z-10">
                        <Landmark className="w-2.5 h-2.5 text-emerald-300" />
                        <span>Pimpinan</span>
                      </div>
                    )}
                  </div>

                  {/* Member info */}
                  <div className="space-y-1 text-center">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold truncate max-w-full ${
                          isKades
                            ? "bg-[#063321] text-white"
                            : isSekdes
                            ? "bg-emerald-100 text-emerald-900 font-bold"
                            : "bg-emerald-50 text-emerald-900 border border-emerald-200/80"
                        }`}
                      >
                        {p.jabatan}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                      {p.nama}
                    </h3>

                    <p className="text-[10px] text-slate-500 font-medium">
                      Pemerintah Desa Bogem
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
