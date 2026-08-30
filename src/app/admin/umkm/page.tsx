"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createUMKM,
  updateUMKM,
  fetchUMKMList,
  deleteUMKM,
} from "@/services/umkmService";
import { UMKMItem } from "@/types/umkm";
import { UMKM_CATEGORIES } from "@/utils/constants";
import { formatRupiahInput } from "@/utils/formatters";
import { compressImage } from "@/utils/imageCompressor";
import { uploadVillageImage } from "@/lib/storage";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X,
  DollarSign,
  Trash2,
  Edit3,
  RotateCw,
  ShoppingBag,
  User,
  Tag,
  Phone,
  Search,
  Check,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export default function KelolaUMKMAdmin() {
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Form states
  const [namaUsaha, setNamaUsaha] = useState("");
  const [pemilik, setPemilik] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategori, setKategori] = useState("Makanan & Minuman");
  const [kontak, setKontak] = useState("");
  const [alamat, setAlamat] = useState("");
  const [harga, setHarga] = useState("");
  const [gambar, setGambar] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Edit Mode state
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Status & feedback
  const [status, setStatus] = useState<"idle" | "loading" | "sukses" | "error">("idle");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // UMKM list management state
  const [umkmList, setUmkmList] = useState<UMKMItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Semua");

  const loadUMKM = async () => {
    setLoadingList(true);
    try {
      const items = await fetchUMKMList();
      setUmkmList(items);
    } catch {
      // ignore
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadUMKM();
  }, []);

  // Handle direct file selection from laptop/phone
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFeedbackMsg("Berkas harus berupa gambar (JPG, PNG, WEBP).");
      setStatus("error");
      return;
    }

    try {
      const publicUrl = await uploadVillageImage(file, "umkm");
      setGambar(publicUrl);
      setStatus("idle");
    } catch {
      try {
        const compressed = await compressImage(file, 1200, 900, 0.82);
        setGambar(compressed);
        setStatus("idle");
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setGambar(event.target.result as string);
            setStatus("idle");
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle Drag and Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Price Auto Rupiah Formatter
  const handleHargaChange = (val: string) => {
    const formatted = formatRupiahInput(val);
    setHarga(formatted);
  };

  // Quick unit button click
  const applyQuickUnit = (unitSuffix: string) => {
    if (unitSuffix === "Hubungi WA / Nego") {
      setHarga("Hubungi WA / Nego");
      return;
    }

    if (!harga || harga === "Hubungi WA / Nego") {
      setHarga(`Rp 10.000 ${unitSuffix}`);
      return;
    }

    // If price already has a slash unit, replace it; otherwise append
    const slashIdx = harga.indexOf("/");
    if (slashIdx !== -1) {
      const baseNum = harga.substring(0, slashIdx).trim();
      setHarga(`${baseNum} ${unitSuffix}`);
    } else {
      setHarga(`${harga.trim()} ${unitSuffix}`);
    }
  };

  // Reset / Cancel Edit
  const resetForm = () => {
    setEditingId(null);
    setNamaUsaha("");
    setPemilik("");
    setDeskripsi("");
    setKategori("Makanan & Minuman");
    setKontak("");
    setAlamat("");
    setHarga("");
    setGambar("");
    setStatus("idle");
    setFeedbackMsg("");
  };

  // Start Edit
  const startEdit = (item: UMKMItem) => {
    setEditingId(item.id);
    setNamaUsaha(item.nama_usaha);
    setPemilik(item.pemilik);
    setDeskripsi(item.deskripsi);
    setKategori(item.kategori || "Makanan & Minuman");
    setKontak(item.kontak);
    setAlamat(item.alamat || "");
    setHarga(item.harga || "");
    setGambar(item.gambar || "");
    setStatus("idle");
    setFeedbackMsg("");

    // Smooth scroll to form
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setFeedbackMsg("");

    const finalHarga = harga.trim() ? harga.trim() : "Hubungi WA";

    if (editingId !== null) {
      // Update existing item
      const res = await updateUMKM(editingId, {
        nama_usaha: namaUsaha,
        pemilik,
        deskripsi,
        kategori,
        kontak,
        alamat: alamat.trim() || undefined,
        harga: finalHarga,
        gambar: gambar || undefined,
      });

      if (!res.success) {
        setFeedbackMsg(res.error || "Gagal memperbarui data UMKM.");
        setStatus("error");
      } else {
        setStatus("sukses");
        setFeedbackMsg(`Produk UMKM "${namaUsaha}" berhasil diperbarui!`);
        resetForm();
        setTimeout(() => setFeedbackMsg(""), 4000);
        await loadUMKM();
      }
    } else {
      // Create new item
      const res = await createUMKM({
        nama_usaha: namaUsaha,
        pemilik,
        deskripsi,
        kategori,
        kontak,
        alamat: alamat.trim() || undefined,
        harga: finalHarga,
        gambar: gambar || undefined,
      });

      if (!res.success) {
        setFeedbackMsg(res.error || "Gagal menyimpan data UMKM.");
        setStatus("error");
      } else {
        setStatus("sukses");
        setFeedbackMsg(`Produk UMKM "${namaUsaha}" berhasil ditambahkan ke etalase!`);
        resetForm();
        setTimeout(() => setFeedbackMsg(""), 4000);
        await loadUMKM();
      }
    }
  };

  // Delete Handler
  const handleDelete = async (item: UMKMItem) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus produk UMKM "${item.nama_usaha}"?`
    );
    if (!confirmDelete) return;

    setDeletingId(item.id);
    try {
      await deleteUMKM(item.id);
      setDeleteSuccessMsg(`Produk UMKM "${item.nama_usaha}" berhasil dihapus.`);
      setTimeout(() => setDeleteSuccessMsg(""), 4000);
      if (editingId === item.id) {
        resetForm();
      }
      await loadUMKM();
    } catch {
      alert("Gagal menghapus data UMKM.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter UMKM items
  const filteredUMKM = umkmList.filter((item) => {
    const matchCat =
      selectedCategoryFilter === "Semua" ||
      item.kategori?.toLowerCase() === selectedCategoryFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch =
      item.nama_usaha.toLowerCase().includes(query) ||
      item.pemilik.toLowerCase().includes(query) ||
      item.deskripsi.toLowerCase().includes(query) ||
      (item.kategori && item.kategori.toLowerCase().includes(query));
    return matchCat && matchSearch;
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8" ref={formTopRef}>
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#004329] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Admin</span>
          </Link>

          <Link
            href="/potensi"
            target="_blank"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition"
          >
            <span>Lihat Etalase UMKM Publik ↗</span>
          </Link>
        </div>

        {/* Section 1: Form Tambah / Edit UMKM */}
        <div
          className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm border transition-all duration-300 space-y-6 ${
            editingId !== null
              ? "border-amber-400 ring-4 ring-amber-400/10 shadow-lg"
              : "border-slate-200/80"
          }`}
        >
          {/* Header & Status Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  editingId !== null
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-emerald-50 text-[#004329] border border-emerald-200"
                }`}
              >
                {editingId !== null ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Mode Edit Produk UMKM</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Tambah Produk UMKM Baru</span>
                  </>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {editingId !== null
                  ? `Edit UMKM: "${namaUsaha || "..."}"`
                  : "Daftarkan Produk UMKM / Potensi Desa"}
              </h1>
              <p className="text-xs text-slate-500">
                {editingId !== null
                  ? "Perbarui foto produk, nama, harga (auto Rupiah), kontak WhatsApp, dan deskripsi produk."
                  : 'Daftarkan produk atau karya warga lokal agar langsung tampil di katalog "Beli dari Desa".'}
              </p>
            </div>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="self-start sm:self-center inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>Batal Edit</span>
              </button>
            )}
          </div>

          {status === "sukses" && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center space-x-3 text-xs font-semibold animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{feedbackMsg || "Data UMKM berhasil disimpan!"}</span>
            </div>
          )}

          {status === "error" && (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 flex items-center space-x-3 text-xs font-semibold animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{feedbackMsg || "Gagal menyimpan data UMKM. Silakan periksa koneksi."}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Usaha / Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaUsaha}
                  onChange={(e) => setNamaUsaha(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-slate-50 focus:bg-white"
                  placeholder="Contoh: Keripik Tempe Bu Tejo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Pemilik Usaha <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pemilik}
                  onChange={(e) => setPemilik(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-slate-50 focus:bg-white"
                  placeholder="Contoh: Siti Aminah"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kategori Usaha
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-slate-50 focus:bg-white"
                >
                  {UMKM_CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp Pemesanan <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-slate-50 focus:bg-white"
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Alamat / Lokasi Usaha (Opsional)</span>
                </label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-slate-50 focus:bg-white"
                  placeholder="Contoh: RT 03 / RW 01, Dusun Krajan"
                />
              </div>
            </div>

            {/* Price Field with Auto Rupiah Formatting */}
            <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-extrabold text-[#004329] uppercase flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>Harga Produk UMKM (Auto Format Rupiah) <span className="text-rose-500">*</span></span>
                </label>
                <span className="text-[11px] text-emerald-800 font-medium">
                  Bisa harga satuan (15000) atau rentang harga (15000 - 250000)
                </span>
              </div>

              <input
                type="text"
                required
                value={harga}
                onChange={(e) => handleHargaChange(e.target.value)}
                className="w-full border border-emerald-300 px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm text-slate-900 font-extrabold shadow-inner"
                placeholder="Contoh: 15000 atau 15000 - 250000 (Otomatis jadi Rp 15.000 - Rp 250.000)"
              />

              {/* Quick Unit Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pilihan Cepat Format & Satuan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHarga("Rp 15.000 - Rp 250.000")}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100/90 border border-emerald-300 text-[#004329] hover:bg-emerald-200/70 transition"
                  >
                    Contoh Rentang: 15.000 - 250.000
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickUnit("/ bungkus")}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-emerald-300/80 text-emerald-900 hover:bg-emerald-100/70 transition"
                  >
                    + / bungkus
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickUnit("/ porsi")}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-emerald-300/80 text-emerald-900 hover:bg-emerald-100/70 transition"
                  >
                    + / porsi
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickUnit("/ kg")}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-emerald-300/80 text-emerald-900 hover:bg-emerald-100/70 transition"
                  >
                    + / kg
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickUnit("/ pcs")}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-emerald-300/80 text-emerald-900 hover:bg-emerald-100/70 transition"
                  >
                    + / pcs
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickUnit("/ botol")}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-emerald-300/80 text-emerald-900 hover:bg-emerald-100/70 transition"
                  >
                    + / botol
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickUnit("Hubungi WA / Nego")}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                  >
                    Hubungi WA / Nego
                  </button>
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Deskripsi Produk / Jasa <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 focus:bg-white"
                placeholder="Jelaskan bahan baku, keunggulan rasa, varian ukuran, dan rincian produk..."
              />
            </div>

            {/* Product Photo Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>Foto Produk UMKM (Opsional)</span>
              </label>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Upload Drop Zone / Preview Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50 scale-[1.01]"
                    : "border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-slate-100/80"
                }`}
              >
                {gambar ? (
                  <div className="space-y-3">
                    <div className="relative aspect-[4/3] max-w-xs mx-auto rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white">
                      <img
                        src={gambar}
                        alt="Pratinjau Foto Produk"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGambar("");
                        }}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1.5 rounded-full backdrop-blur transition"
                        title="Hapus foto ini"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs font-bold text-emerald-800">
                      <Upload className="w-4 h-4" />
                      <span>Klik untuk mengganti foto produk</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Klik di sini untuk Unggah Foto Produk dari Laptop / HP
                      </span>
                      <span className="text-[11px] text-slate-500">
                        atau seret & lepas berkas foto (JPG, PNG, WEBP, Maks. 5MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-2">
              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-1/3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-3.5 px-4 rounded-xl transition text-xs flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <X className="w-4 h-4" />
                  <span>Batal</span>
                </button>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className={`flex-grow text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs sm:text-sm shadow-md active:scale-95 ${
                  status === "loading"
                    ? "bg-emerald-800/50 cursor-not-allowed"
                    : editingId !== null
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-[#004329] hover:bg-[#00321F]"
                }`}
              >
                {editingId !== null ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {status === "loading" ? "Menyimpan Pembaruan..." : "Simpan Pembaruan UMKM"}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      {status === "loading" ? "Menyimpan Data..." : "Tambahkan ke Etalase UMKM"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Daftar & Manajemen UMKM (Edit & Hapus) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          
          {/* List Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span>Daftar Produk UMKM Warga</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Kelola Produk UMKM ({umkmList.length})
              </h2>
            </div>

            <button
              onClick={loadUMKM}
              disabled={loadingList}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition self-start sm:self-auto"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin text-emerald-600" : ""}`} />
              <span>Muat Ulang</span>
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama usaha, pemilik, atau produk..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {UMKM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "Semua" ? "Semua Kategori" : cat}
                </option>
              ))}
            </select>
          </div>

          {deleteSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{deleteSuccessMsg}</span>
            </div>
          )}

          {loadingList ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium animate-pulse">
              Memuat data produk UMKM...
            </div>
          ) : filteredUMKM.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
              <p>
                {searchQuery || selectedCategoryFilter !== "Semua"
                  ? "Tidak ada produk UMKM yang sesuai dengan pencarian / filter."
                  : "Belum ada data UMKM yang terdaftar."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredUMKM.map((item) => {
                const isCurrentlyEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`py-4 px-3 sm:px-4 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                      isCurrentlyEditing
                        ? "bg-amber-50/70 border border-amber-300 ring-2 ring-amber-400/20"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm relative">
                        {item.gambar ? (
                          <img
                            src={item.gambar}
                            alt={item.nama_usaha}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {item.nama_usaha}
                          </h3>

                          {item.kategori && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#004329] border border-emerald-200">
                              <Tag className="w-2.5 h-2.5" />
                              <span>{item.kategori}</span>
                            </span>
                          )}

                          {isCurrentlyEditing && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300 animate-pulse">
                              <span>Sedang Diedit</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {item.deskripsi}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium pt-0.5">
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{item.pemilik}</span>
                          </span>

                          <span className="flex items-center space-x-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{item.kontak}</span>
                          </span>

                          {item.alamat && (
                            <span className="flex items-center space-x-1 text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md">
                              <MapPin className="w-3 h-3 text-emerald-700" />
                              <span className="truncate max-w-[200px]">{item.alamat}</span>
                            </span>
                          )}

                          {item.harga && (
                            <span className="font-extrabold text-[#004329] bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              {item.harga}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Edit & Delete */}
                    <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className={`inline-flex items-center space-x-1 px-3 py-2 text-xs font-bold rounded-xl border transition active:scale-95 ${
                          isCurrentlyEditing
                            ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                            : "text-[#004329] bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                        }`}
                        title="Edit produk UMKM ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isCurrentlyEditing ? "Diedit" : "Edit"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200/80 transition active:scale-95 disabled:opacity-50"
                        title="Hapus produk UMKM ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === item.id ? "..." : "Hapus"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}