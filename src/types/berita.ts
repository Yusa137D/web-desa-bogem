export interface BeritaItem {
  id: string | number;
  judul: string;
  kategori?: string;
  ringkasan?: string;
  konten: string;
  penulis?: string;
  gambar?: string;
  created_at?: string;
}

export interface CreateBeritaInput {
  judul: string;
  kategori?: string;
  ringkasan?: string;
  konten: string;
  penulis?: string;
  gambar?: string;
}

export const KATEGORI_BERITA_PRESETS = [
  "Pengumuman Resmi",
  "Kegiatan Warga",
  "Pembangunan & Infrastruktur",
  "Kesehatan & Posyandu",
  "Pemberdayaan UMKM & Ekonomi",
  "Pertanian & Lingkungan",
  "Sosial & Budaya",
];
