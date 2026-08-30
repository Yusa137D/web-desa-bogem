"use client";

import { useState, useEffect } from "react";
import { UMKMItem } from "@/types/umkm";
import { fetchUMKMList } from "@/services/umkmService";

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
    loadData();
  }, []);

  return { data, loading, error, reload: loadData };
}
