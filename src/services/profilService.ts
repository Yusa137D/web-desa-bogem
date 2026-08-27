import { supabase } from "@/lib/supabase";
import { ProfilDesaData, BatasWilayah } from "@/types/profil";

export const defaultBatasWilayah: BatasWilayah = {
  utara: "Desa Tladan / Genengan",
  timur: "Desa Pojok / Kawedanan",
  selatan: "Desa Giripurno",
  barat: "Desa Sugihrejo",
};

export const defaultSejarahDesa = `Nama Desa Bogem memiliki akar sejarah yang kuat dan sarat nilai perjuangan serta kearifan lokal di wilayah Kecamatan Kawedanan, Kabupaten Magetan. Sejak dahulu kala, kawasan ini dikenal sebagai wilayah pemukiman yang tentram dengan tanah persawahan yang subur dan sumber mata air yang melimpah.

Masyarakat Desa Bogem secara turun-temurun mengandalkan sektor pertanian sawah, palawija, serta kerajinan dan perdagangan lokal. Semangat gotong royong, kebersamaan warga, dan nilai-nilai religius menjadi fondasi utama dalam kehidupan bermasyarakat.

Dalam era kemajuan modern dan transformasi digital saat ini, Pemerintah Desa Bogem terus berkomitmen mewujudkan desa yang mandiri, transparan, dan berdaya saing dengan memberikan pelayanan publik terbaik dan memajukan potensi ekonomi warga secara berkelanjutan.`;

export const defaultProfilDesa: ProfilDesaData = {
  id: "main",
  visi: "Mewujudkan Desa Bogem yang Mandiri, Sejahtera, Berdaya Saing, dan Berbudaya melalui Tata Kelola Pemerintahan yang Transparan dan Pemanfaatan Teknologi Digital.",
  misi: [
    "Meningkatkan kualitas pelayanan administrasi dan informasi masyarakat berbasis digital.",
    "Mendorong pertumbuhan ekonomi warga lewat dukungan UMKM dan pemasaran produk lokal.",
    "Meningkatkan infrastruktur sarana publik dan kelestarian lingkungan hidup desa.",
    "Mempererat kerukunan gotong royong dan melestarikan kearifan budaya lokal.",
  ],
  nama_kades: "Kepala Desa Bogem",
  foto_kades: "",
  sambutan_kades:
    "Selamat datang di Website Resmi Desa Bogem, Kecamatan Kawedanan, Kabupaten Magetan. Portal digital ini hadir sebagai wujud komitmen kami dalam keterbukaan informasi publik, kemudahan layanan administrasi, dan etalase promosi potensi ekonomi warga desa secara luas dan modern.",
  bagan_desa_image: "",
  bagan_bpd_image: "",
  sejarah: defaultSejarahDesa,
  luas_wilayah: "245 Ha",
  jumlah_penduduk: "3.620 Jiwa",
  ketinggian: "± 78 mdpl",
  batas_wilayah: defaultBatasWilayah,
  jam_pelayanan: "Senin - Jumat: 08.00 - 15.00 WIB",
  jam_pelayanan_note: "*Sabtu & Minggu: Libur / Pelayanan Darurat",
  alamat_kantor: "Jl. Bakti Mulya No. 241, Desa Bogem, Kec. Kawedanan, Kab. Magetan",
  telepon_kantor: "+62 812-3456-7890",
  email_kantor: "info@desabogem.id",
  updated_at: new Date().toISOString(),
};

function sanitizeProfilText(str?: string): string {
  if (!str) return "";
  return str.replace(/Balerejo/gi, "Bogem").replace(/Kebonsari/gi, "Kawedanan").replace(/Madiun/gi, "Magetan");
}

