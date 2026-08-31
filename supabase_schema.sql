-- ==============================================================================
-- SKRIP MIGRASI DATABASE SUPABASE LENGKAP & AMAN - WEB DESA BOGEM (MAGETAN)
-- ==============================================================================
-- CARA PENGGUNAAN:
-- 1. Buka Dashboard Supabase Anda: https://supabase.com/dashboard
-- 2. Pilih Project Database Desa Bogem Anda
-- 3. Masuk ke menu "SQL Editor" (ikon terminal di bilah sebelah kiri)
-- 4. Klik "New Query", tempelkan (paste) seluruh skrip di bawah ini, lalu klik "Run" (atau Ctrl + Enter)
-- ==============================================================================

-- 1. TABEL 'profiles' (Profil Akun Warga & Perangkat Desa)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nik TEXT UNIQUE,
  nama TEXT NOT NULL,
  no_hp TEXT,
  email TEXT,
  alamat TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'warga', -- 'admin' | 'warga'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nik TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS no_hp TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS alamat TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. TABEL 'infografis' (Demografi Kependudukan, Pekerjaan, Pendidikan, APBDes & Status IDM)
CREATE TABLE IF NOT EXISTS public.infografis (
  id TEXT PRIMARY KEY DEFAULT 'main',
  demografi JSONB DEFAULT '{}'::jsonb,
  pekerjaan JSONB DEFAULT '[]'::jsonb,
  pendidikan JSONB DEFAULT '[]'::jsonb,
  apbdes JSONB DEFAULT '{}'::jsonb,
  idm JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL 'opsi_surat' (Pilihan Jenis Surat & Form Builder Dinamis yang Dikelola Admin)
CREATE TABLE IF NOT EXISTS public.opsi_surat (
  id TEXT PRIMARY KEY,
  nama_surat TEXT NOT NULL,
  deskripsi TEXT,
  syarat TEXT,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL 'permohonan_surat' (Data Pengajuan Surat Warga, Isian Form, & File Hasil Surat)
CREATE TABLE IF NOT EXISTS public.permohonan_surat (
  id TEXT PRIMARY KEY, -- Kode Tiket (misal: SRT-202508-4921)
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  opsi_surat_id TEXT REFERENCES public.opsi_surat(id) ON DELETE SET NULL,
  nik TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  no_whatsapp TEXT NOT NULL,
  email TEXT,
  jenis_surat TEXT NOT NULL,
  data_formulir JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'MENUNGGU', -- 'MENUNGGU' | 'DIPROSES' | 'SELESAI' | 'DITOLAK'
  file_surat_selesai TEXT,
  nama_file_selesai TEXT,
  catatan_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL 'berita' (Kabar Publik & Warta Desa)
CREATE TABLE IF NOT EXISTS public.berita (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  judul TEXT NOT NULL,
  kategori TEXT DEFAULT 'Pengumuman Resmi',
  penulis TEXT DEFAULT 'Pemerintah Desa Bogem',
  ringkasan TEXT,
  konten TEXT NOT NULL,
  gambar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL 'umkm' (Etalase Produk Unggulan Warga)
CREATE TABLE IF NOT EXISTS public.umkm (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nama_usaha TEXT NOT NULL,
  pemilik TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Makanan & Minuman',
  kontak TEXT,
  alamat TEXT,
  harga TEXT,
  gambar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL 'perangkat_desa' (Struktur SOTK & Aparatur Pemerintahan)
CREATE TABLE IF NOT EXISTS public.perangkat_desa (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  foto TEXT,
  kontak TEXT,
  urutan INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL 'profil_desa' (Visi, Misi, Sambutan, Bagan Organisasi, Sejarah, Geografis, Kontak & Jam Layanan)
CREATE TABLE IF NOT EXISTS public.profil_desa (
  id TEXT PRIMARY KEY DEFAULT 'main',
  visi TEXT,
  misi JSONB DEFAULT '[]'::jsonb,
  nama_kades TEXT,
  foto_kades TEXT,
  sambutan_kades TEXT,
  bagan_desa_image TEXT,
  bagan_bpd_image TEXT,
  sejarah TEXT,
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

-- ==============================================================================
-- SEED DATA DEFAULT (Inisialisasi jika Tabel Kosong)
-- ==============================================================================
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

INSERT INTO public.opsi_surat (id, nama_surat, deskripsi, syarat)
VALUES
  ('opsi-1', 'Surat Keterangan Usaha (SKU)', 'Untuk legalitas pembukaan rekening usaha, pengajuan pinjaman/KUR, atau verifikasi UMKM.', 'Fotokopi KTP & KK, Nama Usaha, Jenis Usaha, dan Alamat Lokasi Usaha.'),
  ('opsi-2', 'Surat Keterangan Domisili', 'Surat bukti keterangan tempat tinggal resmi pemohon di wilayah Desa Bogem.', 'Fotokopi KTP, KK, dan Alamat Tempat Tinggal Saat Ini.'),
  ('opsi-3', 'Surat Keterangan Tidak Mampu (SKTM)', 'Untuk permohonan beasiswa pendidikan, keringanan biaya rumah sakit, atau bansos.', 'Fotokopi KTP, KK, dan Keterangan Keperluan Khusus.'),
  ('opsi-4', 'Surat Pengantar SKCK', 'Surat rekomendasi pengantar dari desa untuk pembuatan SKCK di Polsek Kawedanan/Polres.', 'Fotokopi KTP, KK, dan Pas Foto Berwarna.'),
  ('opsi-5', 'Surat Keterangan Belum Menikah', 'Keterangan status lajang/belum pernah menikah untuk persyaratan kerja atau pernikahan.', 'Fotokopi KTP dan KK.'),
  ('opsi-6', 'Surat Keterangan Kelahiran / Kematian', 'Surat pengantar pelaporan kelahiran atau kematian untuk pencatatan kependudukan.', 'Surat Keterangan Bidan/RS, KTP & KK.')
ON CONFLICT (id) DO NOTHING;

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
-- TRIGGER OTOMATIS: SINKRONISASI USER DARI auth.users KE public.profiles
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama, nik, no_hp, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'nama',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'nik',
    COALESCE(new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'no_hp'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    COALESCE(new.raw_user_meta_data->>'role', 'warga')
  )
  ON CONFLICT (id) DO UPDATE SET
    nama = COALESCE(EXCLUDED.nama, profiles.nama),
    nik = COALESCE(EXCLUDED.nik, profiles.nik),
    no_hp = COALESCE(EXCLUDED.no_hp, profiles.no_hp),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- KEAMANAN: ROW LEVEL SECURITY (RLS) & POLICY AKSES KETAT
-- ==============================================================================

-- 1. Fungsi Pembantu: Mengecek apakah user adalah Admin Desa
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Aktifkan RLS pada seluruh tabel
ALTER TABLE public.infografis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opsi_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permohonan_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perangkat_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profil_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Reset seluruh policy lama jika ada
DROP POLICY IF EXISTS "Allow public read infografis" ON public.infografis;
DROP POLICY IF EXISTS "Allow write infografis" ON public.infografis;
DROP POLICY IF EXISTS "Public read infografis" ON public.infografis;
DROP POLICY IF EXISTS "Admin write infografis" ON public.infografis;

DROP POLICY IF EXISTS "Allow public read opsi_surat" ON public.opsi_surat;
DROP POLICY IF EXISTS "Allow write opsi_surat" ON public.opsi_surat;
DROP POLICY IF EXISTS "Public read opsi_surat" ON public.opsi_surat;
DROP POLICY IF EXISTS "Admin write opsi_surat" ON public.opsi_surat;

DROP POLICY IF EXISTS "Allow public read berita" ON public.berita;
DROP POLICY IF EXISTS "Allow write berita" ON public.berita;
DROP POLICY IF EXISTS "Public read berita" ON public.berita;
DROP POLICY IF EXISTS "Admin write berita" ON public.berita;

DROP POLICY IF EXISTS "Allow public read umkm" ON public.umkm;
DROP POLICY IF EXISTS "Allow write umkm" ON public.umkm;
DROP POLICY IF EXISTS "Public read umkm" ON public.umkm;
DROP POLICY IF EXISTS "Admin write umkm" ON public.umkm;

DROP POLICY IF EXISTS "Allow public read perangkat_desa" ON public.perangkat_desa;
DROP POLICY IF EXISTS "Allow write perangkat_desa" ON public.perangkat_desa;
DROP POLICY IF EXISTS "Public read perangkat_desa" ON public.perangkat_desa;
DROP POLICY IF EXISTS "Admin write perangkat_desa" ON public.perangkat_desa;

DROP POLICY IF EXISTS "Allow public read profil_desa" ON public.profil_desa;
DROP POLICY IF EXISTS "Allow write profil_desa" ON public.profil_desa;
DROP POLICY IF EXISTS "Public read profil_desa" ON public.profil_desa;
DROP POLICY IF EXISTS "Admin write profil_desa" ON public.profil_desa;

DROP POLICY IF EXISTS "Allow public read permohonan_surat" ON public.permohonan_surat;
DROP POLICY IF EXISTS "Allow write permohonan_surat" ON public.permohonan_surat;
DROP POLICY IF EXISTS "Warga view own surat" ON public.permohonan_surat;
DROP POLICY IF EXISTS "Public insert surat" ON public.permohonan_surat;
DROP POLICY IF EXISTS "Admin update delete surat" ON public.permohonan_surat;
DROP POLICY IF EXISTS "Admin delete surat" ON public.permohonan_surat;

DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow write profiles" ON public.profiles;
DROP POLICY IF EXISTS "User view own profile or admin" ON public.profiles;
DROP POLICY IF EXISTS "User update own profile" ON public.profiles;

-- 4. Kebijakan Tabel Publik (Hanya BACA untuk Umum, TULIS untuk Admin)
CREATE POLICY "Public read infografis" ON public.infografis FOR SELECT USING (true);
CREATE POLICY "Admin write infografis" ON public.infografis FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read opsi_surat" ON public.opsi_surat FOR SELECT USING (true);
CREATE POLICY "Admin write opsi_surat" ON public.opsi_surat FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read berita" ON public.berita FOR SELECT USING (true);
CREATE POLICY "Admin write berita" ON public.berita FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read umkm" ON public.umkm FOR SELECT USING (true);
CREATE POLICY "Admin write umkm" ON public.umkm FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read perangkat_desa" ON public.perangkat_desa FOR SELECT USING (true);
CREATE POLICY "Admin write perangkat_desa" ON public.perangkat_desa FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read profil_desa" ON public.profil_desa FOR SELECT USING (true);
CREATE POLICY "Admin write profil_desa" ON public.profil_desa FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Kebijakan Tabel Sensitif: Permohonan Surat
-- Warga hanya boleh melihat surat milik mereka sendiri; Admin bisa melihat semua
CREATE POLICY "Warga view own surat" ON public.permohonan_surat
FOR SELECT USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR public.is_admin()
);

-- Siapapun (Warga login / Pengunjung yang mengajukan permohonan) boleh memasukkan pengajuan
CREATE POLICY "Public insert surat" ON public.permohonan_surat
FOR INSERT WITH CHECK (true);

-- Hanya Admin Desa yang boleh mengubah status surat atau menghapus pengajuan
CREATE POLICY "Admin update delete surat" ON public.permohonan_surat
FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete surat" ON public.permohonan_surat
FOR DELETE USING (public.is_admin());

-- 6. Kebijakan Tabel Profiles
-- Reset kebijakan lama
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow write profiles" ON public.profiles;
DROP POLICY IF EXISTS "User view own profile or admin" ON public.profiles;
DROP POLICY IF EXISTS "User update own profile" ON public.profiles;
DROP POLICY IF EXISTS "User insert own profile" ON public.profiles;

-- Publik diizinkan membaca data profil agar NIK login lookup dan validasi unik NIK dapat berjalan lancar
CREATE POLICY "Allow public read profiles" ON public.profiles
FOR SELECT USING (true);

-- User terotentikasi dapat membuat (insert) profil miliknya sendiri jika belum ada
CREATE POLICY "User insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- User dapat mengupdate profil miliknya sendiri, atau Admin dapat mengupdate seluruh profil
CREATE POLICY "User update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

-- ==============================================================================
-- KONFIGURASI STORAGE BUCKET 'public-images'
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-images', 'public-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public view images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete images" ON storage.objects;

-- Publik boleh melihat gambar di bucket 'public-images'
CREATE POLICY "Public view images" ON storage.objects
FOR SELECT USING (bucket_id = 'public-images');

-- Pengguna terautentikasi atau Admin boleh mengunggah file
CREATE POLICY "Admin upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'public-images' AND (auth.role() = 'authenticated' OR public.is_admin()));

CREATE POLICY "Admin update images" ON storage.objects
FOR UPDATE USING (bucket_id = 'public-images' AND public.is_admin());

CREATE POLICY "Admin delete images" ON storage.objects
FOR DELETE USING (bucket_id = 'public-images' AND public.is_admin());
