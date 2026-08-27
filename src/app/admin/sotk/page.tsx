"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchPerangkatList, createPerangkat, updatePerangkat, deletePerangkat } from "@/services/perangkatService";
import { PerangkatItem } from "@/types/perangkat";
import { compressImage } from "@/utils/imageCompressor";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Lock,
  LogIn,
  Upload,
  User,
  X,
  Trash2,
  Edit,
  RotateCw,
  Users,
  ShieldCheck,
  Award,
  Sparkles
} from "lucide-react";
import Link from "next/link";

const JABATAN_PRESETS = [
  "Kepala Desa",
  "Sekretaris Desa",
  "Kaur Keuangan",
  "Kaur Perencanaan",
  "Kaur Tata Usaha & Umum",
  "Kasi Pemerintahan",
  "Kasi Kesejahteraan",
  "Kasi Pelayanan",
  "Kepala Dusun I",
  "Kepala Dusun II",
  "Kepala Dusun III",
  "Ketua BPD",
  "Staf Administrasi",
  "Lainnya (Tulis Manual)",
];

export default function KelolaSOTKAdmin() {
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("Kepala Desa");
  const [customJabatan, setCustomJabatan] = useState("");
  const [urutan, setUrutan] = useState<number>(1);
  const [foto, setFoto] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Edit Mode state
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "sukses" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // List data state
  const [perangkatList, setPerangkatList] = useState<PerangkatItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const loadPerangkat = async () => {
    setLoadingList(true);
    try {
      const items = await fetchPerangkatList();
      setPerangkatList(items);
    } catch {
      // ignore
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadPerangkat();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFeedbackMessage("Berkas harus berupa gambar (JPG, PNG, WEBP).");
      setStatus("error");
      return;
    }

    try {
      const compressed = await compressImage(file, 800, 1000, 0.82);
      setFoto(compressed);
      setStatus("idle");
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFoto(event.target.result as string);
          setStatus("idle");
        }
      };
      reader.readAsDataURL(file);
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
    setNama("");
    setJabatan("Kepala Desa");
    setCustomJabatan("");
    setUrutan(perangkatList.length + 1);
    setFoto("");
    setEditingId(null);
  };

  const startEdit = (item: PerangkatItem) => {
    setEditingId(item.id);
    setNama(item.nama);
    if (JABATAN_PRESETS.includes(item.jabatan)) {
      setJabatan(item.jabatan);
      setCustomJabatan("");
    } else {
      setJabatan("Lainnya (Tulis Manual)");
      setCustomJabatan(item.jabatan);
    }
    setUrutan(item.urutan || 1);
    setFoto(item.foto || "");
    setStatus("idle");
    setFeedbackMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setFeedbackMessage("");

    const finalJabatan = jabatan === "Lainnya (Tulis Manual)" ? customJabatan.trim() : jabatan;

    if (!finalJabatan) {
      setStatus("error");
      setFeedbackMessage("Jabatan tidak boleh kosong.");
      return;
    }

    if (editingId !== null) {
      // Update Mode
      const res = await updatePerangkat(editingId, {
        nama,
        jabatan: finalJabatan,
        urutan: Number(urutan) || 1,
        foto: foto || undefined,
      });

      if (!res.success) {
        setStatus("error");
        setFeedbackMessage(res.error || "Gagal memperbarui data perangkat.");
      } else {
        setStatus("sukses");
        setFeedbackMessage(`Data "${nama}" berhasil diperbarui!`);
        resetForm();
        await loadPerangkat();
      }
    } else {
      // Create Mode
      const res = await createPerangkat({
        nama,
        jabatan: finalJabatan,
        urutan: Number(urutan) || perangkatList.length + 1,
        foto: foto || undefined,
      });

      if (!res.success) {
        setStatus("error");
        setFeedbackMessage(res.error || "Gagal menambahkan perangkat baru.");
      } else {
        setStatus("sukses");
        setFeedbackMessage(`Perangkat desa "${nama}" berhasil ditambahkan ke SOTK!`);
        resetForm();
        await loadPerangkat();
      }
    }
  };

  const handleDelete = async (item: PerangkatItem) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus data perangkat "${item.nama}" (${item.jabatan}) dari SOTK?`
    );
    if (!confirmDelete) return;

    setDeletingId(item.id);
    try {
      await deletePerangkat(item.id, item.nama);
      setFeedbackMessage(`Data "${item.nama}" berhasil dihapus.`);
      setTimeout(() => setFeedbackMessage(""), 4000);
      if (editingId === item.id) resetForm();
      await loadPerangkat();
    } catch {
      alert("Gagal menghapus perangkat desa.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/admin"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#004329] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Admin</span>
        </Link>

        {/* Section 1: Formulir Tambah / Edit Perangkat Desa */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                <Users className="w-4 h-4" />
                <span>Struktur Organisasi & Tata Kerja</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {editingId ? "Edit Data Perangkat Desa" : "Tambah Perangkat Desa Baru"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Kelola data Kepala Desa, Sekretaris Desa, Kepala Seksi, Kepala Urusan, dan Kepala Dusun.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                Batal Edit (Mode Baru)
              </button>
            )}
          </div>

          {status === "sukses" && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center space-x-3 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {status === "error" && (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 flex items-center space-x-3 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{feedbackMessage || "Terjadi kesalahan saat menyimpan data."}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                  placeholder="Contoh: H. Suratno, S.Sos."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jabatan / Posisi SOTK
                </label>
                <select
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                >
                  {JABATAN_PRESETS.map((jab) => (
                    <option key={jab} value={jab}>
                      {jab}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {jabatan === "Lainnya (Tulis Manual)" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tulis Jabatan Khusus
                </label>
                <input
                  type="text"
                  required
                  value={customJabatan}
                  onChange={(e) => setCustomJabatan(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                  placeholder="Contoh: Staf IT Desa / Operator Smart Village"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Urutan Tampil (Hierarki 1, 2, 3...)
              </label>
              <input
                type="number"
                min={1}
                required
                value={urutan}
                onChange={(e) => setUrutan(parseInt(e.target.value) || 1)}
                className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium"
                placeholder="1 = Kepala Desa, 2 = Sekdes, 3+: Kaur & Kasi, dst."
              />
              <span className="text-[11px] text-slate-400">1: Kepala Desa, 2: Sekretaris Desa, 3+: Kaur & Kasi</span>
            </div>

            {/* Direct Drag & Drop Photo Upload Box */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5">
                <User className="w-4 h-4 text-emerald-700" />
                <span>Foto Resmi Perangkat Desa (Opsional)</span>
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
                className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50 scale-[1.01]"
                    : "border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-slate-100/80"
                }`}
              >
                {foto ? (
                  <div className="space-y-3">
                    <div className="relative w-32 h-40 mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-emerald-600 bg-slate-100">
                      <img src={foto} alt="Pratinjau Foto" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFoto("");
                        }}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white p-1 rounded-full backdrop-blur"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs font-bold text-emerald-800">
                      <Upload className="w-4 h-4" />
                      <span>Klik atau Seret Gambar Lain untuk Mengganti Foto</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Klik di sini untuk Unggah Foto Perangkat dari Laptop / HP
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Disarankan foto berorientasi potret tegak (3:4 atau pasfoto resmi)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className={`w-full text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs shadow-md ${
                status === "loading"
                  ? "bg-emerald-800/50 cursor-not-allowed"
                  : "bg-[#004329] hover:bg-[#00321F]"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {status === "loading"
                  ? "Menyimpan Data..."
                  : editingId
                  ? "Simpan Perubahan Data"
                  : "Tambahkan ke Struktur SOTK"}
              </span>
            </button>
          </form>
        </div>

        {/* Section 2: Daftar Lengkap & Manajemen SOTK Desa */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>Daftar Aparatur Desa Aktif</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Struktur Perangkat Desa ({perangkatList.length})
              </h2>
            </div>
            <button
              onClick={loadPerangkat}
              disabled={loadingList}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`} />
              <span>Muat Ulang</span>
            </button>
          </div>

          {loadingList ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium animate-pulse">
              Memuat data struktur SOTK...
            </div>
          ) : perangkatList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              Belum ada data aparatur desa. Silakan isi form di atas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {perangkatList.map((item) => {
                const isKades = item.jabatan.toLowerCase().includes("kepala desa") && !item.jabatan.toLowerCase().includes("dusun");

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                      isKades
                        ? "bg-emerald-50/70 border-emerald-300 shadow-sm"
                        : "bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        {item.foto ? (
                          <img src={item.foto} alt={item.nama} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                            <User className="w-7 h-7" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full">
                          #{item.urutan || 99}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-1 flex-grow">
                        <div className="flex items-center space-x-1.5">
                          {isKades ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#004329] text-white">
                              <Sparkles className="w-3 h-3 text-amber-300" />
                              <span>{item.jabatan}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 text-[#004329] border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{item.jabatan}</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.nama}
                        </h3>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/80 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === item.id ? "Menghapus..." : "Hapus"}</span>
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