export function getLocalProfil(): ProfilDesaData {
  if (typeof window === "undefined") return defaultProfilDesa;
  try {
    const raw = localStorage.getItem("local_profil_desa");
    if (!raw) return defaultProfilDesa;
    const parsed = JSON.parse(raw);
    return {
      ...defaultProfilDesa,
      ...parsed,
      visi: sanitizeProfilText(parsed.visi) || defaultProfilDesa.visi,
      sambutan_kades: sanitizeProfilText(parsed.sambutan_kades) || defaultProfilDesa.sambutan_kades,
      nama_kades: sanitizeProfilText(parsed.nama_kades) || defaultProfilDesa.nama_kades,
      foto_kades: parsed.foto_kades === "/images/kades.png" ? "" : (parsed.foto_kades || ""),
      bagan_desa_image: parsed.bagan_desa_image || "",
      bagan_bpd_image: parsed.bagan_bpd_image || "",
      sejarah: parsed.sejarah || defaultSejarahDesa,
      luas_wilayah: parsed.luas_wilayah || defaultProfilDesa.luas_wilayah,
      jumlah_penduduk: parsed.jumlah_penduduk || defaultProfilDesa.jumlah_penduduk,
      ketinggian: parsed.ketinggian || defaultProfilDesa.ketinggian,
      batas_wilayah: parsed.batas_wilayah || defaultBatasWilayah,
      jam_pelayanan: parsed.jam_pelayanan || defaultProfilDesa.jam_pelayanan,
      jam_pelayanan_note: parsed.jam_pelayanan_note !== undefined ? parsed.jam_pelayanan_note : defaultProfilDesa.jam_pelayanan_note,
      alamat_kantor: sanitizeProfilText(parsed.alamat_kantor) || defaultProfilDesa.alamat_kantor,
      telepon_kantor: parsed.telepon_kantor || defaultProfilDesa.telepon_kantor,
      email_kantor: parsed.email_kantor || defaultProfilDesa.email_kantor,
    };
  } catch {
    return defaultProfilDesa;
  }
}

export function saveLocalProfil(data: ProfilDesaData) {
  if (typeof window === "undefined") return;
  try {
    const sanitized = {
      ...data,
      visi: sanitizeProfilText(data.visi),
      sambutan_kades: sanitizeProfilText(data.sambutan_kades),
      nama_kades: sanitizeProfilText(data.nama_kades),
      alamat_kantor: sanitizeProfilText(data.alamat_kantor),
      foto_kades: data.foto_kades === "/images/kades.png" ? "" : (data.foto_kades || ""),
    };
    localStorage.setItem("local_profil_desa", JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent("local_profil_updated", { detail: sanitized }));
  } catch (err) {
    console.error("Failed to save local profil desa:", err);
  }
}

export async function fetchProfilDesa(): Promise<ProfilDesaData> {
  const localData = getLocalProfil();

  try {
    const { data, error } = await supabase
      .from("profil_desa")
      .select("*")
      .eq("id", "main")
      .single();

    if (error || !data) {
      return localData;
    }

    const merged: ProfilDesaData = {
      id: "main",
      visi: sanitizeProfilText(data.visi) || localData.visi,
      misi: Array.isArray(data.misi) && data.misi.length > 0 
        ? data.misi.map((m: string) => sanitizeProfilText(m)) 
        : localData.misi,
      nama_kades: sanitizeProfilText(data.nama_kades) || localData.nama_kades,
      foto_kades: data.foto_kades && data.foto_kades !== "/images/kades.png" ? data.foto_kades : (localData.foto_kades || ""),
      sambutan_kades: sanitizeProfilText(data.sambutan_kades) || localData.sambutan_kades,
      bagan_desa_image: data.bagan_desa_image || localData.bagan_desa_image || "",
      bagan_bpd_image: data.bagan_bpd_image || localData.bagan_bpd_image || "",
      sejarah: data.sejarah || localData.sejarah || defaultSejarahDesa,
      luas_wilayah: data.luas_wilayah || localData.luas_wilayah || defaultProfilDesa.luas_wilayah,
      jumlah_penduduk: data.jumlah_penduduk || localData.jumlah_penduduk || defaultProfilDesa.jumlah_penduduk,
      ketinggian: data.ketinggian || localData.ketinggian || defaultProfilDesa.ketinggian,
      batas_wilayah: data.batas_wilayah || localData.batas_wilayah || defaultBatasWilayah,
      jam_pelayanan: data.jam_pelayanan || localData.jam_pelayanan || defaultProfilDesa.jam_pelayanan,
      jam_pelayanan_note: data.jam_pelayanan_note !== undefined ? data.jam_pelayanan_note : (localData.jam_pelayanan_note || defaultProfilDesa.jam_pelayanan_note),
      alamat_kantor: sanitizeProfilText(data.alamat_kantor) || localData.alamat_kantor || defaultProfilDesa.alamat_kantor,
      telepon_kantor: data.telepon_kantor || localData.telepon_kantor || defaultProfilDesa.telepon_kantor,
      email_kantor: data.email_kantor || localData.email_kantor || defaultProfilDesa.email_kantor,
      updated_at: data.updated_at || new Date().toISOString(),
    };

    saveLocalProfil(merged);
    return merged;
  } catch (err) {
    console.error("fetchProfilDesa error:", err);
    return localData;
  }
}

