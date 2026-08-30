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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex items-center space-x-2.5 text-emerald-900">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0 border border-emerald-100">
            <Target className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Visi & Misi Pembangunan
            </h2>
            <p className="text-xs text-slate-500">Arah kebijakan dan cita-cita kemajuan Desa Bogem</p>
          </div>
        </div>

        {/* Visi */}
        <div className="bg-emerald-50/60 p-5 sm:p-6 rounded-2xl border border-emerald-100 space-y-1.5">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Visi Utama Desa
          </span>
          <p className="text-xs sm:text-sm lg:text-base font-semibold text-[#063321] leading-relaxed">
            &ldquo;{visi}&rdquo;
          </p>
        </div>

        {/* Misi */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Misi Strategis Desa
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {misiList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 bg-slate-50/70 p-3.5 sm:p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="text-xs text-slate-700 font-normal leading-relaxed">
                  {item.replace(/Balerejo/gi, "Bogem")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 text-right">
          <Link
            href="/profil"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition hover:underline"
          >
            <span>Lihat Profil Lengkap Desa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
