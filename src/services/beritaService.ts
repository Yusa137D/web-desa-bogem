import { supabase } from "@/lib/supabase";
import { BeritaItem, CreateBeritaInput } from "@/types/berita";

// Clean initial list without hardcoded dummy data
export const fallbackBeritaList: BeritaItem[] = [];

// Helper to track permanently deleted IDs
export function getDeletedBeritaIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("deleted_berita_ids");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedBeritaId(id: string | number) {
  if (typeof window === "undefined") return;
  try {
    const deleted = getDeletedBeritaIds();
    const strId = String(id);
    if (!deleted.includes(strId)) {
      localStorage.setItem("deleted_berita_ids", JSON.stringify([...deleted, strId]));
    }
  } catch (err) {
    console.error("Failed to add deleted berita id:", err);
  }
}

// Helper to get items stored in client-side localStorage
export function getLocalBerita(): BeritaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("local_berita_items");
    if (!raw) return [];
    const items: BeritaItem[] = JSON.parse(raw);
    
    // Auto-clean test/corrupted items and deleted items
    const deletedIds = getDeletedBeritaIds();
    const cleaned = items.filter(
      (item) =>
        item.judul &&
        item.judul.trim().toLowerCase() !== "djbcjdbjd" &&
        !deletedIds.includes(String(item.id))
    );
    if (cleaned.length !== items.length) {
      localStorage.setItem("local_berita_items", JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

// Helper to save item to client-side localStorage
export function saveLocalBerita(item: BeritaItem) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalBerita();
    const existingIndex = current.findIndex((i) => String(i.id) === String(item.id));

    let updated: BeritaItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...current[existingIndex], ...item };
    } else {
      updated = [item, ...current];
    }

    localStorage.setItem("local_berita_items", JSON.stringify(updated));
    window.dispatchEvent(new Event("local_berita_updated"));
  } catch (err) {
    console.error("Failed to save local Berita item:", err);
  }
}

// Helper to remove item from client-side localStorage
export function removeLocalBerita(id: string | number, judul?: string) {
  if (typeof window === "undefined") return;
  try {
    addDeletedBeritaId(id);

    const current = getLocalBerita();
    const updated = current.filter(
      (item) =>
        String(item.id) !== String(id) &&
        (!judul || item.judul.toLowerCase() !== judul.toLowerCase())
    );
    localStorage.setItem("local_berita_items", JSON.stringify(updated));
    window.dispatchEvent(new Event("local_berita_updated"));
  } catch (err) {
    console.error("Failed to remove local Berita item:", err);
  }
}

export async function fetchBeritaList(): Promise<BeritaItem[]> {
  const localItems = getLocalBerita();
  const deletedIds = getDeletedBeritaIds();

  try {
    const { data, error } = await supabase
      .from("berita")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return localItems.filter((item) => !deletedIds.includes(String(item.id)));
    }

    const filteredDbData = data.filter(
      (item) =>
        item.judul &&
        item.judul.trim().toLowerCase() !== "djbcjdbjd" &&
        !deletedIds.includes(String(item.id))
    );

    const fetchedItems = filteredDbData.map((item) => {
      const localMatch = localItems.find(
        (l) => l.judul === item.judul || String(l.id) === String(item.id)
      );

      const finalGambar =
        item.gambar && item.gambar.trim() !== ""
          ? item.gambar
          : localMatch?.gambar || undefined;

      return {
        ...item,
        gambar: finalGambar,
      };
    });

    const uniqueLocalItems = localItems.filter(
      (l) => !fetchedItems.some((f) => f.judul === l.judul || String(f.id) === String(l.id))
    );

    return [...uniqueLocalItems, ...fetchedItems].filter(
      (item) => !deletedIds.includes(String(item.id))
    );
  } catch (err) {
    console.error("fetchBeritaList error:", err);
    return localItems.filter((item) => !deletedIds.includes(String(item.id)));
  }
}

