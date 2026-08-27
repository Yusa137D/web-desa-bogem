export interface BatasWilayah {
  utara: string;
  timur: string;
  selatan: string;
  barat: string;
}

export interface ProfilDesaData {
  id?: string;
  visi: string;
  misi: string[];
  nama_kades?: string;
  foto_kades?: string;
  sambutan_kades?: string;
  // Bagan Struktur Organisasi Desa (Bisa diganti via Admin)
  bagan_desa_image?: string; // Struktur Organisasi Pemerintahan Desa
  bagan_bpd_image?: string;  // Struktur Organisasi Badan Permusyawaratan Desa (BPD)
  // Sejarah Desa
  sejarah?: string;
  // Geografis & Batas Wilayah
  luas_wilayah?: string;
  jumlah_penduduk?: string;
  ketinggian?: string;
  batas_wilayah?: BatasWilayah;
  // Kontak & Jam Pelayanan Kantor Desa
  jam_pelayanan?: string;
  jam_pelayanan_note?: string;
  alamat_kantor?: string;
  telepon_kantor?: string;
  email_kantor?: string;
  updated_at?: string;
}
