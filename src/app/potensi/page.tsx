"use client";

import { useState } from "react";
import { useUMKM } from "@/hooks/useUMKM";
import { UMKMItem } from "@/types/umkm";
import { UMKM_CATEGORIES } from "@/utils/constants";
import { formatWhatsAppLink } from "@/utils/formatters";
import { Search, ShoppingBag, Phone, Store, User, Sparkles, Filter, X, Tag, MapPin } from "lucide-react";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

export default function PotensiDesa() {
  const { data: dataUMKM, loading } = useUMKM();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<UMKMItem | null>(null);

  // Filter products by category & search term
  const filteredUMKM = dataUMKM.filter((item) => {
    const matchesCategory =
      selectedCategory === "Semua" || item.kategori === selectedCategory;
    const matchesSearch =
      item.nama_usaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pemilik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-28 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Header Section */}
        <div className="bg-gradient-to-br from-[#00321F] via-[#004A2F] to-[#006643] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl mb-8 sm:mb-10 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <ShoppingBag className="w-80 h-80 sm:w-96 sm:h-96 text-white" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Etalase Produk Warga</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-tight">
              Beli Dari Desa
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-base leading-relaxed mb-5 sm:mb-6">
              Layanan promosi produk UMKM & hasil karya masyarakat desa Bogem untuk mendorong kemandirian dan pertumbuhan ekonomi warga secara berkelanjutan.
            </p>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap gap-2.5 sm:gap-4 pt-1">
              <div className="bg-emerald-950/40 backdrop-blur border border-emerald-500/20 px-3.5 py-2 rounded-2xl flex items-center space-x-2.5">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="text-xs sm:text-sm font-semibold text-emerald-200">
                  {dataUMKM.length} UMKM Terdaftar
                </span>
              </div>
              <div className="bg-emerald-950/40 backdrop-blur border border-emerald-500/20 px-3.5 py-2 rounded-2xl flex items-center space-x-2.5">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="text-xs sm:text-sm font-semibold text-emerald-200">
                  Transaksi Langsung via WA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Section */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 mb-8 space-y-4 sm:space-y-6">
          
          {/* Search Input Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama usaha, produk, atau pemilik..."
              className="w-full pl-11 pr-10 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-xs sm:text-sm transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills with horizontal scroll on mobile */}
          <div>
            <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Kategori Produk</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {UMKM_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                    selectedCategory === cat
                      ? "bg-[#004329] text-white shadow-md shadow-emerald-900/10 scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
                <div className="bg-slate-200 h-48 rounded-xl w-full" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Products Grid */}
            {filteredUMKM.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredUMKM.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 flex flex-col group"
                  >
                    {/* Image Banner */}
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      <ImageWithSkeleton
                        src={item.gambar}
                        alt={item.nama_usaha}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fallbackIcon={<Store className="w-12 h-12 stroke-[1.5] text-emerald-600/40" />}
                      />
                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur text-[#004329] text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
                        {item.kategori}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-1">
                          <User className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">Milik: {item.pemilik}</span>
                        </div>
                        {item.alamat && (
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                            <span className="truncate">{item.alamat}</span>
                          </div>
                        )}
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#004329] transition line-clamp-1 mb-1.5">
                          {item.nama_usaha}
                        </h2>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {item.deskripsi}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        {item.harga && (
                          <div className="text-xs sm:text-sm font-extrabold text-[#004329]">
                            {item.harga}
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition active:scale-95"
                          >
                            Detail
                          </button>
                          <a
                            href={formatWhatsAppLink(item.kontak, item.nama_usaha)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Pesan WA</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200/80 max-w-md mx-auto my-8 space-y-3 sm:space-y-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">Produk Tidak Ditemukan</h3>
                <p className="text-xs text-slate-500">
                  Tidak ada UMKM yang cocok dengan pencarian &quot;{searchTerm}&quot; atau kategori &quot;{selectedCategory}&quot;.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("Semua");
                  }}
                  className="bg-[#004329] text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal Detail View */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
              {/* Modal Header Image */}
              <div className="relative aspect-[16/9] bg-slate-100">
                {selectedItem.gambar && (
                  <img
                    src={selectedItem.gambar}
                    alt={selectedItem.nama_usaha}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur transition"
                  aria-label="Tutup Detail"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="absolute bottom-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {selectedItem.kategori}
                </span>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                    {selectedItem.nama_usaha}
                  </h2>
                  <p className="text-xs font-semibold text-emerald-700">
                    Pemilik Usaha: {selectedItem.pemilik}
                  </p>
                </div>

                {selectedItem.alamat && (
                  <div className="flex items-start space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Alamat / Lokasi Usaha:</span>
                      <span>{selectedItem.alamat}</span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase">Deskripsi Usaha / Produk</span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedItem.deskripsi}
                  </p>
                </div>

                {selectedItem.harga && (
                  <div className="flex justify-between items-center bg-emerald-50/80 p-3.5 sm:p-4 rounded-xl border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-900">Estimasi Harga</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#004329]">{selectedItem.harga}</span>
                  </div>
                )}

                {/* Modal CTA */}
                <div className="pt-2">
                  <a
                    href={formatWhatsAppLink(selectedItem.kontak, selectedItem.nama_usaha)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs sm:text-sm shadow-md active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Hubungi Pemilik via WhatsApp ({selectedItem.kontak})</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}