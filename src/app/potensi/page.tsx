"use client";

import { useState } from "react";
import Link from "next/link";
import { useUMKM } from "@/hooks/useUMKM";
import { UMKMItem } from "@/types/umkm";
import { UMKM_CATEGORIES } from "@/utils/constants";
import { formatWhatsAppLink } from "@/utils/formatters";
import { Search, ShoppingBag, Phone, Store, User, Filter, X, Tag, MapPin, ArrowLeft } from "lucide-react";
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
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Hero Header Section */}
        <div className="bg-[#073623] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white px-3 py-1 rounded-full text-xs font-semibold transition border border-white/10 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda</span>
              </Link>
              <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-500/40 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
                <span>Etalase Produk Warga</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Beli Dari Desa
            </h1>
            <p className="text-emerald-100/85 text-xs sm:text-sm lg:text-base leading-relaxed">
              Layanan promosi produk UMKM & hasil karya masyarakat desa Bogem untuk mendorong kemandirian dan pertumbuhan ekonomi warga secara berkelanjutan.
            </p>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1">
              <div className="bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-xl flex items-center space-x-2">
                <Store className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-medium text-emerald-100">
                  {dataUMKM.length} UMKM Terdaftar
                </span>
              </div>
              <div className="bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-xl flex items-center space-x-2">
                <Tag className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-medium text-emerald-100">
                  Transaksi Langsung via WA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Category Filter Pills with horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {UMKM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap active:scale-95 ${
                  selectedCategory === cat
                    ? "bg-[#063321] text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama usaha, produk..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 shadow-sm animate-pulse space-y-4 border border-slate-100">
                <div className="bg-slate-200 h-48 rounded-2xl w-full" />
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
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 flex flex-col group"
                  >
                    {/* Image Banner */}
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      <ImageWithSkeleton
                        src={item.gambar}
                        alt={item.nama_usaha}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        fallbackIcon={<Store className="w-12 h-12 stroke-[1.5] text-emerald-600/40" />}
                      />
                      <span className="absolute top-3 right-3 bg-[#063321]/90 backdrop-blur text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm z-10">
                        {item.kategori}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-1">
                          <User className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span className="truncate">Milik: <strong className="text-slate-700">{item.pemilik}</strong></span>
                        </div>
                        {item.alamat && (
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                            <span className="truncate">{item.alamat}</span>
                          </div>
                        )}
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-1 mb-1.5">
                          {item.nama_usaha}
                        </h2>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {item.deskripsi}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3.5 border-t border-slate-100 space-y-3">
                        {item.harga && (
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Harga Mulai</span>
                            <div className="text-xs sm:text-sm font-bold text-[#063321]">
                              {item.harga}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl transition active:scale-95"
                          >
                            Detail
                          </button>
                          <a
                            href={formatWhatsAppLink(item.kontak, item.nama_usaha)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
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
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 max-w-md mx-auto my-8 space-y-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-700 border border-emerald-100">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Produk Tidak Ditemukan</h3>
                <p className="text-xs text-slate-500">
                  Tidak ada UMKM yang cocok dengan pencarian &quot;{searchTerm}&quot; atau kategori &quot;{selectedCategory}&quot;.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("Semua");
                  }}
                  className="bg-[#063321] hover:bg-[#073d28] text-white text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 shadow-sm"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal Detail View */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-200">
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
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur transition"
                  aria-label="Tutup Detail"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="absolute bottom-3 left-3 bg-[#063321] text-white text-xs font-semibold px-3 py-0.5 rounded-full shadow-sm">
                  {selectedItem.kategori}
                </span>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                    {selectedItem.nama_usaha}
                  </h2>
                  <p className="text-xs font-semibold text-emerald-800">
                    Pemilik Usaha: {selectedItem.pemilik}
                  </p>
                </div>

                {selectedItem.alamat && (
                  <div className="flex items-start space-x-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Alamat / Lokasi Usaha:</span>
                      <span>{selectedItem.alamat}</span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi Usaha / Produk</span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedItem.deskripsi}
                  </p>
                </div>

                {selectedItem.harga && (
                  <div className="flex justify-between items-center bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-900">Estimasi Harga</span>
                    <span className="text-sm sm:text-base font-bold text-[#063321]">{selectedItem.harga}</span>
                  </div>
                )}

                {/* Modal CTA */}
                <div className="pt-2">
                  <a
                    href={formatWhatsAppLink(selectedItem.kontak, selectedItem.nama_usaha)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs sm:text-sm shadow-sm active:scale-95"
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