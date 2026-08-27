"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { getLocalInfografis, defaultInfografisData, fetchInfografisData } from "@/services/infografisService";
import { InfografisData } from "@/types/infografis";

export default function StatistikSection() {
  const [data, setData] = useState<InfografisData>(defaultInfografisData);

  useEffect(() => {
    const local = getLocalInfografis();
    if (local) setData(local);

    async function load() {
      try {
        const remote = await fetchInfografisData();
        setData(remote);
      } catch {
        // ignore
      }
    }
    load();

    const handleUpdate = () => {
      load();
    };

    window.addEventListener("local_infografis_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("local_infografis_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const { demografi } = data;
  const total = demografi.total_penduduk || (demografi.pria + demografi.wanita) || 1;
  const persenPria = ((demografi.pria / total) * 100).toFixed(1);
  const persenWanita = ((demografi.wanita / total) * 100).toFixed(1);
  const idmStatus = data.idm?.status || "DESA MANDIRI";
  const idmSkor = Number(data.idm?.skorTotal || 0.8542).toFixed(4);

  const STATS = [
    { label: "Total Penduduk", value: demografi.total_penduduk.toLocaleString("id-ID"), sub: "Jiwa Terdaftar" },
    { label: "Kepala Keluarga", value: demografi.kepala_keluarga.toLocaleString("id-ID"), sub: "Kepala Keluarga (KK)" },
    { label: "Laki-Laki", value: demografi.pria.toLocaleString("id-ID"), sub: `${persenPria}% Total` },
    { label: "Perempuan", value: demografi.wanita.toLocaleString("id-ID"), sub: `${persenWanita}% Total` },
    { label: "Luas Wilayah", value: `${demografi.luas_wilayah}`, sub: "Hektar (Ha)" },
    { label: "Status IDM", value: idmStatus.replace(/^DESA\s+/i, ""), sub: `Skor ${idmSkor}`, isSpecial: true },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
      <div className="bg-gradient-to-r from-[#00321F] to-[#005B3A] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Statistik Wilayah</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Desa Bogem dalam Angka
            </h2>
          </div>
          <Link
            href="/infografis"
            className="inline-flex items-center space-x-2 bg-white text-[#004329] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition shadow self-start sm:self-auto active:scale-95"
          >
            <span>Infografis Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Stat Counters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-3.5 sm:p-4 text-center space-y-1 backdrop-blur border ${
                stat.isSpecial
                  ? "bg-amber-400/20 border-amber-300/40"
                  : "bg-white/10 border-emerald-400/20"
              }`}
            >
              <span
                className={`text-[9px] sm:text-[10px] uppercase tracking-wider block font-semibold truncate ${
                  stat.isSpecial ? "text-amber-200 font-bold" : "text-emerald-200"
                }`}
              >
                {stat.label}
              </span>
              <div
                className={`text-lg sm:text-xl lg:text-2xl font-extrabold truncate ${
                  stat.isSpecial ? "text-amber-300" : "text-white"
                }`}
              >
                {stat.value}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] block truncate ${
                  stat.isSpecial ? "text-white" : "text-emerald-300"
                }`}
              >
                {stat.sub}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
