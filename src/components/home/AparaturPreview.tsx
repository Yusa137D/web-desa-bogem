"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserCheck, ArrowRight, Landmark } from "lucide-react";
import { PerangkatItem } from "@/types/perangkat";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { fetchPerangkatList } from "@/services/perangkatService";

interface AparaturPreviewProps {
  listPerangkat?: PerangkatItem[];
}

export default function AparaturPreview({ listPerangkat = [] }: AparaturPreviewProps) {
  const [items, setItems] = useState<PerangkatItem[]>(listPerangkat);
  const [loading, setLoading] = useState(listPerangkat.length === 0);

  useEffect(() => {
    fetchPerangkatList()
      .then((data) => {
        if (data && data.length > 0) {
          setItems(data);
        }
      })
      .catch((err) => console.error("Error loading perangkat preview:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="sotk" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pemerintahan Desa</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Aparatur & Perangkat Desa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Struktur Organisasi dan Tata Kerja (SOTK) Pemerintah Desa Bogem yang siap melayani kebutuhan masyarakat.
          </p>
        </div>
        <Link
          href="/pemerintah"
          className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition hover:underline flex-shrink-0"
        >
          <span>Semua Perangkat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-100 animate-pulse space-y-3">
              <div className="aspect-[3/4] bg-slate-200 rounded-xl w-full" />
              <div className="h-3 bg-slate-200 rounded w-2/3 mx-auto" />
              <div className="h-4 bg-slate-200 rounded w-4/5 mx-auto" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Data Aparatur</h3>
          <p className="text-xs text-slate-500">
            Data susunan perangkat desa akan segera diperbarui.
          </p>
        </div>
      ) : (
        /* Perangkat Cards Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {items.map((p) => {
            const isKades =
              p.jabatan.toLowerCase().includes("kepala desa") &&
              !p.jabatan.toLowerCase().includes("dusun");

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border transition-all duration-200 flex flex-col justify-between space-y-3 group hover:shadow-md ${
                  isKades
                    ? "border-emerald-300 shadow-sm ring-1 ring-emerald-500/30"
                    : "border-slate-200/80 shadow-sm hover:border-slate-300"
                }`}
              >
                {/* Photo container with fixed aspect ratio */}
                <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <ImageWithSkeleton
                    src={p.foto}
                    alt={p.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackIcon={<UserCheck className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300" />}
                  />
                  {isKades && (
                    <div className="absolute top-2 left-2 bg-[#063321] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center space-x-1 z-10">
                      <Landmark className="w-2.5 h-2.5 text-emerald-300" />
                      <span>Pimpinan</span>
                    </div>
                  )}
                </div>

                {/* Info Text */}
                <div className="space-y-1 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold max-w-full truncate ${
                      isKades
                        ? "bg-[#063321] text-white"
                        : "bg-emerald-50 text-emerald-900 border border-emerald-200/80"
                    }`}
                  >
                    {p.jabatan}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                    {p.nama}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
