"use client";

import { useState, useEffect } from "react";
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
import { fetchBeritaList, getLocalBerita, fallbackBeritaList } from "@/services/beritaService";
import { fetchUMKMList, getLocalUMKM, fallbackUMKMList } from "@/services/umkmService";
import { fetchPerangkatList, getLocalPerangkat, fallbackPerangkatList } from "@/services/perangkatService";
import { fetchProfilDesa, getLocalProfil, defaultProfilDesa } from "@/services/profilService";
import { BeritaItem } from "@/types/berita";
import { UMKMItem } from "@/types/umkm";
import { PerangkatItem } from "@/types/perangkat";
import { ProfilDesaData } from "@/types/profil";

export default function Home() {
  // Initial state strictly matches Server-Side Rendering to prevent Hydration Mismatch
  const [listBerita, setListBerita] = useState<BeritaItem[]>(() => fallbackBeritaList.slice(0, 3));
  const [listUMKM, setListUMKM] = useState<UMKMItem[]>(() => fallbackUMKMList.slice(0, 3));
  const [listPerangkat, setListPerangkat] = useState<PerangkatItem[]>(() => fallbackPerangkatList);
  const [profilData, setProfilData] = useState<ProfilDesaData>(() => defaultProfilDesa);

  useEffect(() => {
    // 1. Immediately hydrate with cached local data on client mount
    const localBerita = getLocalBerita();
    if (localBerita && localBerita.length > 0) setListBerita(localBerita.slice(0, 3));

    const localUMKM = getLocalUMKM();
    if (localUMKM && localUMKM.length > 0) setListUMKM(localUMKM.slice(0, 3));

    const localPerangkat = getLocalPerangkat();
    if (localPerangkat && localPerangkat.length > 0) setListPerangkat(localPerangkat);

    const localProfil = getLocalProfil();
    if (localProfil) setProfilData(localProfil);

    // 2. Fetch latest data concurrently from Supabase without blocking each other
    async function loadAllData() {
      fetchBeritaList()
        .then((berita) => setListBerita(berita.slice(0, 3)))
        .catch((err) => console.error("Error loading berita:", err));

      fetchUMKMList()
        .then((umkm) => setListUMKM(umkm.slice(0, 3)))
        .catch((err) => console.error("Error loading UMKM:", err));

      fetchPerangkatList()
        .then((perangkat) => setListPerangkat(perangkat))
        .catch((err) => console.error("Error loading perangkat:", err));

      fetchProfilDesa()
        .then((profil) => setProfilData(profil))
        .catch((err) => console.error("Error loading profil:", err));
    }
    loadAllData();

    // 3. Reactive event listeners for real-time updates from admin actions
    const handleReload = () => {
      loadAllData();
    };

    window.addEventListener("local_umkm_updated", handleReload);
    window.addEventListener("local_berita_updated", handleReload);
    window.addEventListener("local_perangkat_updated", handleReload);
    window.addEventListener("local_profil_updated", handleReload);
    window.addEventListener("local_infografis_updated", handleReload);
    window.addEventListener("storage", handleReload);

    return () => {
      window.removeEventListener("local_umkm_updated", handleReload);
      window.removeEventListener("local_berita_updated", handleReload);
      window.removeEventListener("local_perangkat_updated", handleReload);
      window.removeEventListener("local_profil_updated", handleReload);
      window.removeEventListener("local_infografis_updated", handleReload);
      window.removeEventListener("storage", handleReload);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* 1. Hero Slider Banner */}
      <HeroSlider />

      {/* 2. Quick Shortcuts Grid */}
      <QuickShortcuts />

      {/* 3. Sambutan Kepala Desa */}
      <SambutanKades profilData={profilData} listPerangkat={listPerangkat} />

      {/* 4. Visi & Misi Pembangunan */}
      <VisiMisiSection profilData={profilData} />

      {/* 5. Struktur SOTK / Aparatur Desa */}
      <AparaturPreview listPerangkat={listPerangkat} />

      {/* 6. Statistik & Infografis Ringkas */}
      <StatistikSection />

      {/* 7. Kabar & Berita Terbaru */}
      <BeritaPreview listBerita={listBerita} />

      {/* 8. Beli Dari Desa (UMKM Unggulan) */}
      <UMKMPreview listUMKM={listUMKM} />

      {/* 9. Peta Wilayah & Informasi Kantor */}
      <PetaSection />
    </main>
  );
}