export async function updateProfilDesa(input: Partial<ProfilDesaData>): Promise<{ success: boolean; error?: string }> {
  const current = getLocalProfil();
  const updated: ProfilDesaData = {
    ...current,
    ...input,
    visi: sanitizeProfilText(input.visi !== undefined ? input.visi : current.visi),
    sambutan_kades: sanitizeProfilText(input.sambutan_kades !== undefined ? input.sambutan_kades : current.sambutan_kades),
    nama_kades: sanitizeProfilText(input.nama_kades !== undefined ? input.nama_kades : current.nama_kades),
    foto_kades: input.foto_kades !== undefined ? input.foto_kades : current.foto_kades,
    bagan_desa_image: input.bagan_desa_image !== undefined ? input.bagan_desa_image : current.bagan_desa_image,
    bagan_bpd_image: input.bagan_bpd_image !== undefined ? input.bagan_bpd_image : current.bagan_bpd_image,
    sejarah: input.sejarah !== undefined ? input.sejarah : current.sejarah,
    luas_wilayah: input.luas_wilayah !== undefined ? input.luas_wilayah : current.luas_wilayah,
    jumlah_penduduk: input.jumlah_penduduk !== undefined ? input.jumlah_penduduk : current.jumlah_penduduk,
    ketinggian: input.ketinggian !== undefined ? input.ketinggian : current.ketinggian,
    batas_wilayah: input.batas_wilayah !== undefined ? input.batas_wilayah : current.batas_wilayah,
    jam_pelayanan: input.jam_pelayanan !== undefined ? input.jam_pelayanan : current.jam_pelayanan,
    jam_pelayanan_note: input.jam_pelayanan_note !== undefined ? input.jam_pelayanan_note : current.jam_pelayanan_note,
    alamat_kantor: sanitizeProfilText(input.alamat_kantor !== undefined ? input.alamat_kantor : current.alamat_kantor),
    telepon_kantor: input.telepon_kantor !== undefined ? input.telepon_kantor : current.telepon_kantor,
    email_kantor: input.email_kantor !== undefined ? input.email_kantor : current.email_kantor,
    updated_at: new Date().toISOString(),
  };

  // 1. Save to local storage immediately
  saveLocalProfil(updated);

  // 2. Update Supabase
  try {
    const { error } = await supabase
      .from("profil_desa")
      .upsert({
        id: "main",
        visi: updated.visi,
        misi: updated.misi,
        nama_kades: updated.nama_kades,
        foto_kades: updated.foto_kades,
        sambutan_kades: updated.sambutan_kades,
        bagan_desa_image: updated.bagan_desa_image,
        bagan_bpd_image: updated.bagan_bpd_image,
        sejarah: updated.sejarah,
        luas_wilayah: updated.luas_wilayah,
        jumlah_penduduk: updated.jumlah_penduduk,
        ketinggian: updated.ketinggian,
        batas_wilayah: updated.batas_wilayah,
        jam_pelayanan: updated.jam_pelayanan,
        jam_pelayanan_note: updated.jam_pelayanan_note,
        alamat_kantor: updated.alamat_kantor,
        telepon_kantor: updated.telepon_kantor,
        email_kantor: updated.email_kantor,
        updated_at: updated.updated_at,
      });

    if (error) {
      console.warn("Supabase profil upsert warning (saved locally):", error);
    }
  } catch (err) {
    console.warn("Supabase updateProfilDesa warning:", err);
  }

  return { success: true };
}
