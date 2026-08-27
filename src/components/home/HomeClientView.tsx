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
import { fetchBeritaList, getLocalBerita } from "@/services/beritaService";
import { fetchUMKMList, getLocalUMKM } from "@/services/umkmService";
import { fetchPerangkatList, getLocalPerangkat } from "@/services/perangkatService";
import { fetchProfilDesa, getLocalProfil } from "@/services/profilService";
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
  // Start with pre-rendered server data for INSTANT 0ms display
  const [listBerita, setListBerita] = useState<BeritaItem[]>(initialBerita);
  const [listUMKM, setListUMKM] = useState<UMKMItem[]>(initialUMKM);
  const [listPerangkat, setListPerangkat] = useState<PerangkatItem[]>(initialPerangkat);
  const [profilData, setProfilData] = useState<ProfilDesaData>(initialProfil);

  useEffect(() => {
    // 1. If local storage has fresher/newer un-synced edits, merge immediately
    const localBerita = getLocalBerita();
    if (localBerita && localBerita.length > 0) setListBerita(localBerita.slice(0, 3));

    const localUMKM = getLocalUMKM();
    if (localUMKM && localUMKM.length > 0) setListUMKM(localUMKM.slice(0, 3));

    const localPerangkat = getLocalPerangkat();
    if (localPerangkat && localPerangkat.length > 0) setListPerangkat(localPerangkat);

    const localProfil = getLocalProfil();
    if (localProfil && localProfil.visi) setProfilData(localProfil);

    // 2. Fetch fresh updates in the background (Non-blocking)
    const syncLatest = () => {
      fetchBeritaList().then((b) => setListBerita(b.slice(0, 3))).catch(() => {});
      fetchUMKMList().then((u) => setListUMKM(u.slice(0, 3))).catch(() => {});
      fetchPerangkatList().then((p) => setListPerangkat(p)).catch(() => {});
      fetchProfilDesa().then((prof) => setProfilData(prof)).catch(() => {});
    };

    syncLatest();

    // 3. Realtime event listeners for instant admin edits
    window.addEventListener("local_umkm_updated", syncLatest);
    window.addEventListener("local_berita_updated", syncLatest);
    window.addEventListener("local_perangkat_updated", syncLatest);
    window.addEventListener("local_profil_updated", syncLatest);
    window.addEventListener("local_infografis_updated", syncLatest);
    window.addEventListener("storage", syncLatest);

    return () => {
      window.removeEventListener("local_umkm_updated", syncLatest);
      window.removeEventListener("local_berita_updated", syncLatest);
      window.removeEventListener("local_perangkat_updated", syncLatest);
      window.removeEventListener("local_profil_updated", syncLatest);
      window.removeEventListener("local_infografis_updated", syncLatest);
      window.removeEventListener("storage", syncLatest);
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
