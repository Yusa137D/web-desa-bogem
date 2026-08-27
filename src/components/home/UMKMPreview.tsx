import Link from "next/link";
import { ShoppingBag, Phone, ArrowRight, MapPin } from "lucide-react";
import { UMKMItem } from "@/types/umkm";

interface UMKMPreviewProps {
  listUMKM: UMKMItem[];
}

export default function UMKMPreview({ listUMKM }: UMKMPreviewProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Beli Dari Desa</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900">
            Produk & UMKM Unggulan Warga
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Dukung perekonomian warga lokal dengan membeli produk khas langsung dari perajin & pelaku usaha desa.
          </p>
        </div>
        <Link
          href="/potensi"
          className="inline-flex items-center space-x-1 text-xs font-bold text-[#004329] hover:underline flex-shrink-0"
        >
          <span>Lihat Semua Produk</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {listUMKM.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Produk UMKM</h3>
          <p className="text-xs text-slate-500">
            Produk dan karya usaha warga desa akan segera ditampilkan di etalase ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {listUMKM.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                {item.gambar ? (
                  <img
                    src={item.gambar}
                    alt={item.nama_usaha}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                )}
                {item.kategori && (
                  <div className="absolute top-3 left-3 bg-[#004329]/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                    {item.kategori}
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {item.nama_usaha}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                    <span>
                      Pemilik: <strong className="text-slate-700">{item.pemilik}</strong>
                    </span>
                    {item.alamat && (
                      <span className="flex items-center space-x-1 text-slate-500">
                        <MapPin className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{item.alamat}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                    {item.deskripsi}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Harga Mulai</span>
                    <span className="text-xs sm:text-sm font-extrabold text-[#004329]">
                      {item.harga || "Hubungi WA"}
                    </span>
                  </div>
                  {item.kontak && (
                    <a
                      href={`https://wa.me/${item.kontak.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Halo, saya tertarik dengan produk ${item.nama_usaha} dari web desa.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 sm:px-3.5 rounded-xl transition flex items-center space-x-1.5 shadow active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Pesan WA</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
