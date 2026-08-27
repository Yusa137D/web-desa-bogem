import Link from "next/link";
import { Newspaper, Calendar, ArrowRight, Image as ImageIcon } from "lucide-react";
import { BeritaItem } from "@/types/berita";
import { formatDateIndonesian } from "@/utils/formatters";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

interface BeritaPreviewProps {
  listBerita: BeritaItem[];
}

export default function BeritaPreview({ listBerita }: BeritaPreviewProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Kabar Warta Publik</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900">
            Berita & Informasi Terbaru
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Pengumuman resmi dari pemerintah desa dan agenda kegiatan kemasyarakatan warga.
          </p>
        </div>
        <Link
          href="/berita"
          className="inline-flex items-center space-x-1 text-xs font-bold text-[#004329] hover:underline flex-shrink-0"
        >
          <span>Semua Berita</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {listBerita.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-2">
          <Newspaper className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Warta Berita</h3>
          <p className="text-xs text-slate-500">
            Berita dan pengumuman terbaru akan segera dipublikasikan di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {listBerita.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 flex flex-col justify-between group"
            >
              <Link href={`/berita/${item.id}`} className="block relative aspect-[16/9] bg-slate-100 overflow-hidden">
                <ImageWithSkeleton
                  src={item.gambar}
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  fallbackIcon={<ImageIcon className="w-10 h-10 text-emerald-600/40" />}
                />
                {item.created_at && (
                  <div className="absolute top-3 left-3 bg-[#004329]/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center space-x-1 z-10">
                    <Calendar className="w-3 h-3 text-emerald-300 flex-shrink-0" />
                    <span>{formatDateIndonesian(item.created_at)}</span>
                  </div>
                )}
              </Link>

              <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {item.kategori && (
                    <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {item.kategori}
                    </span>
                  )}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#004329] transition line-clamp-2 leading-snug">
                    <Link href={`/berita/${item.id}`}>
                      {item.judul}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {item.ringkasan || item.konten}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/berita/${item.id}`}
                    className="text-xs font-bold text-emerald-800 flex items-center space-x-1 group-hover:translate-x-1 transition"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
