"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  Download,
  Send,
  Info,
  Sparkles,
  ListPlus,
} from "lucide-react";
import { OpsiSurat, PermohonanSurat, CreatePermohonanInput, defaultOpsiSuratList } from "@/types/surat";
import {
  fetchOpsiSuratList,
  createPermohonanSurat,
  searchSuratByQuery,
  getLocalOpsiSurat,
} from "@/services/suratService";
import { formatDateIndonesian } from "@/utils/formatters";

export default function LayananSuratPage() {
  const [activeTab, setActiveTab] = useState<"form" | "lacak">("form");
  const [opsiList, setOpsiList] = useState<OpsiSurat[]>(defaultOpsiSuratList);

  // Form State
  const [selectedOpsiId, setSelectedOpsiId] = useState<string>("");
  const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noWhatsapp, setNoWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  // Dynamic Form Values
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  const [submitting, setSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<PermohonanSurat | null>(null);
  const [copied, setCopied] = useState(false);

  // Tracking State
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<PermohonanSurat[] | null>(null);

  useEffect(() => {
    const local = getLocalOpsiSurat();
    if (local && local.length > 0) {
      setOpsiList(local);
      setSelectedOpsiId(local[0].id);
    }

    async function loadOpsi() {
      try {
        const remote = await fetchOpsiSuratList();
        if (remote && remote.length > 0) {
          setOpsiList(remote);
          setSelectedOpsiId((prev) => prev || remote[0].id);
        }
      } catch {
        // ignore
      }
    }
    loadOpsi();

    const handleUpdate = () => {
      loadOpsi();
    };

    window.addEventListener("local_opsi_surat_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("local_opsi_surat_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const selectedOpsi = opsiList.find((o) => o.id === selectedOpsiId) || opsiList[0];

  const handleDynamicChange = (fieldId: string, value: any) => {
    setDynamicValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || !namaLengkap || !noWhatsapp || !selectedOpsi) {
      alert("Mohon lengkapi seluruh kolom wajib yang bertanda bintang (*).");
      return;
    }

    // Validate dynamic required fields
    if (selectedOpsi.custom_fields && selectedOpsi.custom_fields.length > 0) {
      for (const field of selectedOpsi.custom_fields) {
        if (field.wajib && (!dynamicValues[field.id] || String(dynamicValues[field.id]).trim() === "")) {
          alert(`Mohon lengkapi kolom "${field.label}" yang wajib diisi.`);
          return;
        }
      }
    }

    setSubmitting(true);
    const input: CreatePermohonanInput = {
      nik,
      nama_lengkap: namaLengkap,
      no_whatsapp: noWhatsapp,
      email: email || undefined,
      jenis_surat: selectedOpsi.nama_surat,
      data_formulir: dynamicValues,
    };

    const res = await createPermohonanSurat(input);
    setSubmitting(false);

    if (res.success && res.data) {
      setSuccessTicket(res.data);
      setDynamicValues({});
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    const res = await searchSuratByQuery(searchQuery);
    setSearchResult(res);
    setSearching(false);
  };

  const handleCopyTicket = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-28 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-br from-[#00321F] via-[#004A2F] to-[#006643] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <FileText className="w-80 h-80 sm:w-96 sm:h-96 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Layanan Administrasi Warga Mandiri</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Layanan Pengajuan Surat Desa
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm lg:text-base leading-relaxed">
              Pilih jenis surat yang Anda butuhkan, isi data formulir permohonan sesuai persyaratan, dan pantau statusnya secara online. Dokumen surat resmi yang telah selesai dapat langsung diunduh di sini.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 ${
              activeTab === "form"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>1. Ajukan Surat Baru</span>
          </button>

          <button
            onClick={() => setActiveTab("lacak")}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 ${
              activeTab === "lacak"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>2. Lacak & Unduh Surat</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: FORMULIR PENGAJUAN SURAT DINAMIS */}
        {/* ======================================================== */}
        {activeTab === "form" && (
          <div className="space-y-6">
            
            {/* Modal Sukses Pengajuan */}
            {successTicket && (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg animate-in zoom-in-95 duration-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-extrabold text-emerald-900">
                      Permohonan Surat Berhasil Dikirim!
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                      Permohonan Anda telah diterima petugas Desa Bogem untuk diverifikasi dan diproses.
                    </p>
                  </div>
                </div>

                {/* Ticket Box */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Kode Tiket Pelacakan Anda
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-[#004329] tracking-wider">
                      {successTicket.id}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyTicket(successTicket.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? "Berhasil Disalin!" : "Salin Kode Tiket"}</span>
                  </button>
                </div>

                <div className="text-xs text-emerald-800/90 space-y-1">
                  <p>• Simpan kode tiket di atas untuk mengecek status dan mengunduh file surat di tab <strong>Lacak & Unduh Surat</strong>.</p>
                  <p>• Pemberitahuan juga akan dikirimkan ke WhatsApp Anda: <strong>{successTicket.no_whatsapp}</strong>.</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSuccessTicket(null)}
                    className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
                  >
                    Tutup Notifikasi & Ajukan Surat Lain
                  </button>
                </div>
              </div>
            )}

            {/* Main Dynamic Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
              
              {/* Step 1: Pilih Jenis Surat */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#004329] text-white flex items-center justify-center text-xs font-extrabold">1</span>
                    <span>Pilih Jenis Surat yang Ingin Dibuat</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Pilihan Surat Desa <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedOpsiId}
                    onChange={(e) => {
                      setSelectedOpsiId(e.target.value);
                      setDynamicValues({}); // Reset dynamic values when changing letter type
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {opsiList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nama_surat}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedOpsi && (
                  <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-2xl space-y-1 text-xs text-emerald-900">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Info className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span>{selectedOpsi.nama_surat}</span>
                    </div>
                    {selectedOpsi.deskripsi && (
                      <p className="text-emerald-800 leading-relaxed pl-5">
                        <strong>Keterangan:</strong> {selectedOpsi.deskripsi}
                      </p>
                    )}
                    {selectedOpsi.syarat && (
                      <p className="text-emerald-800/90 leading-relaxed pl-5">
                        <strong>Persyaratan Berkas:</strong> {selectedOpsi.syarat}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Data Pemohon Umum */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#004329] text-white flex items-center justify-center text-xs font-extrabold">2</span>
                    <span>Identitas Pemohon</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      NIK KTP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      required
                      placeholder="16 Digit NIK KTP Anda"
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nama Lengkap Pemohon <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap sesuai KTP"
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="08123456789"
                      value={noWhatsapp}
                      onChange={(e) => setNoWhatsapp(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-emerald-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400 block">Pemberitahuan surat selesai akan dikirimkan ke nomor ini.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      placeholder="nama@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: DYNAMIC FORM FIELDS (Configured by Admin for this specific letter) */}
              {selectedOpsi && selectedOpsi.custom_fields && selectedOpsi.custom_fields.length > 0 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-[#004329] text-white flex items-center justify-center text-xs font-extrabold">3</span>
                      <span>Rincian Data Khusus ({selectedOpsi.nama_surat})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedOpsi.custom_fields.map((field) => {
                      const isFullWidth = field.tipe === "textarea";
                      const val = dynamicValues[field.id] || "";

                      return (
                        <div
                          key={field.id}
                          className={`space-y-1.5 ${isFullWidth ? "sm:col-span-2" : ""}`}
                        >
                          <label className="text-xs font-bold text-slate-700 block">
                            {field.label} {field.wajib && <span className="text-rose-500">*</span>}
                          </label>

                          {field.tipe === "textarea" ? (
                            <textarea
                              rows={3}
                              required={field.wajib}
                              placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}...`}
                              value={val}
                              onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
                            />
                          ) : field.tipe === "date" ? (
                            <input
                              type="date"
                              required={field.wajib}
                              value={val}
                              onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                            />
                          ) : field.tipe === "number" ? (
                            <input
                              type="number"
                              required={field.wajib}
                              placeholder={field.placeholder || "0"}
                              value={val}
                              onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                            />
                          ) : (
                            <input
                              type="text"
                              required={field.wajib}
                              placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}...`}
                              value={val}
                              onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  Data yang Anda isi akan masuk ke antrean operator desa untuk diproses.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-[#004329] hover:bg-[#00321F] text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Mengirim Permohonan..." : "Kirim Permohonan Surat"}</span>
                </button>
              </div>

            </form>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LACAK & UNDUH SURAT */}
        {/* ======================================================== */}
        {activeTab === "lacak" && (
          <div className="space-y-6">
            
            {/* Search Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Lacak Status & Unduh Surat Selesai
                </h3>
                <p className="text-xs text-slate-500">
                  Masukkan <strong>Kode Tiket</strong> (misal: <code>SRT-202508-4921</code>) atau <strong>NIK KTP</strong> pemohon.
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SRT-202508-4921 atau NIK 16 digit"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="bg-[#004329] hover:bg-[#00321F] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{searching ? "Mencari..." : "Lacak Status"}</span>
                </button>
              </form>
            </div>

            {/* Results Display */}
            {searchResult && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Hasil Pencarian ({searchResult.length} Permohonan)
                </h4>

                {searchResult.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-2">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">Permohonan Tidak Ditemukan</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Pastikan Kode Tiket atau NIK yang Anda masukkan sudah benar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResult.map((item) => {
                      const isSelesai = item.status === "SELESAI";
                      const isDiproses = item.status === "DIPROSES";
                      const isDitolak = item.status === "DITOLAK";

                      const statusBadge = isSelesai ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>SELESAI (SIAP DIUNDUH)</span>
                        </span>
                      ) : isDiproses ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                          <span>SEDANG DIPROSES</span>
                        </span>
                      ) : isDitolak ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>DITOLAK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>MENUNGGU VERIFIKASI</span>
                        </span>
                      );

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4 transition hover:shadow-md"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                                Kode Tiket: {item.id}
                              </span>
                              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                                {item.jenis_surat}
                              </h3>
                            </div>
                            <div>{statusBadge}</div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block">Nama Pemohon:</span>
                              <span className="font-bold text-slate-800">{item.nama_lengkap}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">NIK:</span>
                              <span className="font-mono font-bold text-slate-800">{item.nik}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Tanggal Pengajuan:</span>
                              <span className="font-medium text-slate-700">{formatDateIndonesian(item.created_at)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">No. WhatsApp:</span>
                              <span className="font-bold text-emerald-800">{item.no_whatsapp}</span>
                            </div>
                          </div>

                          {/* Dynamic Form Values Filled */}
                          {item.data_formulir && Object.keys(item.data_formulir).length > 0 && (
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                              <span className="font-bold text-slate-700 block">Data yang Diajukan:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(item.data_formulir).map(([k, v]) => (
                                  <div key={k}>
                                    <span className="text-slate-400 block capitalize">{k.replace(/_/g, " ")}:</span>
                                    <span className="font-semibold text-slate-800">{String(v || "-")}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Catatan Petugas */}
                          {item.catatan_admin && (
                            <div className="bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-700 border border-slate-200">
                              <strong>Catatan Petugas Desa:</strong> {item.catatan_admin}
                            </div>
                          )}

                          {/* DOWNLOAD BUTTON IF FINISHED & FILE AVAILABLE */}
                          {isSelesai && (
                            <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 bg-emerald-50/50 p-4 rounded-2xl">
                              <div className="text-xs text-emerald-900">
                                <span className="font-bold block">Dokumen Surat Resmi Tersedia</span>
                                <span className="text-[11px] text-emerald-700">
                                  {item.nama_file_selesai || "Surat_Keterangan_Resmi.pdf"}
                                </span>
                              </div>

                              {item.file_surat_selesai ? (
                                <a
                                  href={item.file_surat_selesai}
                                  download={item.nama_file_selesai || "Surat_Desa_Bogem.pdf"}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow active:scale-95"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>Unduh Surat Selesai</span>
                                </a>
                              ) : (
                                <span className="text-xs text-slate-500 italic">
                                  Silakan ambil cetakan fisik surat di Balai Desa Bogem.
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
