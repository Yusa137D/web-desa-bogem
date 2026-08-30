import { HomeClientView } from "@/components/home";
import { fetchBeritaList, fallbackBeritaList } from "@/services/beritaService";
import { fetchUMKMList, fallbackUMKMList } from "@/services/umkmService";
import { fetchPerangkatList, fallbackPerangkatList } from "@/services/perangkatService";
import { fetchProfilDesa, defaultProfilDesa } from "@/services/profilService";
import { BeritaItem } from "@/types/berita";
import { UMKMItem } from "@/types/umkm";
import { PerangkatItem } from "@/types/perangkat";
import { ProfilDesaData } from "@/types/profil";

// Enable Incremental Static Regeneration (5 minutes edge cache)
export const revalidate = 300;

export default async function Home() {
  let initialBerita: BeritaItem[] = fallbackBeritaList;
  let initialUMKM: UMKMItem[] = fallbackUMKMList;
  let initialPerangkat: PerangkatItem[] = fallbackPerangkatList;
  let initialProfil: ProfilDesaData = defaultProfilDesa;

  try {
    const [beritaData, umkmData, perangkatData, profilData] = await Promise.all([
      fetchBeritaList().catch(() => []),
      fetchUMKMList().catch(() => []),
      fetchPerangkatList().catch(() => []),
      fetchProfilDesa().catch(() => defaultProfilDesa),
    ]);

    if (beritaData && beritaData.length > 0) initialBerita = beritaData.slice(0, 3);
    if (umkmData && umkmData.length > 0) initialUMKM = umkmData.slice(0, 3);
    if (perangkatData && perangkatData.length > 0) initialPerangkat = perangkatData;
    if (profilData) initialProfil = profilData;
  } catch (err) {
    console.error("Server pre-rendering data error in Home:", err);
  }

  return (
    <HomeClientView
      initialBerita={initialBerita}
      initialUMKM={initialUMKM}
      initialPerangkat={initialPerangkat}
      initialProfil={initialProfil}
    />
  );
}