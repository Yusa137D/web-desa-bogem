"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchProfilDesa, updateProfilDesa } from "@/services/profilService";
import { BatasWilayah } from "@/types/profil";
import { compressImage } from "@/utils/imageCompressor";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Upload,
  User,
  X,
  Target,
  Plus,
  Trash2,
  FileText,
  RotateCw,
  Sparkles,
  Network,
  History,
  Compass,
  MapPin,
  Image as ImageIcon,
  Check,
  Phone,
  Mail,
  Clock,
  Building2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function KelolaProfilDesaAdmin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-pulse text-emerald-800 text-sm font-bold">Memuat Pengaturan Profil...</div>
      </div>
    }>
      <KelolaProfilDesaContent />
    </Suspense>
  );
}

function KelolaProfilDesaContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") === "kontak" ? "kontak-layanan" : "visi-misi";
  const { user, loading: authLoading } = useAuth();
  const fileInputKadesRef = useRef<HTMLInputElement>(null);
  const fileInputBaganDesaRef = useRef<HTMLInputElement>(null);
  const fileInputBaganBpdRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"visi-misi" | "bagan" | "sejarah-geografis" | "kontak-layanan">(initialTab);

  // Tab 1: Visi, Misi & Sambutan
  const [namaKades, setNamaKades] = useState("");
  const [fotoKades, setFotoKades] = useState("");
  const [sambutanKades, setSambutanKades] = useState("");
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState<string[]>([]);
  const [newMisiInput, setNewMisiInput] = useState("");

  // Tab 2: Bagan Desa & BPD
  const [baganDesaImage, setBaganDesaImage] = useState("");
  const [baganBpdImage, setBaganBpdImage] = useState("");

  // Tab 3: Sejarah & Geografis
  const [sejarah, setSejarah] = useState("");
  const [luasWilayah, setLuasWilayah] = useState("245 Ha");
  const [jumlahPenduduk, setJumlahPenduduk] = useState("3.620 Jiwa");
  const [ketinggian, setKetinggian] = useState("± 78 mdpl");
  const [batasWilayah, setBatasWilayah] = useState<BatasWilayah>({
    utara: "Desa Tladan / Genengan",
    timur: "Desa Pojok / Kawedanan",
    selatan: "Desa Giripurno",
    barat: "Desa Sugihrejo",
  });

  // Tab 4: Jam Layanan & Kontak Kantor
  const [jamPelayanan, setJamPelayanan] = useState("Senin - Jumat: 08.00 - 15.00 WIB");
  const [jamPelayananNote, setJamPelayananNote] = useState("*Sabtu & Minggu: Libur / Pelayanan Darurat");
  const [alamatKantor, setAlamatKantor] = useState("Jl. Bakti Mulya No. 241, Desa Bogem, Kec. Kawedanan, Kab. Magetan");
  const [teleponKantor, setTeleponKantor] = useState("+62 812-3456-7890");
  const [emailKantor, setEmailKantor] = useState("info@desabogem.id");

  const [status, setStatus] = useState<"idle" | "loading" | "sukses" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchProfilDesa();
      setNamaKades(data.nama_kades || "");
      setFotoKades(data.foto_kades || "");
      setSambutanKades(data.sambutan_kades || "");
      setVisi(data.visi || "");
      setMisi(data.misi || []);
      setBaganDesaImage(data.bagan_desa_image || "");
      setBaganBpdImage(data.bagan_bpd_image || "");
      setSejarah(data.sejarah || "");
      setLuasWilayah(data.luas_wilayah || "245 Ha");
      setJumlahPenduduk(data.jumlah_penduduk || "3.620 Jiwa");
      setKetinggian(data.ketinggian || "± 78 mdpl");
      if (data.batas_wilayah) setBatasWilayah(data.batas_wilayah);
      if (data.jam_pelayanan) setJamPelayanan(data.jam_pelayanan);
      if (data.jam_pelayanan_note !== undefined) setJamPelayananNote(data.jam_pelayanan_note);
      if (data.alamat_kantor) setAlamatKantor(data.alamat_kantor);
      if (data.telepon_kantor) setTeleponKantor(data.telepon_kantor);
      if (data.email_kantor) setEmailKantor(data.email_kantor);
    } catch {
      // ignore
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Berkas harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }

    try {
      const compressed = await compressImage(file, 1400, 1000, 0.82);
      setter(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setter(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMisi = () => {
    if (!newMisiInput.trim()) return;
    setMisi([...misi, newMisiInput.trim()]);
    setNewMisiInput("");
  };

  const handleRemoveMisi = (index: number) => {
    setMisi(misi.filter((_, i) => i !== index));
  };

  const handleUpdateMisiItem = (index: number, val: string) => {
    const updated = [...misi];
    updated[index] = val;
    setMisi(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setFeedbackMessage("");

    const res = await updateProfilDesa({
      nama_kades: namaKades,
      foto_kades: fotoKades || undefined,
      sambutan_kades: sambutanKades,
      visi,
      misi,
      bagan_desa_image: baganDesaImage,
      bagan_bpd_image: baganBpdImage,
      sejarah,
      luas_wilayah: luasWilayah,
      jumlah_penduduk: jumlahPenduduk,
      ketinggian,
      batas_wilayah: batasWilayah,
      jam_pelayanan: jamPelayanan,
      jam_pelayanan_note: jamPelayananNote,
      alamat_kantor: alamatKantor,
      telepon_kantor: teleponKantor,
      email_kantor: emailKantor,
    });

    if (!res.success) {
      setStatus("error");
      setFeedbackMessage(res.error || "Gagal menyimpan pembaruan profil desa.");
    } else {
      setStatus("sukses");
      setFeedbackMessage("Data profil desa, kontak, dan jam pelayanan berhasil diperbarui!");
      setTimeout(() => setFeedbackMessage(""), 4000);
      await loadData();
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#004329] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Admin</span>
          </Link>

          <button
            onClick={loadData}
            disabled={loadingData}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition shadow-sm"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin text-emerald-600" : ""}`} />
            <span>Muat Ulang Data</span>
          </button>
        </div>

        {/* Banner Section */}
        <div className="bg-gradient-to-br from-[#00321F] via-[#004A2F] to-[#006643] rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Pengaturan Lengkap Profil & Kontak Desa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Kelola Profil, Kontak & Jam Pelayanan
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Sesuaikan visi misi, sambutan kades, foto bagan organisasi (SOTK & BPD), narasi sejarah, tapal batas wilayah, serta <strong>jam pelayanan kantor dan kontak resmi desa</strong>.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("visi-misi")}
            className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 text-center ${
              activeTab === "visi-misi"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Target className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">1. Visi & Sambutan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bagan")}
            className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 text-center ${
              activeTab === "bagan"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Network className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">2. Bagan SOTK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sejarah-geografis")}
            className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 text-center ${
              activeTab === "sejarah-geografis"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <History className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">3. Sejarah & Wilayah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("kontak-layanan")}
            className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 text-center ${
              activeTab === "kontak-layanan"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">4. Kontak & Jam Layanan</span>
          </button>
        </div>

        {/* Main Content Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
          
          {status === "sukses" && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center space-x-3 text-xs font-semibold animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{feedbackMessage || "Perubahan profil desa berhasil disimpan!"}</span>
            </div>
          )}

          {status === "error" && (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 flex items-center space-x-3 text-xs font-semibold animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{feedbackMessage || "Terjadi kesalahan saat menyimpan data."}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* ======================================================== */}
            {/* TAB 1: VISI, MISI & SAMBUTAN */}
            {/* ======================================================== */}
            {activeTab === "visi-misi" && (
              <div className="space-y-8">
                {/* Sambutan Kepala Desa */}
                <div className="space-y-5 border-b border-slate-100 pb-8">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Sambutan Kepala Desa</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Nama Kepala Desa
                      </label>
                      <input
                        type="text"
                        required
                        value={namaKades}
                        onChange={(e) => setNamaKades(e.target.value)}
                        className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-slate-50 focus:bg-white"
                        placeholder="Contoh: H. Suratno, S.Sos."
                      />
                    </div>

                    {/* Upload Foto Kades */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5">
                        <User className="w-4 h-4 text-emerald-700" />
                        <span>Foto Kepala Desa (Banner Sambutan)</span>
                      </label>

                      <input
                        type="file"
                        ref={fileInputKadesRef}
                        onChange={(e) => handleImageUpload(e, setFotoKades)}
                        accept="image/*"
                        className="hidden"
                      />

                      <div
                        onClick={() => fileInputKadesRef.current?.click()}
                        className="relative rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-slate-100/80"
                      >
                        {fotoKades ? (
                          <div className="flex items-center space-x-4">
                            <div className="relative w-16 h-20 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 flex-shrink-0">
                              <img src={fotoKades} alt="Foto Kades" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-emerald-800 block">
                                Foto Kades Terpilih
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Klik untuk ganti foto
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFotoKades("");
                              }}
                              className="ml-auto bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-3 py-2">
                            <Upload className="w-5 h-5 text-emerald-700" />
                            <span className="text-xs font-bold text-slate-700">
                              Klik untuk unggah foto Kepala Desa
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Teks Kata Sambutan Kepala Desa
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={sambutanKades}
                      onChange={(e) => setSambutanKades(e.target.value)}
                      className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 focus:bg-white"
                      placeholder="Tuliskan kata sambutan resmi kepala desa..."
                    />
                  </div>
                </div>

                {/* Visi Desa */}
                <div className="space-y-4 border-b border-slate-100 pb-8">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <Target className="w-5 h-5" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Visi Utama Desa</h2>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={visi}
                    onChange={(e) => setVisi(e.target.value)}
                    className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 focus:bg-white"
                    placeholder="Tuliskan visi desa..."
                  />
                </div>

                {/* Misi Desa */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <FileText className="w-5 h-5" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Poin Misi Pembangunan ({misi.length})</h2>
                  </div>

                  <div className="space-y-3">
                    {misi.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <textarea
                          rows={2}
                          value={item}
                          onChange={(e) => handleUpdateMisiItem(index, e.target.value)}
                          className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMisi(index)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition flex-shrink-0"
                          title="Hapus poin misi ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newMisiInput}
                      onChange={(e) => setNewMisiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMisi();
                        }
                      }}
                      className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-slate-50 focus:bg-white"
                      placeholder="Ketik butir misi baru, lalu klik Tambah..."
                    />
                    <button
                      type="button"
                      onClick={handleAddMisi}
                      className="bg-[#004329] hover:bg-[#00321F] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1 flex-shrink-0 transition active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Poin</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: BAGAN STRUKTUR ORGANISASI DESA & BPD */}
            {/* ======================================================== */}
            {activeTab === "bagan" && (
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                    <Network className="w-4 h-4" />
                    <span>Upload Foto Bagan Organisasi</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Bagan Struktur Pemerintahan Desa & BPD
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unggah foto / gambar bagan struktur organisasi fisik desa Anda. Foto ini akan tampil di halaman publik dan dapat diperbesar (zoom) oleh warga.
                  </p>
                </div>

                {/* 1. Bagan Struktur Organisasi Pemerintahan Desa */}
                <div className="space-y-3 bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        1. Bagan Struktur Organisasi Pemerintahan Desa (SOTK)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Diagram hierarki Kepala Desa, Sekretaris Desa, Kasi, Kaur, dan Kasun.
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputBaganDesaRef}
                    onChange={(e) => handleImageUpload(e, setBaganDesaImage)}
                    accept="image/*"
                    className="hidden"
                  />

                  {baganDesaImage ? (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-sm max-h-96 flex items-center justify-center p-2">
                        <img
                          src={baganDesaImage}
                          alt="Bagan Struktur Organisasi Desa"
                          className="w-full h-auto max-h-80 object-contain rounded-xl"
                        />
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => fileInputBaganDesaRef.current?.click()}
                          className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
                        >
                          Ganti Foto Bagan
                        </button>
                        <button
                          type="button"
                          onClick={() => setBaganDesaImage("")}
                          className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Bagan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputBaganDesaRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition bg-white hover:bg-emerald-50/40 space-y-2"
                    >
                      <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Klik untuk Unggah Foto Bagan Struktur Pemerintahan Desa
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Format JPG, PNG, atau WEBP (Maks. 8MB). Gambar horizontal/landscape disarankan.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Bagan Struktur Organisasi BPD */}
                <div className="space-y-3 bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        2. Bagan Struktur Organisasi Badan Permusyawaratan Desa (BPD)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Diagram susunan Ketua BPD, Wakil Ketua, Sekretaris, dan Anggota Bidang BPD.
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputBaganBpdRef}
                    onChange={(e) => handleImageUpload(e, setBaganBpdImage)}
                    accept="image/*"
                    className="hidden"
                  />

                  {baganBpdImage ? (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-sm max-h-96 flex items-center justify-center p-2">
                        <img
                          src={baganBpdImage}
                          alt="Bagan Struktur Organisasi BPD"
                          className="w-full h-auto max-h-80 object-contain rounded-xl"
                        />
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => fileInputBaganBpdRef.current?.click()}
                          className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
                        >
                          Ganti Foto Bagan BPD
                        </button>
                        <button
                          type="button"
                          onClick={() => setBaganBpdImage("")}
                          className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Bagan BPD</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputBaganBpdRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition bg-white hover:bg-emerald-50/40 space-y-2"
                    >
                      <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Klik untuk Unggah Foto Bagan Struktur Organisasi BPD
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Format JPG, PNG, atau WEBP (Maks. 8MB). Gambar horizontal/landscape disarankan.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: SEJARAH & GEOGRAFIS DESA */}
            {/* ======================================================== */}
            {activeTab === "sejarah-geografis" && (
              <div className="space-y-8">
                
                {/* Sejarah Desa */}
                <div className="space-y-3 border-b border-slate-100 pb-8">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <History className="w-5 h-5" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Sejarah & Asal-usul Desa</h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    Tuliskan kisah sejarah pembentukan Desa Bogem, nilai kearifan lokal, dan tonggak sejarah penting desa.
                  </p>
                  <textarea
                    rows={6}
                    value={sejarah}
                    onChange={(e) => setSejarah(e.target.value)}
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 focus:bg-white"
                    placeholder="Tuliskan narasi sejarah desa..."
                  />
                </div>

                {/* Geografis & Batas Wilayah */}
                <div className="space-y-5">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <Compass className="w-5 h-5" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Kondisi Geografis & Batas Wilayah</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Luas Wilayah</label>
                      <input
                        type="text"
                        value={luasWilayah}
                        onChange={(e) => setLuasWilayah(e.target.value)}
                        className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        placeholder="Contoh: 245 Ha"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Jumlah Penduduk</label>
                      <input
                        type="text"
                        value={jumlahPenduduk}
                        onChange={(e) => setJumlahPenduduk(e.target.value)}
                        className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        placeholder="Contoh: 3.620 Jiwa"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Ketinggian Tempat</label>
                      <input
                        type="text"
                        value={ketinggian}
                        onChange={(e) => setKetinggian(e.target.value)}
                        className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        placeholder="Contoh: ± 78 mdpl"
                      />
                    </div>
                  </div>

                  {/* Batas-Batas Wilayah */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="text-xs font-extrabold text-[#004329] uppercase tracking-wider flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      <span>Batas Tapal Administratif Wilayah</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Sebelah Utara</label>
                        <input
                          type="text"
                          value={batasWilayah.utara}
                          onChange={(e) => setBatasWilayah({ ...batasWilayah, utara: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Sebelah Timur</label>
                        <input
                          type="text"
                          value={batasWilayah.timur}
                          onChange={(e) => setBatasWilayah({ ...batasWilayah, timur: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Sebelah Selatan</label>
                        <input
                          type="text"
                          value={batasWilayah.selatan}
                          onChange={(e) => setBatasWilayah({ ...batasWilayah, selatan: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Sebelah Barat</label>
                        <input
                          type="text"
                          value={batasWilayah.barat}
                          onChange={(e) => setBatasWilayah({ ...batasWilayah, barat: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: JAM PELAYANAN & KONTAK KANTOR DESA */}
            {/* ======================================================== */}
            {activeTab === "kontak-layanan" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                
                <div>
                  <div className="inline-flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Pengaturan Layanan Publik & Kontak</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Jam Pelayanan Kantor & Kontak Resmi Desa
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data yang diubah di sini akan otomatis tampil di bagian <strong>Footer website utama</strong>, <strong>Halaman Beranda (Peta Layanan)</strong>, dan kontak informasi warga.
                  </p>
                </div>

                {/* 1. Jam Pelayanan Kantor */}
                <div className="space-y-4 bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200/80">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <Clock className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      1. Jam Pelayanan Kantor Desa
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Jadwal Jam Kerja / Pelayanan
                      </label>
                      <input
                        type="text"
                        required
                        value={jamPelayanan}
                        onChange={(e) => setJamPelayanan(e.target.value)}
                        className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-white"
                        placeholder="Contoh: Senin - Jumat: 08.00 - 15.00 WIB"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 block">Pilihan Cepat Format Jadwal:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setJamPelayanan("Senin - Jumat: 08.00 - 15.00 WIB")}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition"
                        >
                          Senin - Jumat: 08.00 - 15.00 WIB
                        </button>
                        <button
                          type="button"
                          onClick={() => setJamPelayanan("Senin - Kamis: 08.00 - 15.00 WIB | Jumat: 08.00 - 11.30 WIB")}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition"
                        >
                          Senin - Kamis: 08.00 - 15.00 WIB | Jumat: 08.00 - 11.30 WIB
                        </button>
                        <button
                          type="button"
                          onClick={() => setJamPelayanan("Senin - Sabtu: 08.00 - 14.00 WIB")}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition"
                        >
                          Senin - Sabtu: 08.00 - 14.00 WIB
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Keterangan Tambahan / Libur / Pelayanan Darurat
                      </label>
                      <input
                        type="text"
                        value={jamPelayananNote}
                        onChange={(e) => setJamPelayananNote(e.target.value)}
                        className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-white"
                        placeholder="Contoh: *Sabtu & Minggu: Libur / Pelayanan Darurat"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Kontak Kantor Desa */}
                <div className="space-y-4 bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200/80">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <Building2 className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      2. Kontak & Alamat Kantor Desa
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Alamat Lengkap Kantor Desa</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={alamatKantor}
                        onChange={(e) => setAlamatKantor(e.target.value)}
                        className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-white leading-relaxed"
                        placeholder="Contoh: Jl. Bakti Mulya No. 241, Desa Bogem, Kec. Kawedanan, Kab. Magetan"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Nomor Telepon / WhatsApp Kantor</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={teleponKantor}
                          onChange={(e) => setTeleponKantor(e.target.value)}
                          className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-white"
                          placeholder="Contoh: +62 812-3456-7890"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Email Resmi Kantor Desa</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={emailKantor}
                          onChange={(e) => setEmailKantor(e.target.value)}
                          className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-slate-800 font-medium bg-white"
                          placeholder="Contoh: info@desabogem.id"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Live Preview (Pratinjau Langsung Tampilan Footer) */}
                <div className="bg-[#002517] text-emerald-100 rounded-3xl p-6 sm:p-8 border border-emerald-900/60 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Eye className="w-4 h-4" />
                      <span>Pratinjau Langsung Footer Website</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                      Tampilan Publik
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                    
                    {/* Column A: Jam Pelayanan */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
                        Jam Pelayanan Kantor
                      </h4>
                      <div className="space-y-1.5 text-xs text-emerald-200/90">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{jamPelayanan || "(Belum diisi)"}</span>
                        </div>
                        {jamPelayananNote && (
                          <div className="flex items-center space-x-2 text-emerald-400/70 text-[11px] mt-1">
                            <span>{jamPelayananNote}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column B: Kontak Kantor Desa */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
                        Kontak Kantor Desa
                      </h4>
                      <ul className="space-y-2 text-xs text-emerald-200/90">
                        <li className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{alamatKantor || "(Belum diisi)"}</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{teleponKantor || "(Belum diisi)"}</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{emailKantor || "(Belum diisi)"}</span>
                        </li>
                      </ul>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* Save Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs sm:text-sm shadow-md active:scale-95 ${
                  status === "loading"
                    ? "bg-emerald-800/50 cursor-not-allowed"
                    : "bg-[#004329] hover:bg-[#00321F]"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{status === "loading" ? "Menyimpan Perubahan..." : "Simpan Semua Perubahan Profil Desa"}</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </main>
  );
}
