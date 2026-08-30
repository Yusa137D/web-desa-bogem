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

export async function fetchProfilDesa(): Promise<ProfilDesaData> {
  try {
    if (!supabase) return defaultProfilDesa;

    const { data, error } = await supabase
      .from("profil_desa")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    if (error || !data) {
      return defaultProfilDesa;
    }

    return {
      id: "main",
      visi: data.visi || defaultProfilDesa.visi,
      misi: Array.isArray(data.misi) && data.misi.length > 0 ? data.misi : defaultProfilDesa.misi,
      nama_kades: data.nama_kades || defaultProfilDesa.nama_kades,
      foto_kades: data.foto_kades || "",
      sambutan_kades: data.sambutan_kades || defaultProfilDesa.sambutan_kades,
      bagan_desa_image: data.bagan_desa_image || "",
      bagan_bpd_image: data.bagan_bpd_image || "",
      sejarah: data.sejarah || defaultSejarahDesa,
      luas_wilayah: data.luas_wilayah || defaultProfilDesa.luas_wilayah,
      jumlah_penduduk: data.jumlah_penduduk || defaultProfilDesa.jumlah_penduduk,
      ketinggian: data.ketinggian || defaultProfilDesa.ketinggian,
      batas_wilayah: data.batas_wilayah || defaultBatasWilayah,
      jam_pelayanan: data.jam_pelayanan || defaultProfilDesa.jam_pelayanan,
      jam_pelayanan_note: data.jam_pelayanan_note !== undefined ? data.jam_pelayanan_note : defaultProfilDesa.jam_pelayanan_note,
      alamat_kantor: data.alamat_kantor || defaultProfilDesa.alamat_kantor,
      telepon_kantor: data.telepon_kantor || defaultProfilDesa.telepon_kantor,
      email_kantor: data.email_kantor || defaultProfilDesa.email_kantor,
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error("fetchProfilDesa error:", err);
    return defaultProfilDesa;
  }
}

export async function updateProfilDesa(input: Partial<ProfilDesaData>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const payload: Record<string, any> = {
      id: "main",
      updated_at: new Date().toISOString(),
    };

    if (input.visi !== undefined) payload.visi = input.visi;
    if (input.misi !== undefined) payload.misi = input.misi;
    if (input.nama_kades !== undefined) payload.nama_kades = input.nama_kades;
    if (input.foto_kades !== undefined) payload.foto_kades = input.foto_kades;
    if (input.sambutan_kades !== undefined) payload.sambutan_kades = input.sambutan_kades;
    if (input.bagan_desa_image !== undefined) payload.bagan_desa_image = input.bagan_desa_image;
    if (input.bagan_bpd_image !== undefined) payload.bagan_bpd_image = input.bagan_bpd_image;
    if (input.sejarah !== undefined) payload.sejarah = input.sejarah;
    if (input.luas_wilayah !== undefined) payload.luas_wilayah = input.luas_wilayah;
    if (input.jumlah_penduduk !== undefined) payload.jumlah_penduduk = input.jumlah_penduduk;
    if (input.ketinggian !== undefined) payload.ketinggian = input.ketinggian;
    if (input.batas_wilayah !== undefined) payload.batas_wilayah = input.batas_wilayah;
    if (input.jam_pelayanan !== undefined) payload.jam_pelayanan = input.jam_pelayanan;
    if (input.jam_pelayanan_note !== undefined) payload.jam_pelayanan_note = input.jam_pelayanan_note;
    if (input.alamat_kantor !== undefined) payload.alamat_kantor = input.alamat_kantor;
    if (input.telepon_kantor !== undefined) payload.telepon_kantor = input.telepon_kantor;
    if (input.email_kantor !== undefined) payload.email_kantor = input.email_kantor;

    const { error } = await supabase.from("profil_desa").upsert(payload);

    if (error) {
      console.error("updateProfilDesa error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui profil desa.";
    return { success: false, error: msg };
  }
}
