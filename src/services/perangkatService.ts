import { supabase } from "@/lib/supabase";
import { PerangkatItem, CreatePerangkatInput } from "@/types/perangkat";

export const fallbackPerangkatList: PerangkatItem[] = [];

export async function fetchPerangkatList(): Promise<PerangkatItem[]> {
  try {
    if (!supabase) return fallbackPerangkatList;

    const { data, error } = await supabase
      .from("perangkat_desa")
      .select("id, nama, jabatan, foto, kontak, urutan, created_at")
      .order("urutan", { ascending: true });

    if (error) {
      console.error("fetchPerangkatList error:", error.message);
      return fallbackPerangkatList;
    }

    return data || fallbackPerangkatList;
  } catch (err) {
    console.error("fetchPerangkatList exception:", err);
    return fallbackPerangkatList;
  }
}

export async function createPerangkat(input: CreatePerangkatInput): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const payload = {
      nama: input.nama.trim(),
      jabatan: input.jabatan.trim(),
      foto: input.foto || null,
      kontak: input.kontak?.trim() || null,
      urutan: Number(input.urutan) || 1,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("perangkat_desa").insert([payload]);

    if (error) {
      console.error("createPerangkat error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menambahkan perangkat desa.";
    return { success: false, error: msg };
  }
}

export async function updatePerangkat(
  id: string | number,
  input: Partial<CreatePerangkatInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const payload: Record<string, any> = {};
    if (input.nama !== undefined) payload.nama = input.nama.trim();
    if (input.jabatan !== undefined) payload.jabatan = input.jabatan.trim();
    if (input.foto !== undefined) payload.foto = input.foto || null;
    if (input.kontak !== undefined) payload.kontak = input.kontak?.trim() || null;
    if (input.urutan !== undefined) payload.urutan = Number(input.urutan) || 1;

    const { error } = await supabase.from("perangkat_desa").update(payload).eq("id", id);

    if (error) {
      console.error("updatePerangkat error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui perangkat desa.";
    return { success: false, error: msg };
  }
}

export async function deletePerangkat(id: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const { error } = await supabase.from("perangkat_desa").delete().eq("id", id);

    if (error) {
      console.error("deletePerangkat error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus perangkat desa.";
    return { success: false, error: msg };
  }
}
