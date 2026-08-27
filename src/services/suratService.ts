import { supabase } from "@/lib/supabase";
import {
  PermohonanSurat,
  CreatePermohonanInput,
  StatusSurat,
  OpsiSurat,
  defaultOpsiSuratList,
} from "@/types/surat";

// ==========================================
// 1. PENGELOLAAN OPSI JENIS SURAT & DYNAMIC FIELDS
// ==========================================

export function getLocalOpsiSurat(): OpsiSurat[] {
  if (typeof window === "undefined") return defaultOpsiSuratList;
  try {
    const raw = localStorage.getItem("local_opsi_surat_desa_v2");
    if (!raw) {
      // Migrate or use default
      localStorage.setItem("local_opsi_surat_desa_v2", JSON.stringify(defaultOpsiSuratList));
      return defaultOpsiSuratList;
    }
    const parsed: OpsiSurat[] = JSON.parse(raw);
    return parsed.length > 0 ? parsed : defaultOpsiSuratList;
  } catch {
    return defaultOpsiSuratList;
  }
}

export function saveLocalOpsiSurat(list: OpsiSurat[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("local_opsi_surat_desa_v2", JSON.stringify(list));
    window.dispatchEvent(new Event("local_opsi_surat_updated"));
  } catch (err) {
    console.error("Failed to save local opsi surat:", err);
  }
}

export async function fetchOpsiSuratList(): Promise<OpsiSurat[]> {
  const local = getLocalOpsiSurat();
  try {
    const { data, error } = await supabase
      .from("opsi_surat")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return local;
    }

    // Merge custom_fields if available
    const mapped: OpsiSurat[] = data.map((d: any) => ({
      id: d.id,
      nama_surat: d.nama_surat,
      deskripsi: d.deskripsi || "",
      syarat: d.syarat || "",
      custom_fields: d.custom_fields || local.find((l) => l.id === d.id)?.custom_fields || [],
    }));

    saveLocalOpsiSurat(mapped);
    return mapped;
  } catch {
    return local;
  }
}

export async function saveOpsiSuratList(
  list: OpsiSurat[]
): Promise<{ success: boolean; error?: string }> {
  saveLocalOpsiSurat(list);
  try {
    const payload = list.map((o) => ({
      id: o.id,
      nama_surat: o.nama_surat,
      deskripsi: o.deskripsi,
      syarat: o.syarat,
      custom_fields: o.custom_fields || [],
    }));
    await supabase.from("opsi_surat").upsert(payload);
  } catch (err) {
    console.warn("Supabase saveOpsiSuratList warning:", err);
  }
  return { success: true };
}

// ==========================================
// 2. PENGELOLAAN PERMOHONAN SURAT WARGA
// ==========================================

export function getLocalSuratList(): PermohonanSurat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("local_permohonan_surat_v2");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalSuratItem(item: PermohonanSurat) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalSuratList();
    const idx = current.findIndex((s) => s.id === item.id);
    let updated: PermohonanSurat[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = item;
    } else {
      updated = [item, ...current];
    }
    localStorage.setItem("local_permohonan_surat_v2", JSON.stringify(updated));
    window.dispatchEvent(new Event("local_surat_updated"));
  } catch (err) {
    console.error("Failed to save local surat item:", err);
  }
}

export function removeLocalSuratItem(id: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalSuratList();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem("local_permohonan_surat_v2", JSON.stringify(updated));
    window.dispatchEvent(new Event("local_surat_updated"));
  } catch (err) {
    console.error("Failed to remove local surat item:", err);
  }
}

// Generate unique ticket code: SRT-YYYYMM-XXXX
export function generateTicketCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SRT-${year}${month}-${random}`;
}

export async function fetchSuratList(): Promise<PermohonanSurat[]> {
  const localItems = getLocalSuratList();

  try {
    const { data, error } = await supabase
      .from("permohonan_surat")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return localItems;
    }

    const merged: PermohonanSurat[] = [...data].map((d: any) => ({
      ...d,
      data_formulir: d.data_formulir || {},
    }));

    for (const item of localItems) {
      if (!merged.some((m) => m.id === item.id)) {
        merged.unshift(item);
      }
    }
    return merged;
  } catch (err) {
    console.warn("fetchSuratList warning (using local):", err);
    return localItems;
  }
}

export async function searchSuratByQuery(query: string): Promise<PermohonanSurat[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const list = await fetchSuratList();
  return list.filter(
    (s) =>
      s.id.toLowerCase().includes(clean) ||
      s.nik.includes(clean) ||
      s.nama_lengkap.toLowerCase().includes(clean) ||
      s.no_whatsapp.includes(clean)
  );
}

export async function createPermohonanSurat(
  input: CreatePermohonanInput
): Promise<{ success: boolean; data?: PermohonanSurat; error?: string }> {
  const ticketId = generateTicketCode();
  const now = new Date().toISOString();

  const newSurat: PermohonanSurat = {
    ...input,
    id: ticketId,
    status: "MENUNGGU",
    created_at: now,
    updated_at: now,
  };

  saveLocalSuratItem(newSurat);

  try {
    await supabase.from("permohonan_surat").insert([newSurat]);
  } catch (err) {
    console.warn("Supabase permohonan_surat insert warning:", err);
  }

  return { success: true, data: newSurat };
}

export async function updateStatusDanFileSurat(
  id: string,
  updates: {
    status: StatusSurat;
    file_surat_selesai?: string;
    nama_file_selesai?: string;
    catatan_admin?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const list = getLocalSuratList();
  const target = list.find((s) => s.id === id);

  if (target) {
    target.status = updates.status;
    if (updates.file_surat_selesai !== undefined) {
      target.file_surat_selesai = updates.file_surat_selesai;
    }
    if (updates.nama_file_selesai !== undefined) {
      target.nama_file_selesai = updates.nama_file_selesai;
    }
    if (updates.catatan_admin !== undefined) {
      target.catatan_admin = updates.catatan_admin;
    }
    target.updated_at = new Date().toISOString();
    saveLocalSuratItem(target);
  }

  try {
    await supabase
      .from("permohonan_surat")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  } catch (err) {
    console.warn("Supabase updateStatusDanFileSurat warning:", err);
  }

  return { success: true };
}

export async function deletePermohonanSurat(id: string): Promise<{ success: boolean }> {
  removeLocalSuratItem(id);

  try {
    await supabase.from("permohonan_surat").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase deletePermohonanSurat warning:", err);
  }

  return { success: true };
}
