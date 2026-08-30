export type StatusSurat = "MENUNGGU" | "DIPROSES" | "SELESAI" | "DITOLAK";

export type FieldType = "text" | "number" | "date" | "textarea";

export interface FormFieldConfig {
  id: string; // unique key, e.g. "nama_usaha"
  label: string; // e.g. "Nama Usaha / Toko"
  tipe: FieldType; // "text" | "number" | "date" | "textarea"
  placeholder?: string;
  wajib: boolean;
}

export interface OpsiSurat {
  id: string;
  nama_surat: string;
  deskripsi: string;
  syarat: string;
  // Kolom-kolom formulir khusus yang diatur oleh Admin
  custom_fields?: FormFieldConfig[];
}

export const defaultOpsiSuratList: OpsiSurat[] = [
  {
    id: "opsi-1",
    nama_surat: "Surat Keterangan Usaha (SKU)",
    deskripsi: "Untuk legalitas pembukaan rekening usaha, pengajuan pinjaman/KUR, atau verifikasi UMKM.",
    syarat: "Fotokopi KTP & KK, Nama Usaha, Jenis Usaha, dan Alamat Lokasi Usaha.",
    custom_fields: [
      { id: "nama_usaha", label: "Nama Usaha / Toko", tipe: "text", placeholder: "Contoh: Warung Makan Berkah", wajib: true },
      { id: "jenis_usaha", label: "Bidang / Jenis Usaha", tipe: "text", placeholder: "Contoh: Kuliner / Perdagangan / Jasa", wajib: true },
      { id: "alamat_usaha", label: "Alamat Tempat Usaha", tipe: "text", placeholder: "Contoh: Jl. Raya Bogem No. 12, RT 02/01", wajib: true },
      { id: "tahun_berdiri", label: "Mulai Usaha Sejak Tahun", tipe: "text", placeholder: "Contoh: 2021", wajib: false },
      { id: "keperluan", label: "Keperluan Pengajuan SKU", tipe: "textarea", placeholder: "Contoh: Persyaratan Pengajuan KUR Bank BRI", wajib: true },
    ],
  },
  {
    id: "opsi-2",
    nama_surat: "Surat Keterangan Domisili",
    deskripsi: "Surat bukti keterangan tempat tinggal resmi pemohon di wilayah Desa Bogem.",
    syarat: "Fotokopi KTP, KK, dan Alamat Tempat Tinggal Saat Ini.",
    custom_fields: [
      { id: "dusun", label: "Dusun / Lingkungan", tipe: "text", placeholder: "Contoh: Dusun Krajan", wajib: true },
      { id: "rt_rw", label: "RT / RW", tipe: "text", placeholder: "Contoh: RT 02 / RW 01", wajib: true },
      { id: "alamat_domisili", label: "Alamat Lengkap Tempat Tinggal", tipe: "textarea", placeholder: "Nama jalan / nomor rumah saat ini", wajib: true },
      { id: "keperluan", label: "Keperluan Surat Domisili", tipe: "textarea", placeholder: "Contoh: Persyaratan melamar pekerjaan / pembukaan rekening bank", wajib: true },
    ],
  },
  {
    id: "opsi-3",
    nama_surat: "Surat Keterangan Tidak Mampu (SKTM)",
    deskripsi: "Untuk permohonan beasiswa pendidikan, keringanan biaya rumah sakit, atau bansos.",
    syarat: "Fotokopi KTP, KK, dan Keterangan Keperluan Khusus.",
    custom_fields: [
      { id: "nama_kepala_keluarga", label: "Nama Kepala Keluarga / Orang Tua", tipe: "text", placeholder: "Nama kepala keluarga sesuai KK", wajib: true },
      { id: "tujuan_sktm", label: "Tujuan Pengajuan SKTM", tipe: "text", placeholder: "Contoh: Beasiswa Pendidikan Anak / Keringanan Biaya Rumah Sakit", wajib: true },
      { id: "penghasilan_per_bulan", label: "Rata-Rata Penghasilan per Bulan", tipe: "text", placeholder: "Contoh: Rp 800.000 / bulan", wajib: true },
      { id: "keperluan", label: "Keterangan Tambahan", tipe: "textarea", placeholder: "Keterangan kondisi ekonomi atau keperluan khusus", wajib: true },
    ],
  },
  {
    id: "opsi-4",
    nama_surat: "Surat Pengantar SKCK",
    deskripsi: "Surat rekomendasi pengantar dari desa untuk pembuatan SKCK di Polsek Kawedanan/Polres.",
    syarat: "Fotokopi KTP, KK, dan Pas Foto Berwarna.",
    custom_fields: [
      { id: "tempat_tgl_lahir", label: "Tempat, Tanggal Lahir", tipe: "text", placeholder: "Contoh: Magetan, 15 Mei 1998", wajib: true },
      { id: "pekerjaan", label: "Pekerjaan Saat Ini", tipe: "text", placeholder: "Contoh: Wiraswasta / Belum Bekerja", wajib: true },
      { id: "keperluan", label: "Keperluan Pembuatan SKCK", tipe: "textarea", placeholder: "Contoh: Melamar Pekerjaan di PT XYZ / Pendaftaran CPNS", wajib: true },
    ],
  },
  {
    id: "opsi-5",
    nama_surat: "Surat Keterangan Belum Menikah",
    deskripsi: "Keterangan status lajang/belum pernah menikah untuk persyaratan kerja atau pernikahan.",
    syarat: "Fotokopi KTP dan KK.",
    custom_fields: [
      { id: "tempat_tgl_lahir", label: "Tempat, Tanggal Lahir", tipe: "text", placeholder: "Contoh: Magetan, 20 Januari 2000", wajib: true },
      { id: "agama", label: "Agama", tipe: "text", placeholder: "Contoh: Islam", wajib: true },
      { id: "pekerjaan", label: "Pekerjaan", tipe: "text", placeholder: "Contoh: Karyawan Swasta", wajib: true },
      { id: "keperluan", label: "Keperluan Pembuatan Surat", tipe: "textarea", placeholder: "Contoh: Persyaratan administrasi pernikahan / persyaratan kerja", wajib: true },
    ],
  },
  {
    id: "opsi-6",
    nama_surat: "Surat Keterangan Kematian",
    deskripsi: "Surat pengantar pelaporan kematian untuk pencatatan kependudukan.",
    syarat: "Surat Keterangan Bidan/RS, KTP & KK.",
    custom_fields: [
      { id: "nama_almarhum", label: "Nama Lengkap Almarhum/Almarhumah", tipe: "text", placeholder: "Nama almarhum sesuai KTP/KK", wajib: true },
      { id: "nik_almarhum", label: "NIK Almarhum", tipe: "text", placeholder: "16 digit NIK almarhum", wajib: true },
      { id: "tanggal_meninggal", label: "Tanggal Meninggal Dunia", tipe: "date", wajib: true },
      { id: "tempat_meninggal", label: "Tempat Meninggal", tipe: "text", placeholder: "Contoh: Rumah Duka Desa Bogem / RSUD Sayidiman", wajib: true },
      { id: "sebab_kematian", label: "Penyebab Meninggal Dunia", tipe: "text", placeholder: "Contoh: Sakit / Usia Lanjut", wajib: true },
      { id: "hubungan_pelapor", label: "Hubungan Pemohon dengan Jenazah", tipe: "text", placeholder: "Contoh: Anak Kandung / Suami / Istri", wajib: true },
    ],
  },
];

export interface PermohonanSurat {
  id: string; // Kode Tiket e.g. "SRT-202508-4921"
  user_id?: string;
  opsi_surat_id?: string;
  nik: string;
  nama_lengkap: string;
  no_whatsapp: string;
  email?: string;
  jenis_surat: string;
  // Dynamic form values submitted by citizen
  data_formulir: Record<string, any>;
  status: StatusSurat;
  file_surat_selesai?: string; // Data URL or URL of the uploaded finished letter file
  nama_file_selesai?: string; // e.g. "Surat_Keterangan_Usaha_Yusa.pdf"
  catatan_admin?: string;
  created_at: string;
  updated_at: string;
}

export type CreatePermohonanInput = Omit<
  PermohonanSurat,
  "id" | "status" | "file_surat_selesai" | "nama_file_selesai" | "catatan_admin" | "created_at" | "updated_at"
>;
