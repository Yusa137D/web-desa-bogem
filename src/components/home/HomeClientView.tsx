"use client";

import {
  HeroSlider,
  QuickShortcuts,
  SambutanKades,
  VisiMisiSection,
  AparaturPreview,
  StatistikSection,
  BeritaPreview,
  UMKMPreview,
  PetaSection,
} from "@/components/home";
import { BeritaItem } from "@/types/berita";
import { UMKMItem } from "@/types/umkm";
import { PerangkatItem } from "@/types/perangkat";
import { ProfilDesaData } from "@/types/profil";

interface HomeClientViewProps {
  initialBerita: BeritaItem[];
  initialUMKM: UMKMItem[];
  initialPerangkat: PerangkatItem[];
  initialProfil: ProfilDesaData;
}

export default function HomeClientView({
  initialBerita,
  initialUMKM,
  initialPerangkat,
  initialProfil,
}: HomeClientViewProps) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* 1. Hero Slider Banner */}
      <HeroSlider />

      {/* 2. Quick Shortcuts Grid */}
      <QuickShortcuts />

      {/* 3. Sambutan Kepala Desa */}
      <SambutanKades profilData={initialProfil} listPerangkat={initialPerangkat} />

      {/* 4. Visi & Misi Pembangunan */}
      <VisiMisiSection profilData={initialProfil} />

      {/* 5. Struktur SOTK / Aparatur Desa */}
      <AparaturPreview listPerangkat={initialPerangkat} />

      {/* 6. Statistik & Infografis Ringkas */}
      <StatistikSection />

      {/* 7. Kabar & Berita Terbaru */}
      <BeritaPreview listBerita={initialBerita} />

      {/* 8. Beli Dari Desa (UMKM Unggulan) */}
      <UMKMPreview listUMKM={initialUMKM} />

      {/* 9. Peta Wilayah & Informasi Kantor */}
      <PetaSection />
    </main>
  );
}
