"use client";

import { useState, useEffect } from "react";
import { UMKMItem } from "@/types/umkm";
import { fetchUMKMList, getLocalUMKM } from "@/services/umkmService";

export function useUMKM() {
  const [data, setData] = useState<UMKMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const items = await fetchUMKMList();
      setData(items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data UMKM";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Instantly populate from local storage if available
    const local = getLocalUMKM();
    if (local && local.length > 0) {
      setData(local);
      setLoading(false);
    }

    // 2. Fetch latest data
    loadData();

    // 3. Listen to local update events across components and tabs
    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("local_umkm_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("local_umkm_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { data, loading, error, reload: loadData };
}
