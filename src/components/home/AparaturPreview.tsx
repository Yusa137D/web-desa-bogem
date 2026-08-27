import Link from "next/link";
import { Users, Sparkles, UserCheck, ArrowRight } from "lucide-react";
import { PerangkatItem } from "@/types/perangkat";

interface AparaturPreviewProps {
  listPerangkat: PerangkatItem[];
}

export default function AparaturPreview({ listPerangkat }: AparaturPreviewProps) {
  return (
    <section id="sotk" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>SOTK Pemerintahan Desa</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900">
            Aparatur & Perangkat Desa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Struktur Organisasi dan Tata Kerja Pemerintah Desa Bogem yang berdedikasi melayani masyarakat.
          </p>
        </div>
        <Link
          href="/pemerintah"
          className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 hover:underline flex-shrink-0"
        >
          <span>Bagan Struktur Lengkap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {listPerangkat.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Data Aparatur Belum Diunggah</h3>
          <p className="text-xs text-slate-500">
            Daftar susunan aparatur pemerintah desa akan segera diperbarui.
          </p>
        </div>
      ) : (
        /* Perangkat Cards Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {listPerangkat.map((p) => {
            const isKades =
              p.jabatan.toLowerCase().includes("kepala desa") &&
              !p.jabatan.toLowerCase().includes("dusun");

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border transition-all duration-300 flex flex-col justify-between space-y-3 sm:space-y-4 group hover:shadow-xl ${
                  isKades
                    ? "border-emerald-300 shadow-md ring-2 ring-emerald-500/20"
                    : "border-slate-200/80 shadow-sm"
                }`}
              >
                {/* Photo container with fixed aspect ratio */}
                <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  {p.foto ? (
                    <img
                      src={p.foto}
                      alt={p.nama}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <UserCheck className="w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                  )}
                  {isKades && (
                    <div className="absolute top-2 left-2 bg-[#004329] text-white text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow flex items-center space-x-1">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" />
                      <span>Pimpinan</span>
                    </div>
                  )}
                </div>

                {/* Info Text */}
                <div className="space-y-1 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold max-w-full truncate ${
                      isKades
                        ? "bg-[#004329] text-white"
                        : "bg-emerald-50 text-[#004329] border border-emerald-200"
                    }`}
                  >
                    {p.jabatan}
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-1">
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
