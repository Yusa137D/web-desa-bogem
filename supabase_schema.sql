-- ==============================================================================
-- SKRIP MIGRASI DATABASE SUPABASE LENGKAP - WEB DESA BOGEM (MAGETAN)
-- ==============================================================================
-- CARA PENGGUNAAN:
-- 1. Buka Dashboard Supabase Anda: https://supabase.com/dashboard
-- 2. Pilih Project Database Desa Bogem Anda
-- 3. Masuk ke menu "SQL Editor" (ikon terminal di bilah sebelah kiri)
-- 4. Klik "New Query", tempelkan (paste) seluruh skrip di bawah ini, lalu klik "Run" (atau Ctrl + Enter)
-- ==============================================================================

-- 1. TABEL 'infografis' (Demografi Kependudukan, Pekerjaan, Pendidikan, APBDes & Status IDM)
CREATE TABLE IF NOT EXISTS public.infografis (
  id TEXT PRIMARY KEY DEFAULT 'main',
  demografi JSONB DEFAULT '{}'::jsonb,
  pekerjaan JSONB DEFAULT '[]'::jsonb,
  pendidikan JSONB DEFAULT '[]'::jsonb,
  apbdes JSONB DEFAULT '{}'::jsonb,
  idm JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL 'opsi_surat' (Pilihan Jenis Surat & Form Builder Dinamis yang Dikelola Admin)
CREATE TABLE IF NOT EXISTS public.opsi_surat (
  id TEXT PRIMARY KEY,
  nama_surat TEXT NOT NULL,
  deskripsi TEXT,
  syarat TEXT,
  custom_fields JSONB DEFAULT '[]'::jsonb, -- Kolom formulir dinamis yang diatur admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL 'permohonan_surat' (Data Pengajuan Surat Warga, Isian Form, & File Hasil Surat)
CREATE TABLE IF NOT EXISTS public.permohonan_surat (
  id TEXT PRIMARY KEY, -- Kode Tiket (misal: SRT-202508-4921)
  nik TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  no_whatsapp TEXT NOT NULL,
  email TEXT,
  jenis_surat TEXT NOT NULL,
  data_formulir JSONB DEFAULT '{}'::jsonb, -- Data isian dinamis pemohon sesuai kolom form surat
  status TEXT NOT NULL DEFAULT 'MENUNGGU', -- 'MENUNGGU' | 'DIPROSES' | 'SELESAI' | 'DITOLAK'
  file_surat_selesai TEXT, -- Link file atau Data URL dokumen jadi yang diupload admin
  nama_file_selesai TEXT,
  catatan_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL 'berita' (Kabar Publik & Warta Desa)
CREATE TABLE IF NOT EXISTS public.berita (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  judul TEXT NOT NULL,
  kategori TEXT DEFAULT 'Pengumuman Resmi',
  penulis TEXT DEFAULT 'Pemerintah Desa Bogem',
  ringkasan TEXT,
  konten TEXT NOT NULL,
  gambar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL 'umkm' (Etalase Produk Unggulan Warga)
CREATE TABLE IF NOT EXISTS public.umkm (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nama_usaha TEXT NOT NULL,
  pemilik TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Makanan & Minuman',
  kontak TEXT,
  alamat TEXT, -- Alamat / Lokasi Usaha di Desa (Dusun, RT/RW)
  harga TEXT,
  gambar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrasi kolom alamat jika tabel umkm sudah ada sebelumnya:
ALTER TABLE public.umkm ADD COLUMN IF NOT EXISTS alamat TEXT;

-- 6. TABEL 'perangkat_desa' (Struktur SOTK & Aparatur Pemerintahan)
CREATE TABLE IF NOT EXISTS public.perangkat_desa (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  foto TEXT,
  kontak TEXT,
  urutan INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL 'profil_desa' (Visi, Misi, Sambutan, Bagan Organisasi, Sejarah, Geografis, Kontak & Jam Layanan)
CREATE TABLE IF NOT EXISTS public.profil_desa (
  id TEXT PRIMARY KEY DEFAULT 'main',
  visi TEXT,
  misi JSONB DEFAULT '[]'::jsonb,
  nama_kades TEXT,
  foto_kades TEXT,
  sambutan_kades TEXT,
  bagan_desa_image TEXT, -- Foto Bagan Struktur Pemerintahan Desa
  bagan_bpd_image TEXT,  -- Foto Bagan Struktur Organisasi BPD
  sejarah TEXT,          -- Narasi Sejarah Desa
  luas_wilayah TEXT DEFAULT '245 Ha',
  jumlah_penduduk TEXT DEFAULT '3.620 Jiwa',
  ketinggian TEXT DEFAULT '± 78 mdpl',
  batas_wilayah JSONB DEFAULT '{"utara": "Desa Tladan / Genengan", "timur": "Desa Pojok / Kawedanan", "selatan": "Desa Giripurno", "barat": "Desa Sugihrejo"}'::jsonb,
  jam_pelayanan TEXT DEFAULT 'Senin - Jumat: 08.00 - 15.00 WIB',
  jam_pelayanan_note TEXT DEFAULT '*Sabtu & Minggu: Libur / Pelayanan Darurat',
  alamat_kantor TEXT DEFAULT 'Jl. Bakti Mulya No. 241, Desa Bogem, Kec. Kawedanan, Kab. Magetan',
  telepon_kantor TEXT DEFAULT '+62 812-3456-7890',
  email_kantor TEXT DEFAULT 'info@desabogem.id',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrasi kolom profil desa jika tabel sudah ada sebelumnya:
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS bagan_desa_image TEXT;
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS bagan_bpd_image TEXT;
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS sejarah TEXT;
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS luas_wilayah TEXT DEFAULT '245 Ha';
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS jumlah_penduduk TEXT DEFAULT '3.620 Jiwa';
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS ketinggian TEXT DEFAULT '± 78 mdpl';
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS batas_wilayah JSONB DEFAULT '{"utara": "Desa Tladan / Genengan", "timur": "Desa Pojok / Kawedanan", "selatan": "Desa Giripurno", "barat": "Desa Sugihrejo"}'::jsonb;
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS jam_pelayanan TEXT DEFAULT 'Senin - Jumat: 08.00 - 15.00 WIB';
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS jam_pelayanan_note TEXT DEFAULT '*Sabtu & Minggu: Libur / Pelayanan Darurat';
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS alamat_kantor TEXT DEFAULT 'Jl. Bakti Mulya No. 241, Desa Bogem, Kec. Kawedanan, Kab. Magetan';
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS telepon_kantor TEXT DEFAULT '+62 812-3456-7890';
ALTER TABLE public.profil_desa ADD COLUMN IF NOT EXISTS email_kantor TEXT DEFAULT 'info@desabogem.id';


-- ==============================================================================
-- SEED DATA DEFAULT (Inisialisasi Data Awal jika Tabel Masih Kosong)
-- ==============================================================================

-- Inisialisasi Data Infografis Default
INSERT INTO public.infografis (id, demografi, pekerjaan, pendidikan, apbdes, idm, updated_at)
VALUES (
  'main',
  '{"total_penduduk": 3620, "pria": 1790, "wanita": 1830, "kepala_keluarga": 1080, "luas_wilayah": 245, "jumlah_dusun": 4, "jumlah_rt": 18, "jumlah_rw": 4}'::jsonb,
  '[
    {"nama": "Petani & Pekebun", "persen": 45, "count": "1.629 Warga", "color": "bg-emerald-600"},
    {"nama": "Wiraswasta / UMKM", "persen": 23, "count": "832 Warga", "color": "bg-teal-600"},
    {"nama": "Karyawan Swasta", "persen": 16, "count": "579 Warga", "color": "bg-[#004329]"},
    {"nama": "PNS / TNI / Polri", "persen": 8, "count": "290 Warga", "color": "bg-emerald-500"},
    {"nama": "Lainnya / Jasa", "persen": 8, "count": "290 Warga", "color": "bg-slate-500"}
  ]'::jsonb,
  '[
    {"tingkat": "SD / Sederajat", "persen": 26, "count": "941 Warga"},
    {"tingkat": "SMP / Sederajat", "persen": 31, "count": "1.122 Warga"},
    {"tingkat": "SMA / SMK", "persen": 32, "count": "1.158 Warga"},
    {"tingkat": "Diploma / Sarjana (S1/S2)", "persen": 11, "count": "399 Warga"}
  ]'::jsonb,
  '{
    "tahun_anggaran": "2024",
    "pendapatan_total": 1520400000,
    "pendapatan_rincian": [
      {"nama": "Dana Desa (DDS)", "nominal": 850000000},
      {"nama": "Alokasi Dana Desa (ADD)", "nominal": 420400000},
      {"nama": "Pendapatan Asli Desa (PADes)", "nominal": 150000000},
      {"nama": "Bagi Hasil Pajak & Retribusi (PBH)", "nominal": 100000000}
    ],
    "belanja_total": 1445100000,
    "belanja_rincian": [
      {"nama": "Bidang Pembangunan Desa", "nominal": 680000000},
      {"nama": "Bidang Penyelenggaraan Pemerintahan", "nominal": 450100000},
      {"nama": "Bidang Pembinaan Kemasyarakatan", "nominal": 165000000},
      {"nama": "Bidang Pemberdayaan Masyarakat", "nominal": 110000000},
      {"nama": "Bidang Penanggulangan Bencana & Darurat", "nominal": 40000000}
    ],
    "surplus_defisit": 75300000,
    "silpa": 75300000
  }'::jsonb,
  '{
    "tahun": 2025,
    "skorTotal": 0.8542,
    "status": "DESA MANDIRI",
    "iks": {"skor": 0.892, "label": "Sangat Baik"},
    "ike": {"skor": 0.785, "label": "Baik (Berkembang)"},
    "ikl": {"skor": 0.886, "label": "Sangat Baik"},
    "riwayat": [
      {"tahun": 2021, "skor": 0.712, "status": "Desa Berkembang"},
      {"tahun": 2023, "skor": 0.798, "status": "Desa Maju"},
      {"tahun": 2025, "skor": 0.8542, "status": "Desa Mandiri"}
    ],
    "faktor_pendukung": [
      "Aksesibilitas jaringan internet & layanan digital desa terintegrasi.",
      "Pasar desa dan pusat promosi UMKM lokal aktif.",
      "Fasilitas kesehatan dan tenaga medis mudah dijangkau warga.",
      "Sistem mitigasi bencana alam dan kebersihan lingkungan terjaga."
    ]
  }'::jsonb,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Inisialisasi Pilihan Opsi Surat Default
INSERT INTO public.opsi_surat (id, nama_surat, deskripsi, syarat)
VALUES
  ('opsi-1', 'Surat Keterangan Usaha (SKU)', 'Untuk legalitas pembukaan rekening usaha, pengajuan pinjaman/KUR, atau verifikasi UMKM.', 'Fotokopi KTP & KK, Nama Usaha, Jenis Usaha, dan Alamat Lokasi Usaha.'),
  ('opsi-2', 'Surat Keterangan Domisili', 'Surat bukti keterangan tempat tinggal resmi pemohon di wilayah Desa Bogem.', 'Fotokopi KTP, KK, dan Alamat Tempat Tinggal Saat Ini.'),
  ('opsi-3', 'Surat Keterangan Tidak Mampu (SKTM)', 'Untuk permohonan beasiswa pendidikan, keringanan biaya rumah sakit, atau bansos.', 'Fotokopi KTP, KK, dan Keterangan Keperluan Khusus.'),
  ('opsi-4', 'Surat Pengantar SKCK', 'Surat rekomendasi pengantar dari desa untuk pembuatan SKCK di Polsek Kawedanan/Polres.', 'Fotokopi KTP, KK, dan Pas Foto Berwarna.'),
  ('opsi-5', 'Surat Keterangan Belum Menikah', 'Keterangan status lajang/belum pernah menikah untuk persyaratan kerja atau pernikahan.', 'Fotokopi KTP dan KK.'),
  ('opsi-6', 'Surat Keterangan Kelahiran / Kematian', 'Surat pengantar pelaporan kelahiran atau kematian untuk pencatatan kependudukan.', 'Surat Keterangan Bidan/RS, KTP & KK.')
ON CONFLICT (id) DO NOTHING;

-- Inisialisasi Data Profil Desa
INSERT INTO public.profil_desa (id, visi, misi, nama_kades, sambutan_kades, updated_at)
VALUES (
  'main',
  'Mewujudkan Desa Bogem yang Mandiri, Sejahtera, Berdaya Saing, dan Berbudaya melalui Tata Kelola Pemerintahan yang Transparan dan Pemanfaatan Teknologi Digital.',
  '[
    "Meningkatkan kualitas pelayanan administrasi dan informasi masyarakat berbasis digital.",
    "Mendorong pertumbuhan ekonomi warga lewat dukungan UMKM dan pemasaran produk lokal.",
    "Meningkatkan infrastruktur sarana publik dan kelestarian lingkungan hidup desa.",
    "Mempererat kerukunan gotong royong dan melestarikan kearifan budaya lokal."
  ]'::jsonb,
  'Kepala Desa Bogem',
  'Selamat datang di Website Resmi Desa Bogem, Kecamatan Kawedanan, Kabupaten Magetan. Portal digital ini hadir sebagai wujud komitmen kami dalam keterbukaan informasi publik, kemudahan layanan administrasi, dan etalase promosi potensi ekonomi warga desa secara luas dan modern.',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES
-- ==============================================================================
ALTER TABLE public.infografis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opsi_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permohonan_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perangkat_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profil_desa ENABLE ROW LEVEL SECURITY;

-- Reset kebijakan lama jika ada
DROP POLICY IF EXISTS "Allow public read infografis" ON public.infografis;
DROP POLICY IF EXISTS "Allow public read opsi_surat" ON public.opsi_surat;
DROP POLICY IF EXISTS "Allow public read permohonan_surat" ON public.permohonan_surat;
DROP POLICY IF EXISTS "Allow public read berita" ON public.berita;
DROP POLICY IF EXISTS "Allow public read umkm" ON public.umkm;
DROP POLICY IF EXISTS "Allow public read perangkat_desa" ON public.perangkat_desa;
DROP POLICY IF EXISTS "Allow public read profil_desa" ON public.profil_desa;

DROP POLICY IF EXISTS "Allow write infografis" ON public.infografis;
DROP POLICY IF EXISTS "Allow write opsi_surat" ON public.opsi_surat;
DROP POLICY IF EXISTS "Allow write permohonan_surat" ON public.permohonan_surat;
DROP POLICY IF EXISTS "Allow write berita" ON public.berita;
DROP POLICY IF EXISTS "Allow write umkm" ON public.umkm;
DROP POLICY IF EXISTS "Allow write perangkat_desa" ON public.perangkat_desa;
DROP POLICY IF EXISTS "Allow write profil_desa" ON public.profil_desa;

-- Kebijakan Akses Baca Publik (Select)
CREATE POLICY "Allow public read infografis" ON public.infografis FOR SELECT USING (true);
CREATE POLICY "Allow public read opsi_surat" ON public.opsi_surat FOR SELECT USING (true);
CREATE POLICY "Allow public read permohonan_surat" ON public.permohonan_surat FOR SELECT USING (true);
CREATE POLICY "Allow public read berita" ON public.berita FOR SELECT USING (true);
CREATE POLICY "Allow public read umkm" ON public.umkm FOR SELECT USING (true);
CREATE POLICY "Allow public read perangkat_desa" ON public.perangkat_desa FOR SELECT USING (true);
CREATE POLICY "Allow public read profil_desa" ON public.profil_desa FOR SELECT USING (true);

-- Kebijakan Akses Tulis & Update (Insert, Update, Delete)
CREATE POLICY "Allow write infografis" ON public.infografis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write opsi_surat" ON public.opsi_surat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write permohonan_surat" ON public.permohonan_surat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write berita" ON public.berita FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write umkm" ON public.umkm FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write perangkat_desa" ON public.perangkat_desa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write profil_desa" ON public.profil_desa FOR ALL USING (true) WITH CHECK (true);
