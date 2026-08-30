import { ProfilDesaData } from "@/types/profil";
import { PerangkatItem } from "@/types/perangkat";
import { defaultProfilDesa } from "@/services/profilService";
import { ShieldCheck, Building2, UserCheck, Quote, Landmark } from "lucide-react";

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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-10">
          
          {/* Portrait Photo Card */}
          <div className="w-40 sm:w-48 md:w-56 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex-shrink-0 relative group flex items-center justify-center">
            {displayKadesFoto ? (
              <img
                src={displayKadesFoto}
                alt={displayKadesNama}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                <UserCheck className="w-14 h-14" />
              </div>
            )}

            {/* Official Badge */}
            <div className="absolute top-2.5 left-2.5 bg-[#063321] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center space-x-1">
              <Landmark className="w-3 h-3 text-emerald-300 flex-shrink-0" />
              <span>Kepala Desa</span>
            </div>

            {/* Name Plate Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-center">
              <h4 className="text-xs font-bold text-white leading-tight">
                {displayKadesNama}
              </h4>
              <span className="text-[10px] text-emerald-300 font-medium block mt-0.5">
                Pemerintah Desa Bogem
              </span>
            </div>
          </div>

          {/* Speech & Official Info */}
          <div className="space-y-3.5 flex-grow text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Quote className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span>Sambutan Kepala Desa</span>
            </div>

            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
              Selamat Datang di Website Resmi Desa Bogem
            </h2>

            <blockquote className="text-xs sm:text-sm text-slate-600 italic leading-relaxed pt-1 border-l-2 border-emerald-500 pl-3 md:pl-4 text-left">
              &ldquo;{displaySambutan}&rdquo;
            </blockquote>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center md:justify-start text-xs text-slate-500 font-medium border-t border-slate-100 pt-3">
              <span className="flex items-center space-x-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>Pelayanan Prima & Transparan</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Kec. Kawedanan, Kab. Magetan</span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
