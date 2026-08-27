import { supabase } from "@/lib/supabase";
import { InfografisData } from "@/types/infografis";

export const defaultInfografisData: InfografisData = {
  demografi: {
    total_penduduk: 3620,
    pria: 1790,
    wanita: 1830,
    kepala_keluarga: 1080,
    jumlah_dusun: 4,
    jumlah_rt: 18,
    jumlah_rw: 4,
    luas_wilayah: 245,
  },
  pekerjaan: [
    { nama: "Petani & Pekebun", persen: 45, count: "1.629 Warga", color: "bg-emerald-600" },
    { nama: "Wiraswasta / UMKM", persen: 23, count: "832 Warga", color: "bg-teal-600" },
    { nama: "Karyawan Swasta", persen: 16, count: "579 Warga", color: "bg-[#004329]" },
    { nama: "PNS / TNI / Polri", persen: 8, count: "290 Warga", color: "bg-emerald-500" },
    { nama: "Lainnya / Jasa", persen: 8, count: "290 Warga", color: "bg-slate-500" },
  ],
  pendidikan: [
    { tingkat: "SD / Sederajat", persen: 26, count: "941 Warga" },
    { tingkat: "SMP / Sederajat", persen: 31, count: "1.122 Warga" },
    { tingkat: "SMA / SMK", persen: 32, count: "1.158 Warga" },
    { tingkat: "Diploma / Sarjana (S1/S2)", persen: 11, count: "399 Warga" },
  ],
  apbdes: {
    tahun_anggaran: "2024",
    pendapatan_total: 1520400000,
    pendapatan_rincian: [
      { nama: "Dana Desa (DDS)", nominal: 850000000 },
      { nama: "Alokasi Dana Desa (ADD)", nominal: 420400000 },
      { nama: "Pendapatan Asli Desa (PADes)", nominal: 150000000 },
      { nama: "Bagi Hasil Pajak & Retribusi (PBH)", nominal: 100000000 },
    ],
    belanja_total: 1445100000,
    belanja_rincian: [
      { nama: "Bidang Pembangunan Desa", nominal: 680000000 },
      { nama: "Bidang Penyelenggaraan Pemerintahan", nominal: 450100000 },
      { nama: "Bidang Pembinaan Kemasyarakatan", nominal: 165000000 },
      { nama: "Bidang Pemberdayaan Masyarakat", nominal: 110000000 },
      { nama: "Bidang Penanggulangan Bencana & Darurat", nominal: 40000000 },
    ],
    surplus_defisit: 75300000,
    silpa: 75300000,
  },
  idm: {
    tahun: 2025,
    skorTotal: 0.8542,
    status: "DESA MANDIRI",
    iks: { skor: 0.892, label: "Sangat Baik" },
    ike: { skor: 0.785, label: "Baik (Berkembang)" },
    ikl: { skor: 0.886, label: "Sangat Baik" },
    riwayat: [
      { tahun: 2021, skor: 0.712, status: "Desa Berkembang" },
      { tahun: 2023, skor: 0.798, status: "Desa Maju" },
      { tahun: 2025, skor: 0.8542, status: "Desa Mandiri" },
    ],
    faktor_pendukung: [
      "Aksesibilitas jaringan internet & layanan digital desa terintegrasi.",
      "Pasar desa dan pusat promosi UMKM lokal aktif.",
      "Fasilitas kesehatan dan tenaga medis mudah dijangkau warga.",
      "Sistem mitigasi bencana alam dan kebersihan lingkungan terjaga.",
    ],
  },
  updated_at: new Date().toISOString(),
};

