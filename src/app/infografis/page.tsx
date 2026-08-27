"use client";

import { useState, useEffect } from "react";
import {
  Users,
  PieChart,
  Wallet,
  MapPin,
  Briefcase,
  GraduationCap,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  fetchInfografisData,
  getLocalInfografis,
  defaultInfografisData,
} from "@/services/infografisService";
import { InfografisData } from "@/types/infografis";

export default function InfografisPage() {
  const [activeTab, setActiveTab] = useState<"penduduk" | "pekerjaan" | "apbd">("penduduk");
  
  // Safe initial state matches SSR
  const [data, setData] = useState<InfografisData>(defaultInfografisData);

  useEffect(() => {
    // 1. Immediate client cache hydration
    const local = getLocalInfografis();
    if (local) {
      setData(local);
    }

    // 2. Fetch latest data
    async function loadData() {
      try {
        const remote = await fetchInfografisData();
        setData(remote);
      } catch (err) {
        console.error("Error loading infografis:", err);
      }
    }
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("local_infografis_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("local_infografis_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const { demografi, pekerjaan, pendidikan, apbdes } = data;

  // Calculate sex ratio percentages
  const totalWarga = demografi.total_penduduk || (demografi.pria + demografi.wanita) || 1;
  const persenPria = ((demografi.pria / totalWarga) * 100).toFixed(1);
  const persenWanita = ((demografi.wanita / totalWarga) * 100).toFixed(1);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-28 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-br from-[#00321F] via-[#004A2F] to-[#006643] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <PieChart className="w-80 h-80 sm:w-96 sm:h-96 text-white" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white px-3 py-1 rounded-full text-xs font-bold transition backdrop-blur border border-emerald-400/20 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda</span>
              </Link>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Visualisasi Data Desa</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Infografis Desa Bogem
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm lg:text-base leading-relaxed">
              Sajian statistik transparan mengenai demografi kependudukan, mata pencaharian, tingkat pendidikan, dan struktur keuangan APBDes Pemerintah Desa Bogem.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/infografis/idm"
                className="inline-flex items-center space-x-2 bg-emerald-400 hover:bg-emerald-300 text-[#00321F] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow active:scale-95"
              >
                <span>Lihat Status IDM Desa</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs with horizontal scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
          <button
            onClick={() => setActiveTab("penduduk")}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "penduduk"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Demografi Penduduk</span>
          </button>
          <button
            onClick={() => setActiveTab("pekerjaan")}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "pekerjaan"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Pekerjaan & Pendidikan</span>
          </button>
          <button
            onClick={() => setActiveTab("apbd")}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "apbd"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>APBDes & Transparansi Anggaran</span>
          </button>
        </div>

        {/* Tab 1: Demografi Penduduk */}
        {activeTab === "penduduk" && (
          <div className="space-y-6">
            {/* Top Stat Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-1.5 sm:space-y-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-xl sm:text-3xl font-extrabold text-slate-900">
                  {demografi.total_penduduk.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500">Total Penduduk (Jiwa)</div>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-1.5 sm:space-y-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <span className="font-bold text-xs sm:text-sm">♂</span>
                </div>
                <div className="text-xl sm:text-3xl font-extrabold text-slate-900">
                  {demografi.pria.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500">
                  Laki-Laki ({persenPria}%)
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-1.5 sm:space-y-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <span className="font-bold text-xs sm:text-sm">♀</span>
                </div>
                <div className="text-xl sm:text-3xl font-extrabold text-slate-900">
                  {demografi.wanita.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500">
                  Perempuan ({persenWanita}%)
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-1.5 sm:space-y-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-xl sm:text-3xl font-extrabold text-slate-900">
                  {demografi.kepala_keluarga.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500">Kepala Keluarga (KK)</div>
              </div>
            </div>

            {/* Visual Progress Ratio */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
                <span>Rasio Komposisi Jenis Kelamin</span>
              </h3>
              <div className="w-full bg-slate-100 rounded-2xl h-9 overflow-hidden flex p-1 border border-slate-200/60">
                <div
                  style={{ width: `${persenPria}%` }}
                  className="bg-blue-600 h-full rounded-xl flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white shadow-sm transition-all duration-700"
                >
                  Laki-Laki {persenPria}%
                </div>
                <div
                  style={{ width: `${persenWanita}%` }}
                  className="bg-rose-500 h-full rounded-xl flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white shadow-sm ml-1 transition-all duration-700"
                >
                  Perempuan {persenWanita}%
                </div>
              </div>
            </div>

            {/* Wilayah Rincian */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                <span className="text-xs text-slate-500 block font-semibold">Luas Wilayah</span>
                <span className="text-base sm:text-lg font-extrabold text-[#00321F]">{demografi.luas_wilayah} Ha</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                <span className="text-xs text-slate-500 block font-semibold">Jumlah Dusun</span>
                <span className="text-base sm:text-lg font-extrabold text-[#00321F]">{demografi.jumlah_dusun} Dusun</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                <span className="text-xs text-slate-500 block font-semibold">Jumlah Rukun Warga</span>
                <span className="text-base sm:text-lg font-extrabold text-[#00321F]">{demografi.jumlah_rw} RW</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                <span className="text-xs text-slate-500 block font-semibold">Jumlah Rukun Tetangga</span>
                <span className="text-base sm:text-lg font-extrabold text-[#00321F]">{demografi.jumlah_rt} RT</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pekerjaan & Pendidikan */}
        {activeTab === "pekerjaan" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Mata Pencaharian */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Mata Pencaharian Utama</h3>
                  <p className="text-xs text-slate-500">Distribusi sektor pekerjaan warga</p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {pekerjaan.map((item) => (
                  <div key={item.nama} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.nama}</span>
                      <span>{item.count} ({item.persen}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                      <div
                        className={`${item.color || "bg-emerald-600"} h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${item.persen}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tingkat Pendidikan */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Tingkat Pendidikan</h3>
                  <p className="text-xs text-slate-500">Kualifikasi jenjang pendidikan warga</p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {pendidikan.map((item) => (
                  <div key={item.tingkat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.tingkat}</span>
                      <span>{item.count} ({item.persen}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${item.persen}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: APBDes Transparansi */}
        {activeTab === "apbd" && (
          <div className="space-y-6">
            {/* 3 Top Financial Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Pendapatan Desa</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    TA {apbdes.tahun_anggaran}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                  Rp {apbdes.pendapatan_total.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-slate-500">Dana Desa, ADD, PADes, Bagi Hasil Pajak</p>
              </div>

              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-[#004329] uppercase tracking-wider flex items-center justify-between">
                  <span>Belanja Desa</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                    TA {apbdes.tahun_anggaran}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Rp {apbdes.belanja_total.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-slate-500">Infrastruktur, Penyelenggaraan & Pemberdayaan</p>
              </div>

              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-2 sm:col-span-2 md:col-span-1">
                <div className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Surplus / SiLPA</span>
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                    TA {apbdes.tahun_anggaran}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-teal-700">
                  Rp {apbdes.surplus_defisit.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-slate-500">Sisa Lebih Perhitungan Anggaran Tahun Berjalan</p>
              </div>
            </div>

            {/* Rincian Pendapatan & Belanja 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Rincian Pendapatan */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-emerald-900">
                    Rincian Sumber Pendapatan Desa
                  </h3>
                  <span className="text-xs font-extrabold text-emerald-700">
                    Rp {apbdes.pendapatan_total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {apbdes.pendapatan_rincian.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50 last:border-0">
                      <span className="font-semibold text-slate-700">{item.nama}</span>
                      <span className="font-bold text-emerald-800">
                        Rp {item.nominal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rincian Belanja */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Rincian Bidang Belanja Desa
                  </h3>
                  <span className="text-xs font-extrabold text-slate-900">
                    Rp {apbdes.belanja_total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {apbdes.belanja_rincian.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50 last:border-0">
                      <span className="font-semibold text-slate-700">{item.nama}</span>
                      <span className="font-bold text-slate-900">
                        Rp {item.nominal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Banner Transparansi */}
            <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Transparansi Keuangan Publik</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold">Laporan Realisasi APBDes Tahun {apbdes.tahun_anggaran}</h4>
                <p className="text-xs text-emerald-200/80">
                  Seluruh penerimaan dan belanja keuangan desa dikelola secara akuntabel, transparan, dan dapat dipertanggungjawabkan kepada seluruh warga Desa Bogem.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
