"use client";

import { useState, useRef, useEffect } from "react";
import {
  createBerita,
  updateBerita,
  fetchBeritaList,
  deleteBerita,
} from "@/services/beritaService";
import { BeritaItem, KATEGORI_BERITA_PRESETS } from "@/types/berita";
import { formatDateIndonesian } from "@/utils/formatters";
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
  Trash2,
  Edit,
  RotateCw,
  Newspaper,
  Calendar,
  ExternalLink,
  Tag,
  User,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function KelolaBeritaAdmin() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState(KATEGORI_BERITA_PRESETS[0]);
  const [penulis, setPenulis] = useState("Pemerintah Desa Bogem");
  const [ringkasan, setRingkasan] = useState("");
  const [konten, setKonten] = useState("");
  const [gambar, setGambar] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Edit mode
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "sukses" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // News list state
  const [beritaList, setBeritaList] = useState<BeritaItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState("");

  const loadBerita = async () => {
    setLoadingList(true);
    try {
      const items = await fetchBeritaList();
      setBeritaList(items);
    } catch {
      // ignore
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadBerita();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Berkas harus berupa gambar (JPG, PNG, WEBP).");
      setStatus("error");
      return;
    }

    try {
      // 1. Try uploading to Supabase Storage Bucket ('public-images')
      const publicUrl = await uploadVillageImage(file, "berita");
      setGambar(publicUrl);
      setStatus("idle");
    } catch {
      // 2. Fallback to client-side compressed webp if storage bucket is offline
      try {
        const compressed = await compressImage(file, 1200, 800, 0.82);
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
    if (file) processFile(file);
  };

  const resetForm = () => {
    setEditingId(null);
    setJudul("");
    setKategori(KATEGORI_BERITA_PRESETS[0]);
    setPenulis("Pemerintah Desa Bogem");
    setRingkasan("");
    setKonten("");
    setGambar("");
    setStatus("idle");
    setErrorMessage("");
  };

  const handleEditClick = (item: BeritaItem) => {
    setEditingId(item.id);
    setJudul(item.judul);
    setKategori(item.kategori || KATEGORI_BERITA_PRESETS[0]);
    setPenulis(item.penulis || "Pemerintah Desa Bogem");
    setRingkasan(item.ringkasan || "");
    setKonten(item.konten);
    setGambar(item.gambar || "");
    setStatus("idle");
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    if (editingId !== null) {
      // Update existing news
      const res = await updateBerita(editingId, {
        judul,
        kategori,
        penulis,
        ringkasan,
        konten,
        gambar: gambar || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal memperbarui berita.");
        setStatus("error");
      } else {
        setStatus("sukses");
        setDeleteSuccessMsg(`Berita "${judul}" berhasil diperbarui!`);
        setTimeout(() => setDeleteSuccessMsg(""), 4000);
        resetForm();
        await loadBerita();
      }
    } else {
      // Create new news
      const res = await createBerita({
        judul,
        kategori,
        penulis,
        ringkasan,
        konten,
        gambar: gambar || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal menerbitkan berita.");
        setStatus("error");
      } else {
        setStatus("sukses");
        setDeleteSuccessMsg(`Berita "${judul}" berhasil diterbitkan!`);
        setTimeout(() => setDeleteSuccessMsg(""), 4000);
        resetForm();
        await loadBerita();
      }
    }
  };

  const handleDelete = async (item: BeritaItem) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus berita "${item.judul}"?`);
    if (!confirmDelete) return;

    setDeletingId(item.id);
    try {
      await deleteBerita(item.id);
      setDeleteSuccessMsg(`Berita "${item.judul}" berhasil dihapus.`);
      setTimeout(() => setDeleteSuccessMsg(""), 4000);
      if (editingId === item.id) resetForm();
      await loadBerita();
    } catch {
      alert("Gagal menghapus berita.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/admin"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Admin</span>
          </Link>
          <div className="bg-[#073623] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-sm relative overflow-hidden">
            <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-500/40 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Newspaper className="w-3.5 h-3.5 text-emerald-300" />
              <span>Publikasi Warta Desa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {editingId ? "Edit Warta / Berita Desa" : "Kelola & Terbitkan Berita Baru"}
            </h1>
            <p className="text-emerald-100/85 text-xs sm:text-sm mt-1 max-w-xl">
              Publikasikan pengumuman resmi, agenda kegiatan kemasyarakatan, dan warta terkini warga Desa Bogem.
            </p>
          </div>
        </div>

        {/* Global Feedback message */}
        {deleteSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center space-x-2 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{deleteSuccessMsg}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              <span>{editingId ? "Form Edit Berita" : "Formulir Berita Baru"}</span>
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
              >
                Batalkan Edit (Buat Baru)
              </button>
            )}
          </div>

          {status === "sukses" && !editingId && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Berita berhasil diterbitkan dan langsung tampil di halaman berita!</span>
            </div>
          )}

          {status === "error" && errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Judul Berita */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Judul Berita <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Kerja Bakti Gotong Royong Saluran Irigasi Sawah"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition font-medium"
              />
            </div>

            {/* Kategori & Penulis Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kategori Berita</span>
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition font-medium"
                >
                  {KATEGORI_BERITA_PRESETS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Penulis / Sumber</span>
                </label>
                <input
                  type="text"
                  value={penulis}
                  onChange={(e) => setPenulis(e.target.value)}
                  placeholder="Contoh: Pemerintah Desa Bogem"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                />
              </div>
            </div>

            {/* Ringkasan Singkat (Lead Paragraph) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Ringkasan Singkat (Cuplikan pada kartu berita)
              </label>
              <textarea
                rows={2}
                value={ringkasan}
                onChange={(e) => setRingkasan(e.target.value)}
                placeholder="Tulis 1-2 kalimat ringkasan yang menarik minat pembaca..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>

            {/* Isi Lengkap Berita */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Isi Lengkap Berita (Paragraf & Rincian) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={8}
                required
                value={konten}
                onChange={(e) => setKonten(e.target.value)}
                placeholder="Tuliskan seluruh kronologi, rincian tempat, tanggal, dan informasi kegiatan secara lengkap. Gunakan enter untuk memisahkan paragraf..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition leading-relaxed"
              />
              <span className="text-[10px] text-slate-400 block">
                *Tips: Tekan Enter dua kali untuk membuat paragraf baru agar berita nyaman dibaca warga.
              </span>
            </div>

            {/* Upload Foto Utama */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Foto / Banner Berita Utama
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {gambar ? (
                  <div className="relative aspect-[16/9] max-w-sm mx-auto rounded-xl overflow-hidden shadow-md">
                    <img src={gambar} alt="Preview Berita" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGambar("");
                      }}
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow transition"
                      title="Hapus foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      <span className="text-emerald-700 font-bold">Pilih foto dari perangkat</span> atau seret foto ke sini
                    </div>
                    <p className="text-[10px] text-slate-400">Mendukung format JPG, PNG, WEBP (Maksimal 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-[#004329] hover:bg-[#00321F] text-white font-extrabold text-xs sm:text-sm py-3 px-6 rounded-xl transition shadow-lg hover:shadow-emerald-900/20 active:scale-95 disabled:opacity-50 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>
                  {status === "loading"
                    ? "Menyimpan Berita..."
                    : editingId
                    ? "Simpan Perubahan Berita"
                    : "Terbitkan Berita Sekarang"}
                </span>
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing News Table / List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Daftar Berita yang Sudah Diterbitkan
              </h2>
              <p className="text-xs text-slate-500">
                Total {beritaList.length} berita aktif di portal desa
              </p>
            </div>
            <button
              onClick={loadBerita}
              className="p-2 rounded-xl text-slate-500 hover:text-[#004329] hover:bg-slate-100 transition"
              title="Segarkan daftar berita"
            >
              <RotateCw className={`w-4 h-4 ${loadingList ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          </div>

          {loadingList ? (
            <div className="py-12 text-center text-xs text-slate-400">Memuat daftar berita...</div>
          ) : beritaList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-600">Belum ada berita yang diterbitkan.</p>
              <p>Gunakan formulir di atas untuk menerbitkan berita pertama.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {beritaList.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center">
                      {item.gambar ? (
                        <img
                          src={item.gambar}
                          alt={item.judul}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {item.kategori && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {item.kategori}
                          </span>
                        )}
                        {item.created_at && (
                          <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDateIndonesian(item.created_at)}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                        {item.judul}
                      </h3>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.ringkasan || item.konten}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                    {/* View Live Article Link */}
                    <Link
                      href={`/berita/${item.id}`}
                      target="_blank"
                      className="p-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition flex items-center space-x-1 border border-emerald-200"
                      title="Buka artikel di web"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Lihat</span>
                    </Link>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-2 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-xl transition flex items-center space-x-1 border border-blue-200"
                      title="Edit artikel"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item)}
                      className="p-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center space-x-1 border border-rose-200 disabled:opacity-50"
                      title="Hapus berita"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}