// Helper to get from client-side localStorage
export function getLocalInfografis(): InfografisData {
  if (typeof window === "undefined") return defaultInfografisData;
  try {
    const raw = localStorage.getItem("local_infografis_desa");
    if (!raw) return defaultInfografisData;
    const parsed = JSON.parse(raw);
    return {
      ...defaultInfografisData,
      ...parsed,
      demografi: { ...defaultInfografisData.demografi, ...(parsed.demografi || {}) },
      pekerjaan: parsed.pekerjaan || defaultInfografisData.pekerjaan,
      pendidikan: parsed.pendidikan || defaultInfografisData.pendidikan,
      apbdes: {
        ...defaultInfografisData.apbdes,
        ...(parsed.apbdes || {}),
        pendapatan_rincian: parsed.apbdes?.pendapatan_rincian || defaultInfografisData.apbdes.pendapatan_rincian,
        belanja_rincian: parsed.apbdes?.belanja_rincian || defaultInfografisData.apbdes.belanja_rincian,
      },
      idm: {
        ...defaultInfografisData.idm,
        ...(parsed.idm || {}),
        iks: { ...defaultInfografisData.idm.iks, ...(parsed.idm?.iks || {}) },
        ike: { ...defaultInfografisData.idm.ike, ...(parsed.idm?.ike || {}) },
        ikl: { ...defaultInfografisData.idm.ikl, ...(parsed.idm?.ikl || {}) },
        riwayat: parsed.idm?.riwayat || defaultInfografisData.idm.riwayat,
        faktor_pendukung: parsed.idm?.faktor_pendukung || defaultInfografisData.idm.faktor_pendukung,
      },
    };
  } catch {
    return defaultInfografisData;
  }
}

// Helper to save to client-side localStorage
export function saveLocalInfografis(data: InfografisData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("local_infografis_desa", JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save local infografis:", err);
  }
}

export async function fetchInfografisData(): Promise<InfografisData> {
  const local = getLocalInfografis();

  try {
    const { data, error } = await supabase
      .from("infografis")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    if (error || !data) {
      return local;
    }

    const merged: InfografisData = {
      demografi: data.demografi || local.demografi,
      pekerjaan: data.pekerjaan || local.pekerjaan,
      pendidikan: data.pendidikan || local.pendidikan,
      apbdes: data.apbdes || local.apbdes,
      idm: data.idm || local.idm,
      updated_at: data.updated_at || local.updated_at,
    };

    saveLocalInfografis(merged);
    return merged;
  } catch (err) {
    console.warn("fetchInfografisData warning (using local):", err);
    return local;
  }
}

export async function updateInfografisData(
  newData: Partial<InfografisData>
): Promise<{ success: boolean; error?: string }> {
  const current = getLocalInfografis();
  const updated: InfografisData = {
    ...current,
    ...newData,
    demografi: { ...current.demografi, ...(newData.demografi || {}) },
    pekerjaan: newData.pekerjaan || current.pekerjaan,
    pendidikan: newData.pendidikan || current.pendidikan,
    apbdes: {
      ...current.apbdes,
      ...(newData.apbdes || {}),
      pendapatan_rincian: newData.apbdes?.pendapatan_rincian || current.apbdes.pendapatan_rincian,
      belanja_rincian: newData.apbdes?.belanja_rincian || current.apbdes.belanja_rincian,
    },
    idm: {
      ...current.idm,
      ...(newData.idm || {}),
      iks: { ...current.idm.iks, ...(newData.idm?.iks || {}) },
      ike: { ...current.idm.ike, ...(newData.idm?.ike || {}) },
      ikl: { ...current.idm.ikl, ...(newData.idm?.ikl || {}) },
      riwayat: newData.idm?.riwayat || current.idm.riwayat,
      faktor_pendukung: newData.idm?.faktor_pendukung || current.idm.faktor_pendukung,
    },
    updated_at: new Date().toISOString(),
  };

  // 1. Save to local storage immediately
  saveLocalInfografis(updated);

  // 2. Sync to Supabase
  try {
    await supabase.from("infografis").upsert({
      id: "main",
      demografi: updated.demografi,
      pekerjaan: updated.pekerjaan,
      pendidikan: updated.pendidikan,
      apbdes: updated.apbdes,
      idm: updated.idm,
      updated_at: updated.updated_at,
    });
  } catch (err) {
    console.warn("Supabase updateInfografisData warning:", err);
  }

  return { success: true };
}
