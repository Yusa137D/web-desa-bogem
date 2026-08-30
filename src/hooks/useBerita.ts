"use client";

import { useState, useEffect } from "react";
import { BeritaItem } from "@/types/berita";
import { fetchBeritaList } from "@/services/beritaService";

export function useBerita() {
  const [data, setData] = useState<BeritaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const items = await fetchBeritaList();
      setData(items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat berita";
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
