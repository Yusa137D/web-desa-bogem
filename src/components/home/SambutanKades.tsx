import { ProfilDesaData } from "@/types/profil";
import { PerangkatItem } from "@/types/perangkat";
import { defaultProfilDesa } from "@/services/profilService";
import { Sparkles, ShieldCheck, Building2, UserCheck } from "lucide-react";

interface SambutanKadesProps {
  profilData: ProfilDesaData;
  listPerangkat: PerangkatItem[];
}

export default function SambutanKades({ profilData, listPerangkat }: SambutanKadesProps) {
  const kadesFromSOTK = listPerangkat.find(
    (p) => p.jabatan.toLowerCase().includes("kepala desa") && !p.jabatan.toLowerCase().includes("dusun")
  );

  const displayKadesFoto =
    profilData.foto_kades && profilData.foto_kades !== "/images/kades.png"
      ? profilData.foto_kades
      : kadesFromSOTK?.foto || "";

  const displayKadesNama =
    profilData.nama_kades &&
    !profilData.nama_kades.toLowerCase().includes("balerejo") &&
    profilData.nama_kades !== "H. Suratno, S.Sos." &&
    profilData.nama_kades !== "Kepala Desa Bogem"
      ? profilData.nama_kades
      : (kadesFromSOTK?.nama || "Kepala Desa Bogem");

  const displaySambutan = (profilData.sambutan_kades || defaultProfilDesa.sambutan_kades || "")
    .replace(/Balerejo/gi, "Bogem")
    .replace(/Kebonsari/gi, "Kawedanan")
    .replace(/Madiun/gi, "Magetan");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
      <div className="bg-gradient-to-br from-[#00321F] via-[#004A2F] to-[#006643] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
        {/* Decorative blur backdrop */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 sm:w-72 sm:h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-12">
          
          {/* Portrait Photo Card */}
          <div className="w-44 sm:w-52 md:w-60 aspect-[3/4] rounded-3xl overflow-hidden bg-emerald-950 border-4 border-emerald-400/50 shadow-2xl flex-shrink-0 relative group flex items-center justify-center">
            {displayKadesFoto ? (
              <img
                src={displayKadesFoto}
                alt={displayKadesNama}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-emerald-300 bg-emerald-950">
                <UserCheck className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>
            )}

            {/* Official Badge */}
            <div className="absolute top-3 left-3 bg-[#002B1B]/95 backdrop-blur border border-emerald-400/40 text-white text-[10px] sm:text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
              <span>Kepala Desa</span>
            </div>

            {/* Name Plate Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3.5 text-center">
              <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight drop-shadow">
                {displayKadesNama}
              </h4>
              <span className="text-[10px] sm:text-[11px] text-emerald-300 font-bold block mt-0.5">
                Pemerintah Desa Bogem
              </span>
            </div>
          </div>

          {/* Speech & Official Info */}
          <div className="space-y-4 flex-grow text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>Kata Sambutan Resmi</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug">
              Selamat Datang di Website Resmi Desa Bogem
            </h2>

            <blockquote className="text-xs sm:text-sm lg:text-base text-emerald-100/90 italic leading-relaxed pt-1">
              &ldquo;{displaySambutan}&rdquo;
            </blockquote>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center md:justify-start text-xs text-emerald-200/80 font-semibold border-t border-emerald-700/60 pt-4">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Pelayanan Prima & Transparan</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Kec. Kawedanan, Kab. Magetan</span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
