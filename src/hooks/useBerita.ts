"use client";

import { useState, useEffect } from "react";
import { BeritaItem } from "@/types/berita";
import { fetchBeritaList, getLocalBerita } from "@/services/beritaService";

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
    // 1. Instantly populate from cache if available
    const local = getLocalBerita();
    if (local && local.length > 0) {
      setData(local);
      setLoading(false);
    }

    // 2. Fetch latest data
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("local_berita_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("local_berita_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { data, loading, error, reload: loadData };
}

