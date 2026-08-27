"use client";

import { useState, useEffect } from "react";
import { Award, ShieldCheck, TrendingUp, CheckCircle, ArrowLeft, TreePine, Store, Sparkles } from "lucide-react";
import Link from "next/link";
import { getLocalInfografis, defaultInfografisData, fetchInfografisData } from "@/services/infografisService";
import { StatIDM } from "@/types/infografis";

export default function IDMPage() {
  const [idmData, setIdmData] = useState<StatIDM>(defaultInfografisData.idm);

  useEffect(() => {
    const local = getLocalInfografis();
    if (local?.idm) {
      setIdmData(local.idm);
    }

    async function load() {
      try {
        const remote = await fetchInfografisData();
        if (remote?.idm) {
          setIdmData(remote.idm);
        }
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

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-28 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Back Link */}
        <Link
          href="/infografis"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#004329] hover:underline active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Infografis Desa</span>
        </Link>

        {/* Hero IDM Banner */}
        <div className="bg-gradient-to-br from-[#00321F] via-[#004A2F] to-[#006643] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Status Kementerian Desa (KemenDesa PDTT)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Indeks Desa Membangun (IDM)
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm lg:text-base leading-relaxed">
              Pengukuran status kemandirian desa berdasarkan variabel ketahanan sosial, ekonomi, dan lingkungan hidup.
            </p>
          </div>

          {/* IDM Badge Box */}
          <div className="bg-white/10 backdrop-blur border border-emerald-400/30 rounded-3xl p-5 sm:p-8 text-center w-full sm:w-auto min-w-[240px] sm:min-w-[260px] shadow-2xl space-y-2 sm:space-y-3 flex-shrink-0">
            <div className="inline-block px-4 py-1.5 bg-emerald-400 text-[#00321F] font-extrabold text-xs rounded-full uppercase tracking-wider shadow">
              {idmData.status}
            </div>
            <div className="text-3xl sm:text-5xl font-black text-white">
              {Number(idmData.skorTotal || 0).toFixed(4)}
            </div>
            <div className="text-xs text-emerald-200/90 font-medium">
              Skor IDM Tahun {idmData.tahun}
            </div>
          </div>
        </div>

        {/* 3 Constituent Sub-Index Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* IKS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                {idmData.iks?.label || "Sangat Baik"}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">IKS (Ketahanan Sosial)</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {Number(idmData.iks?.skor || 0).toFixed(4)}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pelayanan kesehatan, pendidikan, pemukiman, dan solidaritas sosial warga desa.
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, (idmData.iks?.skor || 0) * 100))}%` }}
              />
            </div>
          </div>

          {/* IKE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-teal-100 text-teal-800 rounded-full">
                {idmData.ike?.label || "Baik (Berkembang)"}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">IKE (Ketahanan Ekonomi)</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {Number(idmData.ike?.skor || 0).toFixed(4)}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Keragaman produksi warga, pasar desa, perbankan, dan jaringan aksesibilitas logistik.
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, (idmData.ike?.skor || 0) * 100))}%` }}
              />
            </div>
          </div>

          {/* IKL */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#004329]/10 text-[#004329] flex items-center justify-center">
                <TreePine className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                {idmData.ikl?.label || "Sangat Baik"}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">IKL (Ketahanan Lingkungan)</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {Number(idmData.ikl?.skor || 0).toFixed(4)}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kualitas lingkungan hidup, penanganan bencana alam, dan pengelolaan tata ruang desa.
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#004329] h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, (idmData.ikl?.skor || 0) * 100))}%` }}
              />
            </div>
          </div>

        </div>

        {/* Yearly Growth Timeline */}
        {idmData.riwayat && idmData.riwayat.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Perkembangan Status IDM Pertahun</h3>
                  <p className="text-xs text-slate-500">Tren peningkatan kemandirian desa</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
              {idmData.riwayat.map((item) => {
                const isMandiri = item.status.toLowerCase().includes("mandiri");
                const isMaju = item.status.toLowerCase().includes("maju");
                const badgeColor = isMandiri
                  ? "bg-emerald-600"
                  : isMaju
                  ? "bg-teal-600"
                  : "bg-slate-600";

                return (
                  <div
                    key={item.tahun}
                    className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-100 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-400 uppercase">Tahun {item.tahun}</span>
                      <span className={`text-[10px] sm:text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {Number(item.skor || 0).toFixed(4)}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`${badgeColor} h-full rounded-full`}
                        style={{ width: `${Math.min(100, Math.max(0, (item.skor || 0) * 100))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Indicators Checklist */}
        {idmData.faktor_pendukung && idmData.faktor_pendukung.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 sm:p-8 border border-emerald-100 space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-[#00321F] flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Faktor Pendukung Status Kemandirian Desa</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
              {idmData.faktor_pendukung.map((point, idx) => (
                <li key={idx} className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </main>
  );
}
