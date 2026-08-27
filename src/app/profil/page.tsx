"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Target,
  MapPin,
  Compass,
  History,
  Network,
  Users,
  Layers,
  Sparkles,
  Landmark,
  ArrowRight,
  ZoomIn,
  Download,
  X,
  ImageIcon,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import VillageMap from "@/components/VillageMap";
import { fetchProfilDesa, getLocalProfil, defaultProfilDesa, defaultSejarahDesa, defaultBatasWilayah } from "@/services/profilService";
import { ProfilDesaData } from "@/types/profil";

export default function ProfilPage() {
  const [profilData, setProfilData] = useState<ProfilDesaData>(defaultProfilDesa);
  const [activeTab, setActiveTab] = useState<"semua" | "visi-misi" | "bagan" | "sejarah" | "geografis">("semua");
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    // 1. Immediately hydrate with cached local data
    const local = getLocalProfil();
    if (local && (local.visi || local.nama_kades)) {
      setProfilData(local);
    }

    // 2. Fetch fresh data in background
    async function loadData() {
      try {
        const profil = await fetchProfilDesa();
        if (profil) setProfilData(profil);
      } catch (err) {
        console.error("Error loading profil data:", err);
      }
    }
    loadData();

    const handleUpdate = () => {
      const updated = getLocalProfil();
      if (updated) setProfilData(updated);
    };

    window.addEventListener("local_profil_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("local_profil_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const batas = profilData.batas_wilayah || defaultBatasWilayah;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-28 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        
        {/* 1. Header Banner Profil Desa */}
        <div className="bg-gradient-to-br from-[#00321F] via-[#004A2F] to-[#006643] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Building2 className="w-80 h-80 sm:w-96 sm:h-96 text-white" />
          </div>
          <div className="relative z-10 space-y-3 sm:space-y-4 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Profil Pemerintahan Desa</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Profil Desa Bogem
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm lg:text-base leading-relaxed">
              Informasi lengkap mengenai visi dan misi pembangunan, bagan struktur organisasi tata kelola desa, asal-usul sejarah, serta peta kondisi geografis Desa Bogem, Kec. Kawedanan, Kab. Magetan.
            </p>
          </div>
        </div>

        {/* Quick Navigation Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none border-b border-slate-200/80">
          <button
            onClick={() => setActiveTab("semua")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-sm whitespace-nowrap active:scale-95 ${
              activeTab === "semua"
                ? "bg-[#004329] text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <span>Semua Bagian</span>
          </button>

          <button
            onClick={() => setActiveTab("visi-misi")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-sm whitespace-nowrap active:scale-95 ${
              activeTab === "visi-misi"
                ? "bg-[#004329] text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Visi & Misi</span>
          </button>

          <button
            onClick={() => setActiveTab("bagan")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-sm whitespace-nowrap active:scale-95 ${
              activeTab === "bagan"
                ? "bg-[#004329] text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Bagan Desa & BPD</span>
          </button>

          <button
            onClick={() => setActiveTab("sejarah")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-sm whitespace-nowrap active:scale-95 ${
              activeTab === "sejarah"
                ? "bg-[#004329] text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Sejarah Desa</span>
          </button>

          <button
            onClick={() => setActiveTab("geografis")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-sm whitespace-nowrap active:scale-95 ${
              activeTab === "geografis"
                ? "bg-[#004329] text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Peta & Geografis</span>
          </button>
        </div>

        {/* 2. SECTION: VISI & MISI DESA */}
        {(activeTab === "semua" || activeTab === "visi-misi") && (
          <section id="visi-misi" className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 space-y-6 sm:space-y-8">
              <div className="flex items-center space-x-3 text-[#004329] border-b border-slate-100 pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Visi & Misi Pembangunan</h2>
                  <p className="text-xs text-slate-500">Arah dan landasan strategis penyelenggaraan pemerintahan Desa Bogem</p>
                </div>
              </div>

              {/* Visi */}
              <div className="bg-emerald-50/80 p-5 sm:p-8 rounded-3xl border border-emerald-200/80 space-y-2 sm:space-y-3">
                <span className="inline-flex items-center space-x-1.5 text-[10px] sm:text-xs font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-100/90 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Visi Utama Desa</span>
                </span>
                <p className="text-base sm:text-xl lg:text-2xl font-bold text-[#00321F] italic leading-relaxed pt-1">
                  &ldquo;{profilData.visi || defaultProfilDesa.visi}&rdquo;
                </p>
              </div>

              {/* Misi */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Misi Pembangunan Desa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {(profilData.misi && profilData.misi.length > 0 ? profilData.misi : defaultProfilDesa.misi).map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-3.5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-extrabold text-xs shadow-sm mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. SECTION: BAGAN DESA & STRUKTUR ORGANISASI (BPD & PEMERINTAHAN) */}
        {(activeTab === "semua" || activeTab === "bagan") && (
          <section id="bagan" className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3 text-[#004329]">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                    <Network className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Bagan Desa</h2>
                    <p className="text-xs text-slate-500">Struktur Organisasi Pemerintahan Desa & Badan Permusyawaratan Desa</p>
                  </div>
                </div>

                <Link
                  href="/pemerintah"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition border border-emerald-200 self-start sm:self-auto active:scale-95"
                >
                  <span>Daftar Aparatur Lengkap</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Grid 2 Bagan: Pemerintah Desa & BPD */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                
                {/* 1. Bagan Struktur Organisasi Pemerintahan Desa */}
                <div className="bg-slate-50 rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Eksekutif Desa
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Struktur Organisasi Pemerintahan Desa
                    </h3>
                    <p className="text-xs text-slate-500">
                      Susunan Kepala Desa, Sekretaris Desa, Kepala Seksi (Kasi), Kepala Urusan (Kaur), dan Kepala Dusun (Kasun).
                    </p>
                  </div>

                  {profilData.bagan_desa_image ? (
                    <div className="space-y-2">
                      <div
                        onClick={() => setZoomImage({ src: profilData.bagan_desa_image!, title: "Struktur Organisasi Pemerintahan Desa Bogem" })}
                        className="relative rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-sm cursor-pointer group max-h-80 flex items-center justify-center p-2"
                      >
                        <img
                          src={profilData.bagan_desa_image}
                          alt="Bagan Struktur Organisasi Desa Bogem"
                          className="w-full h-auto max-h-72 object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white font-bold text-xs rounded-2xl">
                          <ZoomIn className="w-5 h-5" />
                          <span>Klik untuk Memperbesar</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">Klik gambar bagan di atas untuk melihat resolusi penuh</p>
                    </div>
                  ) : (
                    /* Default Bagan Hierarchy Card if no custom image uploaded */
                    <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80">
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        <li className="flex items-center space-x-2 bg-emerald-50 p-2.5 rounded-xl font-bold text-[#004329] border border-emerald-200">
                          <Landmark className="w-4 h-4 text-emerald-700" />
                          <span>Kepala Desa Bogem (Pimpinan Eksekutif)</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl font-semibold text-slate-800">
                          <span className="w-2 h-2 rounded-full bg-teal-600" />
                          <span>Sekretaris Desa (Sekretariat Pemerintahan)</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-cyan-600" />
                          <span>Kasi Pemerintahan, Kasi Kesejahteraan, Kasi Pelayanan</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>Kaur Tata Usaha & Umum, Keuangan, Perencanaan</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-amber-600" />
                          <span>Kepala Dusun (Pelaksana Kewilayahan 4 Dusun)</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* 2. Bagan Struktur Organisasi Badan Permusyawaratan Desa (BPD) */}
                <div className="bg-slate-50 rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Legislatif Desa
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Struktur Organisasi Badan Permusyawaratan Desa
                    </h3>
                    <p className="text-xs text-slate-500">
                      Susunan Ketua BPD, Wakil Ketua, Sekretaris, dan Anggota Bidang Permusyawaratan Desa Bogem.
                    </p>
                  </div>

                  {profilData.bagan_bpd_image ? (
                    <div className="space-y-2">
                      <div
                        onClick={() => setZoomImage({ src: profilData.bagan_bpd_image!, title: "Struktur Organisasi BPD Desa Bogem" })}
                        className="relative rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-sm cursor-pointer group max-h-80 flex items-center justify-center p-2"
                      >
                        <img
                          src={profilData.bagan_bpd_image}
                          alt="Bagan Struktur Organisasi BPD Desa Bogem"
                          className="w-full h-auto max-h-72 object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white font-bold text-xs rounded-2xl">
                          <ZoomIn className="w-5 h-5" />
                          <span>Klik untuk Memperbesar</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">Klik gambar bagan di atas untuk melihat resolusi penuh</p>
                    </div>
                  ) : (
                    /* Default BPD Hierarchy Card if no custom image uploaded */
                    <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80">
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        <li className="flex items-center space-x-2 bg-teal-50 p-2.5 rounded-xl font-bold text-teal-900 border border-teal-200">
                          <Users className="w-4 h-4 text-teal-700" />
                          <span>Ketua Badan Permusyawaratan Desa (BPD)</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl font-semibold text-slate-800">
                          <span className="w-2 h-2 rounded-full bg-teal-600" />
                          <span>Wakil Ketua BPD</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-cyan-600" />
                          <span>Sekretaris BPD</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>Bidang Penyelenggaraan Pemerintahan & Pembinaan</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-amber-600" />
                          <span>Bidang Pembangunan & Pemberdayaan Masyarakat</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>
        )}

        {/* 4. SECTION: SEJARAH DESA */}
        {(activeTab === "sejarah" || activeTab === "semua") && (
          <section id="sejarah" className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-center space-x-3 text-[#004329] border-b border-slate-100 pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                  <History className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Sejarah Desa Bogem</h2>
                  <p className="text-xs text-slate-500">Asal-usul, nilai kearifan lokal, dan perjalanan sejarah masyarakat desa</p>
                </div>
              </div>

              <div className="prose max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 sm:space-y-4 whitespace-pre-line">
                {profilData.sejarah || defaultSejarahDesa}
              </div>
            </div>
          </section>
        )}

        {/* 5. SECTION: GEOGRAFIS & PETA LOKASI */}
        {(activeTab === "geografis" || activeTab === "semua") && (
          <section id="geografis" className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 space-y-6 sm:space-y-8">
              <div className="flex items-center space-x-3 text-[#004329] border-b border-slate-100 pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                  <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Peta Lokasi & Geografis Desa</h2>
                  <p className="text-xs text-slate-500">Kondisi fisik, luas wilayah, dan tapal batas administratif Desa Bogem, Kec. Kawedanan, Kab. Magetan</p>
                </div>
              </div>

              {/* Grid Info Geografis & Tabel Batas Wilayah */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                <div className="lg:col-span-7">
                  <VillageMap />
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-3 sm:space-y-4">
                    <h3 className="text-xs font-extrabold text-[#004329] uppercase tracking-wider flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      <span>Batas-Batas Wilayah Desa Bogem</span>
                    </h3>

                    <div className="divide-y divide-slate-200 text-xs">
                      <div className="py-2.5 flex justify-between">
                        <span className="font-bold text-slate-800">Sebelah Utara</span>
                        <span className="text-slate-600">{batas.utara}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="font-bold text-slate-800">Sebelah Timur</span>
                        <span className="text-slate-600">{batas.timur}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="font-bold text-slate-800">Sebelah Selatan</span>
                        <span className="text-slate-600">{batas.selatan}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="font-bold text-slate-800">Sebelah Barat</span>
                        <span className="text-slate-600">{batas.barat}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 p-5 sm:p-6 rounded-2xl border border-emerald-200/80 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-extrabold text-emerald-800 uppercase">
                      <Layers className="w-4 h-4" />
                      <span>Tipologi & Penggunaan Lahan</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Desa Bogem didominasi oleh lahan persawahan subur, perkebunan palawija, dan pemukiman warga yang asri di kawasan lereng timur Kabupaten Magetan.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Luas Wilayah</span>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900">{profilData.luas_wilayah || "245 Ha"}</div>
                  <span className="text-[11px] text-emerald-700 font-medium">Hektar Daratan & Sawah</span>
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Jumlah Penduduk</span>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900">{profilData.jumlah_penduduk || "3.620 Jiwa"}</div>
                  <span className="text-[11px] text-emerald-700 font-medium">Jiwa Terdaftar</span>
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ketinggian Tempat</span>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900">{profilData.ketinggian || "± 78 mdpl"}</div>
                  <span className="text-[11px] text-emerald-700 font-medium">Dataran Rendah Subur</span>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* LIGHTBOX MODAL UNTUK ZOOM FOTO BAGAN DESA */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{zoomImage.title}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={zoomImage.src}
                  download="Bagan_Desa_Bogem.png"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Foto</span>
                </a>
                <button
                  onClick={() => setZoomImage(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-auto flex-grow flex items-center justify-center bg-slate-50 rounded-2xl p-2">
              <img
                src={zoomImage.src}
                alt={zoomImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </main>
  );
}