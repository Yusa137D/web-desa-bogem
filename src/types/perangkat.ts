export interface PerangkatItem {
  id: string | number;
  nama: string;
  jabatan: string;
  foto?: string;
  kontak?: string;
  urutan?: number;
  created_at?: string;
}

export interface CreatePerangkatInput {
  nama: string;
  jabatan: string;
  foto?: string;
  kontak?: string;
  urutan?: number;
}
