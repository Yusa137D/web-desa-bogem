import { supabase } from "@/lib/supabase";
import { UMKMItem, CreateUMKMInput } from "@/types/umkm";

// Clean initial list without hardcoded dummy products
export const fallbackUMKMList: UMKMItem[] = [];

// Helper to track permanently deleted UMKM IDs
export function getDeletedUMKMIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("deleted_umkm_ids");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedUMKMId(id: string | number) {
  if (typeof window === "undefined") return;
  try {
    const deleted = getDeletedUMKMIds();
    const strId = String(id);
    if (!deleted.includes(strId)) {
      localStorage.setItem("deleted_umkm_ids", JSON.stringify([...deleted, strId]));
    }
  } catch (err) {
    console.error("Failed to add deleted UMKM id:", err);
  }
}

// Helper to get items stored in client-side localStorage
export function getLocalUMKM(): UMKMItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("local_umkm_items");
    if (!raw) return [];
    const items: UMKMItem[] = JSON.parse(raw);
    const deletedIds = getDeletedUMKMIds();
    return items.filter((item) => !deletedIds.includes(String(item.id)));
  } catch {
    return [];
  }
}

// Helper to save item to client-side localStorage
export function saveLocalUMKM(item: UMKMItem) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalUMKM();
    const updated = [item, ...current.filter((i) => String(i.id) !== String(item.id))];
    localStorage.setItem("local_umkm_items", JSON.stringify(updated));
    window.dispatchEvent(new Event("local_umkm_updated"));
  } catch (err) {
    console.error("Failed to save local UMKM item:", err);
  }
}

// Helper to remove item from client-side localStorage
export function removeLocalUMKM(id: string | number, nama_usaha?: string) {
  if (typeof window === "undefined") return;
  try {
    addDeletedUMKMId(id);
    const current = getLocalUMKM();
    const updated = current.filter(
      (item) =>
        String(item.id) !== String(id) &&
        (!nama_usaha || item.nama_usaha.toLowerCase() !== nama_usaha.toLowerCase())
    );
    localStorage.setItem("local_umkm_items", JSON.stringify(updated));
    window.dispatchEvent(new Event("local_umkm_updated"));
  } catch (err) {
    console.error("Failed to remove local UMKM item:", err);
  }
}

export async function fetchUMKMList(): Promise<UMKMItem[]> {
  const localItems = getLocalUMKM();
  const deletedIds = getDeletedUMKMIds();

  try {
    const { data, error } = await supabase
      .from("umkm")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return localItems.filter((item) => !deletedIds.includes(String(item.id)));
    }

    const filteredDbData = data.filter(
      (item) => !deletedIds.includes(String(item.id))
    );

    // Merge Supabase items with uploaded local images & addresses
    const fetchedItems = filteredDbData.map((item) => {
      const localMatch = localItems.find(
        (l) => l.nama_usaha === item.nama_usaha || String(l.id) === String(item.id)
      );

      const finalGambar =
        item.gambar && item.gambar.trim() !== ""
          ? item.gambar
          : localMatch?.gambar || undefined;

      const finalAlamat =
        item.alamat && item.alamat.trim() !== ""
          ? item.alamat
          : localMatch?.alamat || undefined;

      return {
        ...item,
        alamat: finalAlamat,
        gambar: finalGambar,
      };
    });

    const uniqueLocalItems = localItems.filter(
      (l) => !fetchedItems.some((f) => f.nama_usaha === l.nama_usaha || String(f.id) === String(l.id))
    );

    return [...uniqueLocalItems, ...fetchedItems].filter(
      (item) => !deletedIds.includes(String(item.id))
    );
  } catch (err) {
    console.error("fetchUMKMList error:", err);
    return localItems.filter((item) => !deletedIds.includes(String(item.id)));
  }
}

export async function createUMKM(input: CreateUMKMInput): Promise<{ success: boolean; error?: string }> {
  const newItem: UMKMItem = {
    id: `local-umkm-${Date.now()}`,
    ...input,
    created_at: new Date().toISOString(),
  };

  saveLocalUMKM(newItem);

  try {
    const { error } = await supabase.from("umkm").insert([input]);
    if (error) {
      console.warn("Supabase insert with alamat failed, retrying without alamat:", error.message);
      const { alamat, ...inputWithoutAlamat } = input;
      await supabase.from("umkm").insert([inputWithoutAlamat]);
    }
  } catch (err) {
    console.warn("Supabase insert warning (saved locally):", err);
  }

  return { success: true };
}

export async function updateUMKM(
  id: string | number,
  input: Partial<CreateUMKMInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = getLocalUMKM();
    const updated = current.map((item) => {
      if (String(item.id) === String(id)) {
        return {
          ...item,
          ...input,
        };
      }
      return item;
    });

    localStorage.setItem("local_umkm_items", JSON.stringify(updated));

    const isRealDbId = typeof id === "number" || (!String(id).startsWith("local-") && !String(id).startsWith("demo-"));

    const payload: any = {
      nama_usaha: input.nama_usaha,
      pemilik: input.pemilik,
      deskripsi: input.deskripsi,
      kategori: input.kategori,
      kontak: input.kontak,
      alamat: input.alamat !== undefined ? input.alamat : null,
      harga: input.harga,
    };
    if (input.gambar !== undefined) {
      payload.gambar = input.gambar;
    }

    if (isRealDbId) {
      const { error } = await supabase.from("umkm").update(payload).eq("id", id);
      if (error) {
        console.warn("Supabase updateUMKM by id error, retrying without alamat:", error.message);
        const { alamat, ...payloadWithoutAlamat } = payload;
        await supabase.from("umkm").update(payloadWithoutAlamat).eq("id", id);
      }
    } else if (input.nama_usaha) {
      const { error } = await supabase.from("umkm").update(payload).eq("nama_usaha", input.nama_usaha);
      if (error) {
        const { alamat, ...payloadWithoutAlamat } = payload;
        await supabase.from("umkm").update(payloadWithoutAlamat).eq("nama_usaha", input.nama_usaha);
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("local_umkm_updated"));
    }

    return { success: true };
  } catch (err) {
    console.error("updateUMKM error:", err);
    return { success: false, error: "Gagal memperbarui data UMKM." };
  }
}

export async function deleteUMKM(id: string | number, nama_usaha?: string): Promise<{ success: boolean; error?: string }> {
  removeLocalUMKM(id, nama_usaha);

  try {
    if (typeof id === "number" || (!isNaN(Number(id)) && !String(id).startsWith("local-") && !String(id).startsWith("demo-"))) {
      await supabase.from("umkm").delete().eq("id", id);
    }
    if (nama_usaha) {
      await supabase.from("umkm").delete().eq("nama_usaha", nama_usaha);
    }
  } catch (err) {
    console.warn("Supabase delete warning (removed locally):", err);
  }

  return { success: true };
}