export async function fetchBeritaById(id: string | number): Promise<BeritaItem | null> {
  const cleanId = decodeURIComponent(String(id));
  const deletedIds = getDeletedBeritaIds();

  if (deletedIds.includes(cleanId)) {
    return null;
  }

  const list = await fetchBeritaList();

  const found = list.find(
    (item) =>
      String(item.id) === cleanId ||
      String(item.id).toLowerCase() === cleanId.toLowerCase()
  );

  return found || null;
}

export async function createBerita(input: CreateBeritaInput): Promise<{ success: boolean; error?: string }> {
  const newItem: BeritaItem = {
    id: `b-${Date.now()}`,
    ...input,
    created_at: new Date().toISOString(),
  };

  // 1. Save to local storage immediately
  saveLocalBerita(newItem);

  // 2. Insert to Supabase table with smart fallback
  try {
    const fullPayload: any = {
      judul: input.judul,
      konten: input.konten,
      penulis: input.penulis || "Pemerintah Desa Bogem",
      kategori: input.kategori || "Pengumuman Resmi",
      gambar: input.gambar,
      created_at: newItem.created_at,
    };
    if (input.ringkasan) fullPayload.ringkasan = input.ringkasan;

    const { error } = await supabase.from("berita").insert([fullPayload]);
    if (error) {
      console.warn("Supabase insert with full payload failed, retrying with core columns:", error.message);
      // Fallback: insert with core columns only
      await supabase.from("berita").insert([
        {
          judul: input.judul,
          konten: input.konten,
          gambar: input.gambar,
          created_at: newItem.created_at,
        },
      ]);
    }
  } catch (err) {
    console.warn("Supabase insert exception (saved locally):", err);
  }

  return { success: true };
}

export async function updateBerita(
  id: string | number,
  input: Partial<CreateBeritaInput>
): Promise<{ success: boolean; error?: string }> {
  const currentList = getLocalBerita();
  const existing = currentList.find((b) => String(b.id) === String(id));

  const updated: BeritaItem = {
    id,
    judul: input.judul || existing?.judul || "",
    konten: input.konten || existing?.konten || "",
    kategori: input.kategori || existing?.kategori || "Pengumuman Resmi",
    penulis: input.penulis || existing?.penulis || "Pemerintah Desa Bogem",
    ringkasan: input.ringkasan || existing?.ringkasan,
    gambar: input.gambar !== undefined ? input.gambar : existing?.gambar,
    created_at: existing?.created_at || new Date().toISOString(),
  };

  saveLocalBerita(updated);

  try {
    if (typeof id === "number" || (!isNaN(Number(id)) && !String(id).startsWith("local-") && !String(id).startsWith("b-"))) {
      const fullUpdate: any = {
        judul: updated.judul,
        konten: updated.konten,
        penulis: updated.penulis,
        kategori: updated.kategori,
        gambar: updated.gambar,
      };
      if (updated.ringkasan) fullUpdate.ringkasan = updated.ringkasan;

      const { error } = await supabase.from("berita").update(fullUpdate).eq("id", id);
      if (error) {
        // Fallback update with core columns only
        await supabase
          .from("berita")
          .update({
            judul: updated.judul,
            konten: updated.konten,
            gambar: updated.gambar,
          })
          .eq("id", id);
      }
    }
  } catch (err) {
    console.warn("Supabase update warning (saved locally):", err);
  }

  return { success: true };
}

export async function deleteBerita(id: string | number, judul?: string): Promise<{ success: boolean; error?: string }> {
  removeLocalBerita(id, judul);

  try {
    if (typeof id === "number" || (!isNaN(Number(id)) && !String(id).startsWith("local-") && !String(id).startsWith("b-"))) {
      await supabase.from("berita").delete().eq("id", id);
    }
    if (judul) {
      await supabase.from("berita").delete().eq("judul", judul);
    }
  } catch (err) {
    console.warn("Supabase delete warning (removed locally):", err);
  }

  return { success: true };
}
