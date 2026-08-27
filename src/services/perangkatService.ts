import { supabase } from "@/lib/supabase";
import { PerangkatItem, CreatePerangkatInput } from "@/types/perangkat";

// Clean initial list without hardcoded dummy devices
export const fallbackPerangkatList: PerangkatItem[] = [];

// Helper to get items stored in client-side localStorage
export function getLocalPerangkat(): PerangkatItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("local_perangkat_items");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save item to client-side localStorage without duplicates
export function saveLocalPerangkat(item: PerangkatItem) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalPerangkat();
    const itemKey = `${item.nama.trim().toLowerCase()}_${item.jabatan.trim().toLowerCase()}`;
    
    // Find index by ID or by matching normalized name + jabatan
    const existsIndex = current.findIndex(
      (i) =>
        String(i.id) === String(item.id) ||
        `${i.nama.trim().toLowerCase()}_${i.jabatan.trim().toLowerCase()}` === itemKey
    );

    let updated: PerangkatItem[];
    if (existsIndex >= 0) {
      updated = [...current];
      updated[existsIndex] = { ...current[existsIndex], ...item };
    } else {
      updated = [...current, item];
    }
    localStorage.setItem("local_perangkat_items", JSON.stringify(updated));
    window.dispatchEvent(new Event("local_perangkat_updated"));
  } catch (err) {
    console.error("Failed to save local Perangkat item:", err);
  }
}

// Helper to remove item from client-side localStorage
export function removeLocalPerangkat(id: string | number, nama?: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalPerangkat();
    const updated = current.filter(
      (item) => String(item.id) !== String(id) && (!nama || item.nama.trim().toLowerCase() !== nama.trim().toLowerCase())
    );
    localStorage.setItem("local_perangkat_items", JSON.stringify(updated));
    
    // Also track deleted IDs & names
    const deletedRaw = localStorage.getItem("local_perangkat_deleted_ids");
    const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
    if (!deletedList.includes(String(id))) {
      deletedList.push(String(id));
    }
    if (nama && !deletedList.includes(nama.trim().toLowerCase())) {
      deletedList.push(nama.trim().toLowerCase());
    }
    localStorage.setItem("local_perangkat_deleted_ids", JSON.stringify(deletedList));
    window.dispatchEvent(new Event("local_perangkat_updated"));
  } catch (err) {
    console.error("Failed to remove local Perangkat item:", err);
  }
}

export async function fetchPerangkatList(): Promise<PerangkatItem[]> {
  const localItems = getLocalPerangkat();
  const deletedRaw = typeof window !== "undefined" ? localStorage.getItem("local_perangkat_deleted_ids") : null;
  const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

  const isDeleted = (item: PerangkatItem) => {
    return (
      deletedIds.includes(String(item.id)) ||
      deletedIds.includes(item.nama.trim().toLowerCase())
    );
  };

  try {
    const { data, error } = await supabase
      .from("perangkat_desa")
      .select("*")
      .order("urutan", { ascending: true });

    if (error || !data || data.length === 0) {
      return localItems.filter((item) => !isDeleted(item));
    }

    const filteredDbData = data.filter((item) => !isDeleted(item));

    // Merge Supabase items with local uploads
    const fetchedItems = filteredDbData.map((item) => {
      const localMatch = localItems.find(
        (l) =>
          l.nama.trim().toLowerCase() === item.nama.trim().toLowerCase() ||
          String(l.id) === String(item.id)
      );

      const finalFoto =
        item.foto && item.foto.trim() !== ""
          ? item.foto
          : localMatch?.foto || undefined;

      return {
        ...item,
        foto: finalFoto,
      };
    });

    const uniqueLocalItems = localItems.filter(
      (l) =>
        !isDeleted(l) &&
        !fetchedItems.some(
          (f) =>
            f.nama.trim().toLowerCase() === l.nama.trim().toLowerCase() ||
            String(f.id) === String(l.id)
        )
    );

    return [...uniqueLocalItems, ...fetchedItems];
  } catch (err) {
    console.error("fetchPerangkatList error:", err);
    return localItems.filter((item) => !isDeleted(item));
  }
}

export async function createPerangkat(input: CreatePerangkatInput): Promise<{ success: boolean; error?: string }> {
  const newItem: PerangkatItem = {
    id: `local-perangkat-${Date.now()}`,
    ...input,
    created_at: new Date().toISOString(),
  };

  saveLocalPerangkat(newItem);

  try {
    const { error } = await supabase.from("perangkat_desa").insert([input]);
    if (error) {
      console.warn("Supabase createPerangkat error:", error.message);
    }
  } catch (err) {
    console.warn("Supabase insert exception:", err);
  }

  return { success: true };
}

export async function updatePerangkat(
  id: string | number,
  input: Partial<CreatePerangkatInput>
): Promise<{ success: boolean; error?: string }> {
  const currentList = getLocalPerangkat();
  const existing = currentList.find((p) => String(p.id) === String(id));

  const updated: PerangkatItem = {
    id,
    nama: input.nama || existing?.nama || "",
    jabatan: input.jabatan || existing?.jabatan || "",
    kontak: input.kontak !== undefined ? input.kontak : existing?.kontak,
    urutan: input.urutan !== undefined ? input.urutan : existing?.urutan || 1,
    foto: input.foto !== undefined ? input.foto : existing?.foto,
    created_at: existing?.created_at || new Date().toISOString(),
  };

  saveLocalPerangkat(updated);

  try {
    const isRealDbId = typeof id === "number" || (!String(id).startsWith("local-") && !String(id).startsWith("p-"));
    if (isRealDbId) {
      const { error } = await supabase
        .from("perangkat_desa")
        .update({
          nama: updated.nama,
          jabatan: updated.jabatan,
          kontak: updated.kontak,
          urutan: updated.urutan,
          foto: updated.foto,
        })
        .eq("id", id);

      if (error) {
        console.warn("Supabase updatePerangkat error:", error.message);
      }
    }
  } catch (err) {
    console.warn("Supabase update warning (saved locally):", err);
  }

  return { success: true };
}

export async function deletePerangkat(id: string | number, nama?: string): Promise<{ success: boolean; error?: string }> {
  removeLocalPerangkat(id, nama);

  try {
    const isRealDbId = typeof id === "number" || (!String(id).startsWith("local-") && !String(id).startsWith("p-"));
    if (isRealDbId) {
      await supabase.from("perangkat_desa").delete().eq("id", id);
    }
    if (nama) {
      await supabase.from("perangkat_desa").delete().eq("nama", nama);
    }
  } catch (err) {
    console.warn("Supabase delete warning (removed locally):", err);
  }

  return { success: true };
}
