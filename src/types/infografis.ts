export interface StatDemografi {
  total_penduduk: number;
  pria: number;
  wanita: number;
  kepala_keluarga: number;
  jumlah_dusun: number;
  jumlah_rt: number;
  jumlah_rw: number;
  luas_wilayah: number; // Hektar
}

export interface ItemPekerjaan {
  nama: string;
  persen: number;
  count: string;
  color?: string;
}

export interface ItemPendidikan {
  tingkat: string;
  persen: number;
  count: string;
}

export interface ItemRincianAnggaran {
  nama: string;
  nominal: number;
}

export interface StatAPBDes {
  tahun_anggaran: string;
  pendapatan_total: number;
  pendapatan_rincian: ItemRincianAnggaran[];
  belanja_total: number;
  belanja_rincian: ItemRincianAnggaran[];
  surplus_defisit: number;
  silpa: number;
}

export interface ItemRiwayatIDM {
  tahun: number;
  skor: number;
  status: string;
}

export interface StatIDM {
  tahun: number;
  skorTotal: number;
  status: string;
  iks: { skor: number; label: string };
  ike: { skor: number; label: string };
  ikl: { skor: number; label: string };
  riwayat: ItemRiwayatIDM[];
  faktor_pendukung: string[];
}

export interface InfografisData {
  demografi: StatDemografi;
  pekerjaan: ItemPekerjaan[];
  pendidikan: ItemPendidikan[];
  apbdes: StatAPBDes;
  idm: StatIDM;
  updated_at?: string;
}
