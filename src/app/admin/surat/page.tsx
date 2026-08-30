"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Upload,
  Download,
  Phone,
  RotateCw,
  Trash2,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Plus,
  Edit,
  Save,
  FileCheck,
  Sliders,
  ListPlus,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  PermohonanSurat,
  StatusSurat,
  OpsiSurat,
  FormFieldConfig,
  FieldType,
  defaultOpsiSuratList,
} from "@/types/surat";
import {
  fetchSuratList,
  updateStatusDanFileSurat,
  deletePermohonanSurat,
  fetchOpsiSuratList,
  saveOpsiSuratList,
} from "@/services/suratService";
import { formatDateIndonesian } from "@/utils/formatters";

export default function AdminKelolaSuratPage() {
  const [adminTab, setAdminTab] = useState<"inbox" | "opsi">("inbox");
  const [listSurat, setListSurat] = useState<PermohonanSurat[]>([]);
  const [opsiList, setOpsiList] = useState<OpsiSurat[]>(defaultOpsiSuratList);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"SEMUA" | StatusSurat>("SEMUA");
  const [searchQuery, setSearchQuery] = useState("");

  // Processing Modal State
  const [selectedSurat, setSelectedSurat] = useState<PermohonanSurat | null>(null);
  const [statusInput, setStatusInput] = useState<StatusSurat>("SELESAI");
  const [catatanInput, setCatatanInput] = useState("");
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  // Opsi Surat Form State (with Form Builder)
  const [editingOpsiId, setEditingOpsiId] = useState<string | null>(null);
  const [namaSuratInput, setNamaSuratInput] = useState("");
  const [deskripsiInput, setDeskripsiInput] = useState("");
  const [syaratInput, setSyaratInput] = useState("");
  const [customFields, setCustomFields] = useState<FormFieldConfig[]>([]);

  // New Custom Field Temp Inputs
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldWajib, setNewFieldWajib] = useState(true);

  const [savingOpsi, setSavingOpsi] = useState(false);
  const [feedbackOpsi, setFeedbackOpsi] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [suratData, opsiData] = await Promise.all([
        fetchSuratList(),
        fetchOpsiSuratList(),
      ]);
      setListSurat(suratData);
      if (opsiData && opsiData.length > 0) setOpsiList(opsiData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Process Modal
  const openProcessModal = (surat: PermohonanSurat) => {
    setSelectedSurat(surat);
    setStatusInput(surat.status);
    setCatatanInput(surat.catatan_admin || "");
    setUploadedFileBase64(surat.file_surat_selesai || "");
    setUploadedFileName(surat.nama_file_selesai || "");
  };

  // Handle File Upload on Process Modal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Ukuran file maksimal 8MB.");
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save Processing
  const handleSaveProcess = async () => {
    if (!selectedSurat) return;

    setProcessing(true);
    await updateStatusDanFileSurat(selectedSurat.id, {
      status: statusInput,
      file_surat_selesai: uploadedFileBase64 || undefined,
      nama_file_selesai: uploadedFileName || undefined,
      catatan_admin: catatanInput,
    });
    setProcessing(false);
    setSelectedSurat(null);
    loadData();
  };

  const handleDeleteSurat = async (id: string) => {
    if (confirm("Hapus permohonan surat ini dari daftar?")) {
      await deletePermohonanSurat(id);
      loadData();
    }
  };

  // ==========================================
  // FORM BUILDER HANDLERS
  // ==========================================
  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) {
      alert("Masukkan label kolom pertanyaan terlebih dahulu.");
      return;
    }

    const fieldId = newFieldLabel
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_") + "_" + Math.floor(Math.random() * 1000);

    const newField: FormFieldConfig = {
      id: fieldId,
      label: newFieldLabel.trim(),
      tipe: newFieldType,
      placeholder: newFieldPlaceholder.trim() || undefined,
      wajib: newFieldWajib,
    };

    setCustomFields([...customFields, newField]);
    setNewFieldLabel("");
    setNewFieldPlaceholder("");
    setNewFieldType("text");
    setNewFieldWajib(true);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSaveOpsi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSuratInput.trim()) return;

    setSavingOpsi(true);
    let updated: OpsiSurat[];

    if (editingOpsiId) {
      updated = opsiList.map((o) =>
        o.id === editingOpsiId
          ? {
              ...o,
              nama_surat: namaSuratInput,
              deskripsi: deskripsiInput,
              syarat: syaratInput,
              custom_fields: customFields,
            }
          : o
      );
    } else {
      const newOpsi: OpsiSurat = {
        id: `opsi-${Date.now()}`,
        nama_surat: namaSuratInput,
        deskripsi: deskripsiInput,
        syarat: syaratInput,
        custom_fields: customFields,
      };
      updated = [...opsiList, newOpsi];
    }

    setOpsiList(updated);
    await saveOpsiSuratList(updated);
    setSavingOpsi(false);

    // Reset Form
    setEditingOpsiId(null);
    setNamaSuratInput("");
    setDeskripsiInput("");
    setSyaratInput("");
    setCustomFields([]);
    setFeedbackOpsi("Opsi surat dan susunan formulir berhasil disimpan!");
    setTimeout(() => setFeedbackOpsi(null), 3000);
  };

  const handleEditOpsi = (opsi: OpsiSurat) => {
    setEditingOpsiId(opsi.id);
    setNamaSuratInput(opsi.nama_surat);
    setDeskripsiInput(opsi.deskripsi);
    setSyaratInput(opsi.syarat);
    setCustomFields(opsi.custom_fields || []);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleDeleteOpsi = async (id: string) => {
    if (confirm("Hapus jenis surat ini dari pilihan formulir warga?")) {
      const updated = opsiList.filter((o) => o.id !== id);
      setOpsiList(updated);
      await saveOpsiSuratList(updated);
    }
  };

  // Filtered requests
  const filteredList = listSurat.filter((item) => {
    const matchesFilter = activeFilter === "SEMUA" || item.status === activeFilter;
    const cleanQ = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !cleanQ ||
      item.nama_lengkap.toLowerCase().includes(cleanQ) ||
      item.nik.includes(cleanQ) ||
      item.id.toLowerCase().includes(cleanQ) ||
      item.jenis_surat.toLowerCase().includes(cleanQ);

    return matchesFilter && matchesSearch;
  });

  const countMenunggu = listSurat.filter((s) => s.status === "MENUNGGU").length;
  const countDiproses = listSurat.filter((s) => s.status === "DIPROSES").length;
  const countSelesai = listSurat.filter((s) => s.status === "SELESAI").length;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#004329] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard Admin</span>
            </Link>

            <div className="flex items-center space-x-2">
              <button
                onClick={loadData}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 transition"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
                <span>Segarkan</span>
              </button>
              <Link
                href="/layanan-surat"
                target="_blank"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-sm hover:bg-emerald-50 transition"
              >
                <span>Halaman Publik</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-[#073623] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-500/40 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-emerald-300" />
                <span>Pengaturan Form & Layanan Surat</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Kelola Permohonan & Atur Kolom Formulir Surat
              </h1>
              <p className="text-emerald-100/85 text-xs sm:text-sm max-w-xl">
                Atur kolom data apa saja yang wajib diisi warga untuk setiap jenis surat, verifikasi pengajuan warga, dan upload dokumen surat resmi.
              </p>
            </div>

            {/* Quick Counters */}
            <div className="flex gap-2">
              <div className="bg-white/10 border border-white/15 rounded-2xl p-3 text-center min-w-[90px]">
                <span className="text-[10px] text-emerald-200 font-bold block">Menunggu</span>
                <span className="text-xl font-bold text-amber-300">{countMenunggu}</span>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-2xl p-3 text-center min-w-[90px]">
                <span className="text-[10px] text-emerald-200 font-bold block">Diproses</span>
                <span className="text-xl font-bold text-blue-200">{countDiproses}</span>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-2xl p-3 text-center min-w-[90px]">
                <span className="text-[10px] text-emerald-200 font-bold block">Selesai</span>
                <span className="text-xl font-bold text-emerald-300">{countSelesai}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
          <button
            onClick={() => setAdminTab("inbox")}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 ${
              adminTab === "inbox"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Inbox Permohonan Warga ({listSurat.length})</span>
          </button>

          <button
            onClick={() => setAdminTab("opsi")}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 ${
              adminTab === "opsi"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Atur Opsi & Kolom Form Surat ({opsiList.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: INBOX PERMOHONAN SURAT */}
        {/* ======================================================== */}
        {adminTab === "inbox" && (
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setActiveFilter("SEMUA")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeFilter === "SEMUA"
                      ? "bg-[#063321] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Semua ({listSurat.length})
                </button>
                <button
                  onClick={() => setActiveFilter("MENUNGGU")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeFilter === "MENUNGGU"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-amber-800 bg-amber-50 hover:bg-amber-100"
                  }`}
                >
                  Menunggu ({countMenunggu})
                </button>
                <button
                  onClick={() => setActiveFilter("DIPROSES")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeFilter === "DIPROSES"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-blue-800 bg-blue-50 hover:bg-blue-100"
                  }`}
                >
                  Diproses ({countDiproses})
                </button>
                <button
                  onClick={() => setActiveFilter("SELESAI")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeFilter === "SELESAI"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                  }`}
                >
                  Selesai ({countSelesai})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari Nama / NIK / Tiket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* List Cards */}
            {filteredList.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Tidak Ada Permohonan Surat</h3>
                <p className="text-xs text-slate-500">
                  Belum ada permohonan yang sesuai filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredList.map((item) => {
                  const isSelesai = item.status === "SELESAI";
                  const isDiproses = item.status === "DIPROSES";
                  const isDitolak = item.status === "DITOLAK";

                  const badge = isSelesai ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>SELESAI</span>
                    </span>
                  ) : isDiproses ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>SEDANG DIPROSES</span>
                    </span>
                  ) : isDitolak ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>DITOLAK</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>MENUNGGU</span>
                    </span>
                  );

                  const waMessage = encodeURIComponent(
                    `Halo Bpk/Ibu ${item.nama_lengkap},\n\nPermohonan surat *${item.jenis_surat}* Anda di Desa Bogem telah *${
                      isSelesai ? "SELESAI" : "DITERIMA & SEDANG DIPROSES"
                    }*.\n\nKode Tiket: ${item.id}\n${
                      isSelesai
                        ? "File surat resmi sudah dapat Anda unduh langsung melalui portal web desa di https://desabogem.id/layanan-surat."
                        : ""
                    }\n\nTerima kasih.`
                  );

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/80 space-y-4 hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {item.id}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500 font-medium">
                              {formatDateIndonesian(item.created_at)}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                            {item.jenis_surat}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          {badge}
                          <button
                            onClick={() => handleDeleteSurat(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Hapus permohonan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Detail Info Umum */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block font-medium">Nama Pemohon:</span>
                          <span className="font-bold text-slate-900 text-sm">{item.nama_lengkap}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">NIK KTP:</span>
                          <span className="font-mono font-bold text-slate-800">{item.nik}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">WhatsApp:</span>
                          <span className="font-bold text-emerald-800">{item.no_whatsapp}</span>
                        </div>
                      </div>

                      {/* Dynamic Form Values Filled by Citizen */}
                      {item.data_formulir && Object.keys(item.data_formulir).length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Data Isian Khusus Formulir ({item.jenis_surat}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {Object.entries(item.data_formulir).map(([key, val]) => (
                              <div key={key} className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70">
                                <span className="text-slate-400 block font-medium capitalize">
                                  {key.replace(/_/g, " ")}:
                                </span>
                                <span className="font-bold text-slate-800 whitespace-pre-line">
                                  {val ? String(val) : "-"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-2">
                          {item.no_whatsapp && (
                            <a
                              href={`https://wa.me/${item.no_whatsapp.replace(/[^0-9]/g, "")}?text=${waMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Hubungi WA</span>
                            </a>
                          )}

                          {item.file_surat_selesai && (
                            <a
                              href={item.file_surat_selesai}
                              download={item.nama_file_selesai || "Surat_Desa.pdf"}
                              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-600" />
                              <span>Unduh File Surat</span>
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() => openProcessModal(item)}
                          className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-[#004329] hover:bg-[#00321F] px-4 py-2 rounded-xl transition shadow active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Proses & Upload File Surat</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ATUR OPSI & KOLOM FORMULIR (FORM BUILDER) */}
        {/* ======================================================== */}
        {adminTab === "opsi" && (
          <div className="space-y-6">
            
            {feedbackOpsi && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{feedbackOpsi}</span>
              </div>
            )}

            {/* FORM BUILDER: Tambah / Edit Opsi Surat */}
            <form onSubmit={handleSaveOpsi} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    {editingOpsiId ? "Edit Opsi & Kolom Formulir Surat" : "Buat Opsi Jenis Surat & Kolom Formulir Baru"}
                  </h3>
                </div>
                {editingOpsiId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingOpsiId(null);
                      setNamaSuratInput("");
                      setDeskripsiInput("");
                      setSyaratInput("");
                      setCustomFields([]);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              {/* 1. Informasi Dasar Jenis Surat */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nama Jenis Surat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Surat Keterangan Usaha (SKU) / Surat Pengantar Nikah (N1)"
                    value={namaSuratInput}
                    onChange={(e) => setNamaSuratInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Deskripsi / Kegunaan Surat
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Untuk persyaratan pengajuan pinjaman/KUR atau legalitas usaha."
                      value={deskripsiInput}
                      onChange={(e) => setDeskripsiInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Persyaratan Berkas
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Fotokopi KTP, KK, dan Nama Usaha."
                      value={syaratInput}
                      onChange={(e) => setSyaratInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* 2. FORM BUILDER: Atur Kolom Data yang Wajib Diisi Pemohon */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                      <ListPlus className="w-4 h-4 text-emerald-700" />
                      <span>Kolom Pertanyaan Formulir Khusus Surat Ini ({customFields.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tentukan data diri spesifik apa saja yang perlu diisi oleh pemohon surat ini.
                    </p>
                  </div>
                </div>

                {/* List of configured fields */}
                <div className="space-y-2">
                  {customFields.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                      Belum ada kolom khusus. Tambahkan pertanyaan/input data di bawah.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customFields.map((field, idx) => (
                        <div
                          key={field.id || idx}
                          className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-900">{field.label}</span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] uppercase">
                                {field.tipe === "text"
                                  ? "Teks Singkat"
                                  : field.tipe === "textarea"
                                  ? "Paragraf"
                                  : field.tipe === "number"
                                  ? "Angka"
                                  : "Tanggal"}
                              </span>
                              {field.wajib ? (
                                <span className="text-rose-600 font-bold text-[10px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                  Wajib Diisi
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Opsional</span>
                              )}
                            </div>
                            {field.placeholder && (
                              <span className="text-[11px] text-slate-400 block">
                                Petunjuk: &ldquo;{field.placeholder}&rdquo;
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(idx)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Hapus kolom ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Field Box */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-emerald-900 block">
                    + Tambah Kolom Isian Baru ke Surat Ini
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="sm:col-span-1">
                      <input
                        type="text"
                        placeholder="Nama Pertanyaan (misal: Nama Usaha)"
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="text">Tipe: Teks Singkat</option>
                        <option value="textarea">Tipe: Paragraf / Keterangan</option>
                        <option value="number">Tipe: Angka / Nominal</option>
                        <option value="date">Tipe: Pilihan Tanggal</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Contoh Isian (Placeholder)"
                        value={newFieldPlaceholder}
                        onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newFieldWajib}
                        onChange={(e) => setNewFieldWajib(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Wajib diisi oleh warga</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1 shadow active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sisipkan Kolom</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Save Opsi */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingOpsi}
                  className="bg-[#004329] hover:bg-[#00321F] text-white font-bold text-xs sm:text-sm py-3 px-8 rounded-xl transition shadow active:scale-95 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingOpsi ? "Menyimpan..." : editingOpsiId ? "Simpan Perubahan Opsi & Kolom Form" : "Simpan Jenis Surat Baru"}</span>
                </button>
              </div>
            </form>

            {/* List Existing Letter Options with configured fields preview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Daftar Jenis Surat & Konfigurasi Kolom Form ({opsiList.length})
              </h4>

              <div className="space-y-3">
                {opsiList.map((opsi, idx) => (
                  <div
                    key={opsi.id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#004329] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <h5 className="text-base font-extrabold text-slate-900">{opsi.nama_surat}</h5>
                      </div>

                      {opsi.deskripsi && (
                        <p className="text-xs text-slate-600 pl-8">{opsi.deskripsi}</p>
                      )}

                      {/* Display configured fields badges */}
                      <div className="pl-8 pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-bold mr-1">Kolom Form:</span>
                        {opsi.custom_fields && opsi.custom_fields.length > 0 ? (
                          opsi.custom_fields.map((f, fIdx) => (
                            <span
                              key={fIdx}
                              className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700"
                            >
                              {f.label} {f.wajib && <span className="text-rose-500 font-bold">*</span>}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Kolom data umum</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 self-end sm:self-start flex-shrink-0">
                      <button
                        onClick={() => handleEditOpsi(opsi)}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center space-x-1"
                        title="Edit Opsi & Kolom Form"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Form</span>
                      </button>
                      <button
                        onClick={() => handleDeleteOpsi(opsi.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Hapus Opsi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL PROSES & UPLOAD SURAT */}
      {/* ======================================================== */}
      {selectedSurat && (
        <div className="bg-slate-900/60 backdrop-blur fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Proses & Upload File Surat</h3>
              </div>
              <button
                onClick={() => setSelectedSurat(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Pemohon & Isian Formulir */}
            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-60 overflow-y-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Pemohon:</span>
                <span className="font-bold text-slate-900">{selectedSurat.nama_lengkap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NIK:</span>
                <span className="font-mono font-bold text-slate-900">{selectedSurat.nik}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jenis Surat:</span>
                <span className="font-bold text-emerald-800">{selectedSurat.jenis_surat}</span>
              </div>

              {selectedSurat.data_formulir && Object.keys(selectedSurat.data_formulir).length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Rincian Data Isian Pemohon:</span>
                  {Object.entries(selectedSurat.data_formulir).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-slate-500 capitalize">{k.replace(/_/g, " ")}:</span>
                      <span className="font-semibold text-slate-900 text-right">{String(v || "-")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Status Permohonan</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as StatusSurat)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="SELESAI">SELESAI (Dokumen Siap Diunduh Warga)</option>
                  <option value="DIPROSES">SEDANG DIPROSES (Dalam Pengerjaan)</option>
                  <option value="MENUNGGU">MENUNGGU (Belum Diverifikasi)</option>
                  <option value="DITOLAK">DITOLAK (Berkas Tidak Lengkap)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Upload File Surat Jadi (.PDF / .DOC / .DOCX / Gambar Scan)
                </label>
                
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50 hover:bg-emerald-50/50">
                  <input
                    type="file"
                    id="file-surat-upload-modal"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <label htmlFor="file-surat-upload-modal" className="cursor-pointer block space-y-1">
                    <Upload className="w-6 h-6 text-emerald-700 mx-auto" />
                    <span className="text-xs font-bold text-slate-800 block">
                      {uploadedFileName ? uploadedFileName : "Klik untuk Pilih File Dokumen Surat"}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Format: PDF, Word (DOC/DOCX), atau JPG/PNG (Maks. 8MB)
                    </span>
                  </label>
                </div>

                {uploadedFileName && (
                  <div className="flex items-center justify-between text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-1.5 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold truncate">{uploadedFileName}</span>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFileBase64("");
                        setUploadedFileName("");
                      }}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold ml-2"
                    >
                      Hapus File
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Catatan untuk Pemohon (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  placeholder="Contoh: Surat resmi telah ditandatangani Kepala Desa dan siap diunduh."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSurat(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleSaveProcess}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition shadow active:scale-95 flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{processing ? "Menyimpan..." : "Simpan & Perbarui Status"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
