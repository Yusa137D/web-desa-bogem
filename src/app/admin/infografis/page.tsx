"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PieChart,
  Users,
  Briefcase,
  GraduationCap,
  Wallet,
  Award,
  Save,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Store,
  TreePine,
  TrendingUp,
  Sparkles,
  Calculator,
  Percent,
} from "lucide-react";
import {
  fetchInfografisData,
  updateInfografisData,
  defaultInfografisData,
} from "@/services/infografisService";
import {
  StatDemografi,
  ItemPekerjaan,
  ItemPendidikan,
  ItemRincianAnggaran,
  StatIDM,
} from "@/types/infografis";

// Helper to extract clean numeric value
const parseNumber = (val: string | number | undefined): number => {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const digits = String(val).replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
};

// IDM Helper: Determine Category and Badge from score
const getIDMStatusInfo = (score: number) => {
  if (score >= 0.8155) {
    return {
      status: "DESA MANDIRI",
      label: "Desa Mandiri",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      description: "Skor ≥ 0.8155 (Maju, Mandiri & Berkelanjutan)",
    };
  }
  if (score >= 0.7072) {
    return {
      status: "DESA MAJU",
      label: "Desa Maju",
      badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
      description: "Skor 0.7072 - 0.8155 (Desa Maju)",
    };
  }
  if (score >= 0.5989) {
    return {
      status: "DESA BERKEMBANG",
      label: "Desa Berkembang",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      description: "Skor 0.5989 - 0.7072 (Desa Berkembang)",
    };
  }
  if (score >= 0.4907) {
    return {
      status: "DESA TERTINGGAL",
      label: "Desa Tertinggal",
      badgeClass: "bg-orange-100 text-orange-900 border-orange-300",
      description: "Skor 0.4907 - 0.5989 (Desa Tertinggal)",
    };
  }
  return {
    status: "DESA SANGAT TERTINGGAL",
    label: "Desa Sangat Tertinggal",
    badgeClass: "bg-rose-100 text-rose-900 border-rose-300",
    description: "Skor < 0.4907 (Perlu Akselerasi Khusus)",
  };
};

// Sub-index qualitative label
const getSubIndexLabel = (score: number) => {
  if (score >= 0.8) return "Sangat Baik (Mandiri)";
  if (score >= 0.7) return "Baik (Maju)";
  if (score >= 0.6) return "Cukup (Berkembang)";
  return "Perlu Ditingkatkan";
};

