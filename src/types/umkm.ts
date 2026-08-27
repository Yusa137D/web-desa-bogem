export type UMKMCategory =
  | "Semua"
  | "Makanan & Minuman"
  | "Kerajinan Tangan"
  | "Jasa"
  | "Pertanian / Peternakan"
  | "Lainnya";

export interface UMKMItem {
  id: string | number;
  nama_usaha: string;
  pemilik: string;
  deskripsi: string;
  kategori: string;
  kontak: string;
  alamat?: string;
  harga?: string;
  gambar?: string;
  created_at?: string;
}

export interface CreateUMKMInput {
  nama_usaha: string;
  pemilik: string;
  deskripsi: string;
  kategori: string;
  kontak: string;
  alamat?: string;
  harga?: string;
  gambar?: string;
}
