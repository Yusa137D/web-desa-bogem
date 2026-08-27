import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";
import { ProfilDesaData } from "@/types/profil";
import { defaultProfilDesa } from "@/services/profilService";

interface VisiMisiSectionProps {
  profilData: ProfilDesaData;
}

export default function VisiMisiSection({ profilData }: VisiMisiSectionProps) {
  const visi = (profilData.visi || defaultProfilDesa.visi || "").replace(/Balerejo/gi, "Bogem");
  const misiList = profilData.misi && profilData.misi.length > 0 ? profilData.misi : defaultProfilDesa.misi;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex items-center space-x-2.5 text-[#004329]">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Visi & Misi Pembangunan
          </h2>
        </div>

        {/* Visi */}
        <div className="bg-emerald-50/70 p-5 sm:p-6 rounded-2xl border border-emerald-100 space-y-1.5">
          <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-800 uppercase tracking-widest block">
            Visi Utama
          </span>
          <p className="text-xs sm:text-sm lg:text-base font-bold text-[#00321F] leading-relaxed">
            &ldquo;{visi}&rdquo;
          </p>
        </div>

        {/* Misi */}
        <div className="space-y-3">
          <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Misi Strategis Desa
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {misiList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="text-xs text-slate-700 font-medium leading-relaxed">
                  {item.replace(/Balerejo/gi, "Bogem")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 text-right">
          <Link
            href="/profil"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#004329] hover:underline"
          >
            <span>Lihat Profil Lengkap Desa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