export default function KelolaInfografisAdmin() {
  const [activeTab, setActiveTab] = useState<"demografi" | "pekerjaan" | "apbdes" | "idm">("demografi");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // States
  const [demografi, setDemografi] = useState<StatDemografi>(defaultInfografisData.demografi);
  const [pekerjaanList, setPekerjaanList] = useState<ItemPekerjaan[]>(defaultInfografisData.pekerjaan);
  const [pendidikanList, setPendidikanList] = useState<ItemPendidikan[]>(defaultInfografisData.pendidikan);
  
  // APBDes States
  const [tahunAnggaran, setTahunAnggaran] = useState(defaultInfografisData.apbdes.tahun_anggaran);
  const [pendapatanRincian, setPendapatanRincian] = useState<ItemRincianAnggaran[]>(defaultInfografisData.apbdes.pendapatan_rincian);
  const [belanjaRincian, setBelanjaRincian] = useState<ItemRincianAnggaran[]>(defaultInfografisData.apbdes.belanja_rincian);

  // IDM States
  const [idmData, setIdmData] = useState<StatIDM>(defaultInfografisData.idm);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchInfografisData();
      setDemografi(data.demografi || defaultInfografisData.demografi);
      setPekerjaanList(data.pekerjaan || defaultInfografisData.pekerjaan);
      setPendidikanList(data.pendidikan || defaultInfografisData.pendidikan);
      setTahunAnggaran(data.apbdes?.tahun_anggaran || "2024");
      setPendapatanRincian(data.apbdes?.pendapatan_rincian || defaultInfografisData.apbdes.pendapatan_rincian);
      setBelanjaRincian(data.apbdes?.belanja_rincian || defaultInfografisData.apbdes.belanja_rincian);
      setIdmData(data.idm || defaultInfografisData.idm);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================================
  // 1. OTOMATISASI DEMOGRAFI
  // ============================================================================
  const totalPriaWanita = (demografi.pria || 0) + (demografi.wanita || 0);
  const persenPria = totalPriaWanita > 0 ? ((demografi.pria / totalPriaWanita) * 100).toFixed(1) : "0";
  const persenWanita = totalPriaWanita > 0 ? ((demografi.wanita / totalPriaWanita) * 100).toFixed(1) : "0";
  const displayTotalPenduduk = demografi.total_penduduk || totalPriaWanita;
  const kepadatan = demografi.luas_wilayah > 0 ? (displayTotalPenduduk / demografi.luas_wilayah).toFixed(1) : "0";
  const rataKK = demografi.kepala_keluarga > 0 ? (displayTotalPenduduk / demografi.kepala_keluarga).toFixed(1) : "0";

  // Auto-sync Total Penduduk if pria or wanita changed
  const handlePriaChange = (val: number) => {
    const newPria = val;
    setDemografi((prev) => ({
      ...prev,
      pria: newPria,
      total_penduduk: newPria + prev.wanita,
    }));
  };

  const handleWanitaChange = (val: number) => {
    const newWanita = val;
    setDemografi((prev) => ({
      ...prev,
      wanita: newWanita,
      total_penduduk: prev.pria + newWanita,
    }));
  };

  // ============================================================================
  // 2. OTOMATISASI PEKERJAAN & PENDIDIKAN
  // ============================================================================
  const totalWargaPekerja = useMemo(() => {
    return pekerjaanList.reduce((acc, item) => acc + parseNumber(item.count), 0);
  }, [pekerjaanList]);

  const totalWargaPendidikan = useMemo(() => {
    return pendidikanList.reduce((acc, item) => acc + parseNumber(item.count), 0);
  }, [pendidikanList]);

  // Handler for Pekerjaan count change (auto updates persen)
  const handlePekerjaanCountChange = (idx: number, rawCount: string) => {
    const num = parseNumber(rawCount);
    const updated = [...pekerjaanList];
    updated[idx] = {
      ...updated[idx],
      count: num > 0 ? `${num.toLocaleString("id-ID")} Warga` : "0 Warga",
    };
    setPekerjaanList(updated);
  };

  // Handler for Pendidikan count change (auto updates persen)
  const handlePendidikanCountChange = (idx: number, rawCount: string) => {
    const num = parseNumber(rawCount);
    const updated = [...pendidikanList];
    updated[idx] = {
      ...updated[idx],
      count: num > 0 ? `${num.toLocaleString("id-ID")} Warga` : "0 Warga",
    };
    setPendidikanList(updated);
  };

  // ============================================================================
  // 3. OTOMATISASI APBDES (TOTAL, SURPLUS/DEFISIT, PERSENTASE PER POS)
  // ============================================================================
  const totalPendapatan = useMemo(() => {
    return pendapatanRincian.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
  }, [pendapatanRincian]);

  const totalBelanja = useMemo(() => {
    return belanjaRincian.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
  }, [belanjaRincian]);

  const surplusDefisit = totalPendapatan - totalBelanja;

  // ============================================================================
  // 4. OTOMATISASI IDM (SKOR TOTAL & KATEGORI STATUS DARI SUB-INDEKS)
  // ============================================================================
  const computedIDMScore = useMemo(() => {
    const avg = ((idmData.iks?.skor || 0) + (idmData.ike?.skor || 0) + (idmData.ikl?.skor || 0)) / 3;
    return Number(avg.toFixed(4));
  }, [idmData.iks?.skor, idmData.ike?.skor, idmData.ikl?.skor]);

  const idmStatusInfo = useMemo(() => {
    return getIDMStatusInfo(idmData.skorTotal || computedIDMScore);
  }, [idmData.skorTotal, computedIDMScore]);

  // Auto-calculate sub-index changes and sync status
  const handleSubIndexScoreChange = (type: "iks" | "ike" | "ikl", newScore: number) => {
    const updated = {
      ...idmData,
      [type]: {
        ...idmData[type],
        skor: newScore,
        label: getSubIndexLabel(newScore),
      },
    };

    const newAvg = Number(
      (((type === "iks" ? newScore : idmData.iks.skor) +
        (type === "ike" ? newScore : idmData.ike.skor) +
        (type === "ikl" ? newScore : idmData.ikl.skor)) /
        3).toFixed(4)
    );

    updated.skorTotal = newAvg;
    updated.status = getIDMStatusInfo(newAvg).status;

    setIdmData(updated);
  };

  // ============================================================================
  // SAVE HANDLERS WITH FINAL AUTO-CALCULATED DATA
  // ============================================================================
  const handleSaveDemografi = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const finalDemografi: StatDemografi = {
      ...demografi,
      total_penduduk: demografi.total_penduduk || totalPriaWanita,
    };

    const res = await updateInfografisData({ demografi: finalDemografi });
    setSaving(false);
    if (res.success) {
      setFeedback({ type: "success", text: "Data Demografi Penduduk berhasil diperbarui secara otomatis!" });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", text: "Gagal menyimpan data demografi." });
    }
  };

  const handleSavePekerjaanPendidikan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    // Compute automatic percentage for each item based on current counts
    const finalPekerjaan = pekerjaanList.map((item) => {
      const countNum = parseNumber(item.count);
      const calculatedPersen = totalWargaPekerja > 0 ? Math.round((countNum / totalWargaPekerja) * 1000) / 10 : 0;
      return {
        ...item,
        persen: calculatedPersen,
        count: countNum > 0 ? `${countNum.toLocaleString("id-ID")} Warga` : "0 Warga",
      };
    });

    const finalPendidikan = pendidikanList.map((item) => {
      const countNum = parseNumber(item.count);
      const calculatedPersen = totalWargaPendidikan > 0 ? Math.round((countNum / totalWargaPendidikan) * 1000) / 10 : 0;
      return {
        ...item,
        persen: calculatedPersen,
        count: countNum > 0 ? `${countNum.toLocaleString("id-ID")} Warga` : "0 Warga",
      };
    });

    const res = await updateInfografisData({
      pekerjaan: finalPekerjaan,
      pendidikan: finalPendidikan,
    });

    setSaving(false);
    if (res.success) {
      setPekerjaanList(finalPekerjaan);
      setPendidikanList(finalPendidikan);
      setFeedback({ type: "success", text: "Persentase & data Pekerjaan/Pendidikan berhasil dihitung & disimpan otomatis!" });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", text: "Gagal menyimpan data pekerjaan & pendidikan." });
    }
  };

  const handleSaveAPBDes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const res = await updateInfografisData({
      apbdes: {
        tahun_anggaran: tahunAnggaran,
        pendapatan_total: totalPendapatan,
        pendapatan_rincian: pendapatanRincian,
        belanja_total: totalBelanja,
        belanja_rincian: belanjaRincian,
        surplus_defisit: surplusDefisit,
        silpa: surplusDefisit,
      },
    });
    setSaving(false);
    if (res.success) {
      setFeedback({ type: "success", text: "Kalkulasi APBDes & Transparansi Keuangan berhasil diperbarui otomatis!" });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", text: "Gagal menyimpan data APBDes." });
    }
  };

  const handleSaveIDM = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const finalIDM: StatIDM = {
      ...idmData,
      skorTotal: computedIDMScore,
      status: getIDMStatusInfo(computedIDMScore).status,
    };

    const res = await updateInfografisData({ idm: finalIDM });
    setSaving(false);
    if (res.success) {
      setIdmData(finalIDM);
      setFeedback({ type: "success", text: "Skor & Status IDM berhasil dihitung dan disimpan otomatis!" });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", text: "Gagal menyimpan data IDM." });
    }
  };

  // Helper row handlers
  const addPekerjaanRow = () => {
    setPekerjaanList([
      ...pekerjaanList,
      { nama: "Sektor Baru", persen: 0, count: "100 Warga", color: "bg-emerald-600" },
    ]);
  };
  const removePekerjaanRow = (idx: number) => {
    setPekerjaanList(pekerjaanList.filter((_, i) => i !== idx));
  };

  const addPendidikanRow = () => {
    setPendidikanList([
      ...pendidikanList,
      { tingkat: "Jenjang Baru", persen: 0, count: "100 Warga" },
    ]);
  };
  const removePendidikanRow = (idx: number) => {
    setPendidikanList(pendidikanList.filter((_, i) => i !== idx));
  };

  const addPendapatanRow = () => {
    setPendapatanRincian([...pendapatanRincian, { nama: "Pos Pendapatan Baru", nominal: 50000000 }]);
  };
  const removePendapatanRow = (idx: number) => {
    setPendapatanRincian(pendapatanRincian.filter((_, i) => i !== idx));
  };

  const addBelanjaRow = () => {
    setBelanjaRincian([...belanjaRincian, { nama: "Bidang Belanja Baru", nominal: 50000000 }]);
  };
  const removeBelanjaRow = (idx: number) => {
    setBelanjaRincian(belanjaRincian.filter((_, i) => i !== idx));
  };

  const addRiwayatIDMRow = () => {
    const newYear = new Date().getFullYear();
    const newScore = computedIDMScore || 0.85;
    setIdmData({
      ...idmData,
      riwayat: [
        ...idmData.riwayat,
        {
          tahun: newYear,
          skor: newScore,
          status: getIDMStatusInfo(newScore).label,
        },
      ],
    });
  };

  const removeRiwayatIDMRow = (idx: number) => {
    setIdmData({
      ...idmData,
      riwayat: idmData.riwayat.filter((_, i) => i !== idx),
    });
  };

  const addFaktorRow = () => {
    setIdmData({
      ...idmData,
      faktor_pendukung: [...idmData.faktor_pendukung, "Faktor pendukung baru kemandirian desa."],
    });
  };

  const removeFaktorRow = (idx: number) => {
    setIdmData({
      ...idmData,
      faktor_pendukung: idmData.faktor_pendukung.filter((_, i) => i !== idx),
    });
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Banner */}
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
              <Link
                href="/infografis"
                target="_blank"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-sm hover:bg-emerald-50 transition"
              >
                <span>Halaman Infografis</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/infografis/idm"
                target="_blank"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#00321F] bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full shadow-sm hover:bg-emerald-200 transition"
              >
                <span>Halaman IDM</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#00321F] via-[#004A2F] to-[#006643] rounded-3xl p-6 sm:p-10 text-white shadow-xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Kalkulasi & Persentase Otomatis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Kelola Infografis, APBDes & Status IDM
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Cukup masukkan jumlah warga atau nominal angka, sistem secara otomatis menghitung persentase (%), total keseluruhan, surplus/defisit, serta skor & predikat kategori IDM.
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-sm animate-in fade-in duration-200 ${
              feedback.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
          <button
            onClick={() => setActiveTab("demografi")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "demografi"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Demografi Penduduk</span>
          </button>
          <button
            onClick={() => setActiveTab("pekerjaan")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "pekerjaan"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. Pekerjaan & Pendidikan</span>
          </button>
          <button
            onClick={() => setActiveTab("apbdes")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "apbdes"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>3. APBDes & Keuangan</span>
          </button>
          <button
            onClick={() => setActiveTab("idm")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
              activeTab === "idm"
                ? "bg-[#004329] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>4. Status IDM (KemenDesa)</span>
          </button>
        </div>

        {/* ====================================================================== */}
        {/* TAB 1: DEMOGRAFI PENDUDUK */}
        {/* ====================================================================== */}
        {activeTab === "demografi" && (
          <form onSubmit={handleSaveDemografi} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-emerald-700" />
                  <span>Statistik Kependudukan & Wilayah (Auto Hitung)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Total Penduduk dan rasio persentase Laki-Laki vs Perempuan dihitung otomatis dari isian jumlah.
                </p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="p-2 text-slate-500 hover:text-[#004329] hover:bg-slate-100 rounded-xl transition"
                title="Muat ulang data"
              >
                <RotateCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              </button>
            </div>

            {/* Live Calculation Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Total Penduduk Terhitung
                </span>
                <span className="text-xl font-extrabold text-[#004329]">
                  {displayTotalPenduduk.toLocaleString("id-ID")} Jiwa
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Rasio Gender (Pria / Wanita)
                </span>
                <span className="text-sm font-extrabold text-slate-800">
                  <span className="text-blue-700">{persenPria}% L</span> : <span className="text-rose-700">{persenWanita}% P</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Kepadatan & Rata-Rata KK
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {kepadatan} Jiwa/Ha • {rataKK} Jiwa/KK
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Jumlah Laki-Laki <span className="text-blue-600 font-semibold">({persenPria}%)</span>
                </label>
                <input
                  type="number"
                  required
                  value={demografi.pria}
                  onChange={(e) => handlePriaChange(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Jumlah Perempuan <span className="text-rose-600 font-semibold">({persenWanita}%)</span>
                </label>
                <input
                  type="number"
                  required
                  value={demografi.wanita}
                  onChange={(e) => handleWanitaChange(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-rose-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Total Penduduk (Otomatis)</label>
                <input
                  type="number"
                  required
                  value={displayTotalPenduduk}
                  onChange={(e) => setDemografi({ ...demografi, total_penduduk: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/40 text-xs sm:text-sm font-extrabold text-[#004329] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Kepala Keluarga (KK)</label>
                <input
                  type="number"
                  required
                  value={demografi.kepala_keluarga}
                  onChange={(e) => setDemografi({ ...demografi, kepala_keluarga: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-amber-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Luas Wilayah Desa (Hektar)</label>
                <input
                  type="number"
                  required
                  value={demografi.luas_wilayah}
                  onChange={(e) => setDemografi({ ...demografi, luas_wilayah: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Jumlah Dusun</label>
                <input
                  type="number"
                  required
                  value={demografi.jumlah_dusun}
                  onChange={(e) => setDemografi({ ...demografi, jumlah_dusun: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Jumlah RT</label>
                <input
                  type="number"
                  required
                  value={demografi.jumlah_rt}
                  onChange={(e) => setDemografi({ ...demografi, jumlah_rt: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Jumlah RW</label>
                <input
                  type="number"
                  required
                  value={demografi.jumlah_rw}
                  onChange={(e) => setDemografi({ ...demografi, jumlah_rw: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#004329] hover:bg-[#00321F] text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Menyimpan Data..." : "Simpan Data Demografi"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ====================================================================== */}
        {/* TAB 2: PEKERJAAN & PENDIDIKAN (AUTO PERSENTASE DARI JUMLAH WARGA) */}
        {/* ====================================================================== */}
        {activeTab === "pekerjaan" && (
          <form onSubmit={handleSavePekerjaanPendidikan} className="space-y-6">
            
            {/* Bagian Mata Pencaharian */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-base font-bold text-slate-900">
                      Mata Pencaharian Warga (Persentase Otomatis)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cukup ketik jumlah warga di setiap sektor, persentase (%) akan otomatis dihitung. Total terdata: <strong>{totalWargaPekerja.toLocaleString("id-ID")} Warga</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPekerjaanRow}
                  className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3.5 py-2 rounded-xl transition border border-emerald-200 active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sektor</span>
                </button>
              </div>

              <div className="space-y-3">
                {pekerjaanList.map((item, idx) => {
                  const countNum = parseNumber(item.count);
                  const autoPersen = totalWargaPekerja > 0 ? ((countNum / totalWargaPekerja) * 100).toFixed(1) : "0";

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition"
                    >
                      {/* Sektor Name Input */}
                      <input
                        type="text"
                        placeholder="Nama Sektor Pekerjaan (Contoh: Petani / Pertanian)"
                        value={item.nama}
                        onChange={(e) => {
                          const copy = [...pekerjaanList];
                          copy[idx].nama = e.target.value;
                          setPekerjaanList(copy);
                        }}
                        className="flex-grow px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />

                      {/* Number of People Input */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="Jumlah"
                            value={countNum || ""}
                            onChange={(e) => handlePekerjaanCountChange(idx, e.target.value)}
                            className="w-24 sm:w-28 text-xs font-extrabold text-slate-900 focus:outline-none"
                          />
                          <span className="text-[11px] text-slate-400 font-semibold ml-1">Warga</span>
                        </div>

                        {/* Auto-Calculated Percentage Pill */}
                        <div className="w-24 px-2.5 py-2 rounded-xl bg-emerald-100/80 border border-emerald-300 text-center flex items-center justify-center space-x-1 flex-shrink-0">
                          <Percent className="w-3 h-3 text-[#004329]" />
                          <span className="text-xs font-extrabold text-[#004329]">
                            {autoPersen}%
                          </span>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removePekerjaanRow(idx)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bagian Tingkat Pendidikan */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-base font-bold text-slate-900">
                      Tingkat Pendidikan Warga (Persentase Otomatis)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ketik jumlah warga tamatan tiap jenjang, persentase (%) akan langsung terhitung otomatis. Total terdata: <strong>{totalWargaPendidikan.toLocaleString("id-ID")} Warga</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPendidikanRow}
                  className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3.5 py-2 rounded-xl transition border border-emerald-200 active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Jenjang</span>
                </button>
              </div>

              <div className="space-y-3">
                {pendidikanList.map((item, idx) => {
                  const countNum = parseNumber(item.count);
                  const autoPersen = totalWargaPendidikan > 0 ? ((countNum / totalWargaPendidikan) * 100).toFixed(1) : "0";

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition"
                    >
                      {/* Education Level Input */}
                      <input
                        type="text"
                        placeholder="Tingkat Jenjang (Contoh: SMA / SMK Sederajat)"
                        value={item.tingkat}
                        onChange={(e) => {
                          const copy = [...pendidikanList];
                          copy[idx].tingkat = e.target.value;
                          setPendidikanList(copy);
                        }}
                        className="flex-grow px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />

                      {/* Number of People Input */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="Jumlah"
                            value={countNum || ""}
                            onChange={(e) => handlePendidikanCountChange(idx, e.target.value)}
                            className="w-24 sm:w-28 text-xs font-extrabold text-slate-900 focus:outline-none"
                          />
                          <span className="text-[11px] text-slate-400 font-semibold ml-1">Warga</span>
                        </div>

                        {/* Auto-Calculated Percentage Pill */}
                        <div className="w-24 px-2.5 py-2 rounded-xl bg-emerald-100/80 border border-emerald-300 text-center flex items-center justify-center space-x-1 flex-shrink-0">
                          <Percent className="w-3 h-3 text-[#004329]" />
                          <span className="text-xs font-extrabold text-[#004329]">
                            {autoPersen}%
                          </span>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removePendidikanRow(idx)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#004329] hover:bg-[#00321F] text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Menghitung & Menyimpan..." : "Simpan Pekerjaan & Pendidikan"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ====================================================================== */}
        {/* TAB 3: APBDES & TRANSPARANSI KEUANGAN (AUTO TOTAL & SURPLUS/DEFISIT) */}
        {/* ====================================================================== */}
        {activeTab === "apbdes" && (
          <form onSubmit={handleSaveAPBDes} className="space-y-6">
            
            {/* Tahun Anggaran & Ringkasan Otomatis */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Kalkulasi Keuangan APBDes Otomatis
                    </h3>
                    <p className="text-xs text-slate-500">
                      Total pendapatan, belanja, dan surplus/defisit dihitung otomatis dari rincian pos.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span className="text-xs font-bold text-slate-700">Tahun Anggaran:</span>
                  <input
                    type="text"
                    value={tahunAnggaran}
                    onChange={(e) => setTahunAnggaran(e.target.value)}
                    placeholder="2025"
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 text-center focus:bg-white"
                  />
                </div>
              </div>

              {/* Live Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                    Total Pendapatan Desa
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-[#004329] block pt-1">
                    Rp {totalPendapatan.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block pt-0.5">
                    {pendapatanRincian.length} Pos Penerimaan
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">
                    Total Belanja Desa
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 block pt-1">
                    Rp {totalBelanja.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block pt-0.5">
                    {belanjaRincian.length} Bidang Pengeluaran
                  </span>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    surplusDefisit >= 0
                      ? "bg-teal-50 border-teal-200 text-teal-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block">
                    {surplusDefisit >= 0 ? "Surplus Anggaran / SiLPA" : "Defisit Anggaran"}
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold block pt-1">
                    Rp {Math.abs(surplusDefisit).toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] font-semibold block pt-0.5">
                    {surplusDefisit >= 0 ? "Kondisi Keuangan Sehat" : "Pengeluaran Melebihi Pendapatan"}
                  </span>
                </div>
              </div>
            </div>

            {/* Pos Pendapatan Desa */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                    Rincian Pendapatan Desa (Penerimaan)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Persentase kontribusi per pos pendapatan dihitung otomatis terhadap total pendapatan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPendapatanRow}
                  className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl transition border border-emerald-200 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pos</span>
                </button>
              </div>

              <div className="space-y-3">
                {pendapatanRincian.map((item, idx) => {
                  const posPersen = totalPendapatan > 0 ? ((Number(item.nominal) / totalPendapatan) * 100).toFixed(1) : "0";

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition"
                    >
                      <input
                        type="text"
                        placeholder="Nama Pos Pendapatan (Contoh: Dana Desa / PAD)"
                        value={item.nama}
                        onChange={(e) => {
                          const copy = [...pendapatanRincian];
                          copy[idx].nama = e.target.value;
                          setPendapatanRincian(copy);
                        }}
                        className="flex-grow px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                      />

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2">
                          <span className="text-xs text-slate-400 font-bold mr-1">Rp</span>
                          <input
                            type="number"
                            placeholder="Nominal (Angka)"
                            value={item.nominal || ""}
                            onChange={(e) => {
                              const copy = [...pendapatanRincian];
                              copy[idx].nominal = Number(e.target.value);
                              setPendapatanRincian(copy);
                            }}
                            className="w-32 sm:w-44 text-xs font-bold text-slate-900 focus:outline-none"
                          />
                        </div>

                        {/* Auto Percentage Pill */}
                        <div className="w-20 px-2 py-1.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-center flex-shrink-0">
                          <span className="text-[11px] font-extrabold text-[#004329]">
                            {posPersen}%
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removePendapatanRow(idx)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Hapus baris pos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pos Belanja Desa */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Rincian Belanja Desa (Pengeluaran)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Persentase alokasi belanja per bidang dihitung otomatis terhadap total belanja.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addBelanjaRow}
                  className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl transition border border-emerald-200 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Bidang</span>
                </button>
              </div>

              <div className="space-y-3">
                {belanjaRincian.map((item, idx) => {
                  const bidangPersen = totalBelanja > 0 ? ((Number(item.nominal) / totalBelanja) * 100).toFixed(1) : "0";

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition"
                    >
                      <input
                        type="text"
                        placeholder="Nama Bidang Belanja (Contoh: Bidang Pembangunan Desa)"
                        value={item.nama}
                        onChange={(e) => {
                          const copy = [...belanjaRincian];
                          copy[idx].nama = e.target.value;
                          setBelanjaRincian(copy);
                        }}
                        className="flex-grow px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                      />

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2">
                          <span className="text-xs text-slate-400 font-bold mr-1">Rp</span>
                          <input
                            type="number"
                            placeholder="Nominal (Angka)"
                            value={item.nominal || ""}
                            onChange={(e) => {
                              const copy = [...belanjaRincian];
                              copy[idx].nominal = Number(e.target.value);
                              setBelanjaRincian(copy);
                            }}
                            className="w-32 sm:w-44 text-xs font-bold text-slate-900 focus:outline-none"
                          />
                        </div>

                        {/* Auto Percentage Pill */}
                        <div className="w-20 px-2 py-1.5 rounded-xl bg-slate-200/80 border border-slate-300 text-center flex-shrink-0">
                          <span className="text-[11px] font-extrabold text-slate-800">
                            {bidangPersen}%
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeBelanjaRow(idx)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Hapus baris belanja"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#004329] hover:bg-[#00321F] text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Menyimpan APBDes..." : "Simpan Data APBDes"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ====================================================================== */}
        {/* TAB 4: STATUS IDM (SKOR & STATUS OTOMATIS DARI 3 SUB-INDEKS) */}
        {/* ====================================================================== */}
        {activeTab === "idm" && (
          <form onSubmit={handleSaveIDM} className="space-y-6">
            
            {/* Status Utama & Skor IDM (Live Computed) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Status & Skor IDM (KemenDesa Otomatis)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Skor Total IDM dan Kategori Status Desa dihitung otomatis dari rata-rata 3 Sub-Indeks (IKS, IKE, IKL).
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span className="text-xs font-bold text-slate-700">Tahun Penilaian:</span>
                  <input
                    type="number"
                    value={idmData.tahun}
                    onChange={(e) => setIdmData({ ...idmData, tahun: Number(e.target.value) })}
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 text-center"
                  />
                </div>
              </div>

              {/* Live IDM Status Badge & Calculation Indicator */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                      Hasil Predikat Kategori IDM (Otomatis)
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${idmStatusInfo.badgeClass}`}>
                        {idmStatusInfo.status}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        {idmStatusInfo.description}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                      Skor Rata-Rata Total IDM
                    </span>
                    <span className="text-2xl font-black text-[#004329]">
                      {computedIDMScore.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manual Override Inputs (Auto-filled by default) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kategori Status Desa (Auto)
                  </label>
                  <select
                    value={idmData.status || idmStatusInfo.status}
                    onChange={(e) => setIdmData({ ...idmData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="DESA MANDIRI">DESA MANDIRI (Skor &gt; 0.8155)</option>
                    <option value="DESA MAJU">DESA MAJU (Skor 0.7072 - 0.8155)</option>
                    <option value="DESA BERKEMBANG">DESA BERKEMBANG (Skor 0.5989 - 0.7072)</option>
                    <option value="DESA TERTINGGAL">DESA TERTINGGAL (Skor 0.4907 - 0.5989)</option>
                    <option value="DESA SANGAT TERTINGGAL">DESA SANGAT TERTINGGAL (&lt; 0.4907)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Skor Total IDM (Auto: (IKS + IKE + IKL) / 3)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    required
                    value={idmData.skorTotal || computedIDMScore}
                    onChange={(e) => setIdmData({ ...idmData, skorTotal: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 text-xs sm:text-sm font-extrabold text-[#004329] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 3 Sub-Indeks (IKS, IKE, IKL) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Rincian 3 Sub-Indeks Pembentuk IDM
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah nilai skor sub-indeks (0.000 - 1.000), total skor dan status IDM akan otomatis terhitung.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* IKS */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-emerald-400 transition">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold">1. IKS (Ketahanan Sosial)</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Nilai Skor (0.000 - 1.000)</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="1"
                      value={idmData.iks.skor}
                      onChange={(e) => handleSubIndexScoreChange("iks", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Predikat Kualitatif</label>
                    <input
                      type="text"
                      value={idmData.iks.label}
                      onChange={(e) =>
                        setIdmData({
                          ...idmData,
                          iks: { ...idmData.iks, label: e.target.value },
                        })
                      }
                      placeholder="Sangat Baik"
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* IKE */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-teal-400 transition">
                  <div className="flex items-center space-x-2 text-teal-800">
                    <Store className="w-5 h-5" />
                    <span className="text-xs font-bold">2. IKE (Ketahanan Ekonomi)</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Nilai Skor (0.000 - 1.000)</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="1"
                      value={idmData.ike.skor}
                      onChange={(e) => handleSubIndexScoreChange("ike", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Predikat Kualitatif</label>
                    <input
                      type="text"
                      value={idmData.ike.label}
                      onChange={(e) =>
                        setIdmData({
                          ...idmData,
                          ike: { ...idmData.ike, label: e.target.value },
                        })
                      }
                      placeholder="Baik (Berkembang)"
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* IKL */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-emerald-600 transition">
                  <div className="flex items-center space-x-2 text-[#004329]">
                    <TreePine className="w-5 h-5" />
                    <span className="text-xs font-bold">3. IKL (Ketahanan Lingkungan)</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Nilai Skor (0.000 - 1.000)</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="1"
                      value={idmData.ikl.skor}
                      onChange={(e) => handleSubIndexScoreChange("ikl", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Predikat Kualitatif</label>
                    <input
                      type="text"
                      value={idmData.ikl.label}
                      onChange={(e) =>
                        setIdmData({
                          ...idmData,
                          ikl: { ...idmData.ikl, label: e.target.value },
                        })
                      }
                      placeholder="Sangat Baik"
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Riwayat Perkembangan IDM */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Riwayat Perkembangan IDM Pertahun
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addRiwayatIDMRow}
                  className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl transition border border-emerald-200 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Riwayat</span>
                </button>
              </div>

              <div className="space-y-3">
                {idmData.riwayat.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200"
                  >
                    <div className="w-28 flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2">
                      <span className="text-xs text-slate-400 font-bold mr-1">Th:</span>
                      <input
                        type="number"
                        placeholder="2025"
                        value={item.tahun}
                        onChange={(e) => {
                          const copy = [...idmData.riwayat];
                          copy[idx].tahun = Number(e.target.value);
                          setIdmData({ ...idmData, riwayat: copy });
                        }}
                        className="w-full text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="w-36 flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2">
                      <span className="text-xs text-slate-400 font-bold mr-1">Skor:</span>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="0.8542"
                        value={item.skor}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const copy = [...idmData.riwayat];
                          copy[idx].skor = val;
                          copy[idx].status = getIDMStatusInfo(val).label;
                          setIdmData({ ...idmData, riwayat: copy });
                        }}
                        className="w-full text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Status (Contoh: Desa Mandiri)"
                      value={item.status}
                      onChange={(e) => {
                        const copy = [...idmData.riwayat];
                        copy[idx].status = e.target.value;
                        setIdmData({ ...idmData, riwayat: copy });
                      }}
                      className="flex-grow px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => removeRiwayatIDMRow(idx)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Hapus riwayat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Faktor Pendukung */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Poin Faktor Pendukung Kemandirian Desa
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addFaktorRow}
                  className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl transition border border-emerald-200 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Poin</span>
                </button>
              </div>

              <div className="space-y-3">
                {idmData.faktor_pendukung.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const copy = [...idmData.faktor_pendukung];
                        copy[idx] = e.target.value;
                        setIdmData({ ...idmData, faktor_pendukung: copy });
                      }}
                      className="flex-grow px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeFaktorRow(idx)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Hapus faktor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#004329] hover:bg-[#00321F] text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Menghitung & Menyimpan..." : "Simpan Status & Nilai IDM"}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </main>
  );
}
