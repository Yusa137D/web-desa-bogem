import { supabase } from "@/lib/supabase";
import { UMKMItem, CreateUMKMInput } from "@/types/umkm";

export const fallbackUMKMList: UMKMItem[] = [];

export async function fetchUMKMList(): Promise<UMKMItem[]> {
  try {
    if (!supabase) return fallbackUMKMList;

    const { data, error } = await supabase
      .from("umkm")
      .select("id, nama_usaha, pemilik, deskripsi, kategori, kontak, alamat, harga, gambar, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchUMKMList error:", error.message);
      return fallbackUMKMList;
    }

    return data || fallbackUMKMList;
  } catch (err) {
    console.error("fetchUMKMList exception:", err);
    return fallbackUMKMList;
  }
}

export async function createUMKM(input: CreateUMKMInput): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const payload = {
      nama_usaha: input.nama_usaha.trim(),
      pemilik: input.pemilik.trim(),
      deskripsi: input.deskripsi.trim(),
      kategori: input.kategori || "Makanan & Minuman",
      kontak: input.kontak?.trim() || null,
      alamat: input.alamat?.trim() || null,
      harga: input.harga?.trim() || null,
      gambar: input.gambar || null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("umkm").insert([payload]);

    if (error) {
      console.error("createUMKM error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menambahkan UMKM.";
    return { success: false, error: msg };
  }
}

export async function updateUMKM(
  id: string | number,
  input: Partial<CreateUMKMInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const payload: Record<string, any> = {};
    if (input.nama_usaha !== undefined) payload.nama_usaha = input.nama_usaha.trim();
    if (input.pemilik !== undefined) payload.pemilik = input.pemilik.trim();
    if (input.deskripsi !== undefined) payload.deskripsi = input.deskripsi.trim();
    if (input.kategori !== undefined) payload.kategori = input.kategori;
    if (input.kontak !== undefined) payload.kontak = input.kontak?.trim() || null;
    if (input.alamat !== undefined) payload.alamat = input.alamat?.trim() || null;
    if (input.harga !== undefined) payload.harga = input.harga?.trim() || null;
    if (input.gambar !== undefined) payload.gambar = input.gambar || null;

    const { error } = await supabase.from("umkm").update(payload).eq("id", id);

    if (error) {
      console.error("updateUMKM error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui data UMKM.";
    return { success: false, error: msg };
  }
}

export async function deleteUMKM(id: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const { error } = await supabase.from("umkm").delete().eq("id", id);

    if (error) {
      console.error("deleteUMKM error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus UMKM.";
    return { success: false, error: msg };
  }
}
