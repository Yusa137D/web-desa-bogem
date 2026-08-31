import { supabase } from "@/lib/supabase";
import {
  PermohonanSurat,
  CreatePermohonanInput,
  StatusSurat,
  OpsiSurat,
  defaultOpsiSuratList,
} from "@/types/surat";

// Generate unique ticket code: SRT-YYYYMM-XXXX
export function generateTicketCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SRT-${year}${month}-${random}`;
}

// ==========================================
// 1. PENGELOLAAN OPSI JENIS SURAT
// ==========================================

export async function fetchOpsiSuratList(): Promise<OpsiSurat[]> {
  try {
    if (!supabase) return defaultOpsiSuratList;

    const { data, error } = await supabase
      .from("opsi_surat")
      .select("id, nama_surat, deskripsi, syarat, custom_fields")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return defaultOpsiSuratList;
    }

    return data.map((d: any) => ({
      id: d.id,
      nama_surat: d.nama_surat,
      deskripsi: d.deskripsi || "",
      syarat: d.syarat || "",
      custom_fields: d.custom_fields || [],
    }));
  } catch (err) {
    console.error("fetchOpsiSuratList error:", err);
    return defaultOpsiSuratList;
  }
}

export async function saveOpsiSuratList(
  list: OpsiSurat[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const payload = list.map((o) => ({
      id: o.id,
      nama_surat: o.nama_surat,
      deskripsi: o.deskripsi || "",
      syarat: o.syarat || "",
      custom_fields: o.custom_fields || [],
    }));

    const { error } = await supabase.from("opsi_surat").upsert(payload);

    if (error) {
      console.error("saveOpsiSuratList error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan opsi surat.";
    return { success: false, error: msg };
  }
}

// ==========================================
// 2. PENGELOLAAN PERMOHONAN SURAT WARGA
// ==========================================

/**
 * Fetch ALL surat applications (Admin Dashboard Only)
 */
export async function fetchSuratList(): Promise<PermohonanSurat[]> {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("permohonan_surat")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchSuratList error:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("fetchSuratList exception:", err);
    return [];
  }
}

/**
 * Fetch ONLY surat applications belonging to a specific citizen user (by User ID or NIK)
 */
export async function fetchUserSuratList(userId?: string, nik?: string): Promise<PermohonanSurat[]> {
  try {
    if (!supabase) return [];
    if (!userId && !nik) return [];

    let query = supabase
      .from("permohonan_surat")
      .select("*")
      .order("created_at", { ascending: false });

    const cleanNik = nik?.trim();

    if (userId && cleanNik) {
      query = query.or(`user_id.eq.${userId},nik.eq.${cleanNik}`);
    } else if (userId) {
      query = query.eq("user_id", userId);
    } else if (cleanNik) {
      query = query.eq("nik", cleanNik);
    }

    const { data, error } = await query;

    if (error) {
      console.error("fetchUserSuratList error:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("fetchUserSuratList exception:", err);
    return [];
  }
}

/**
 * Track a specific surat by Ticket ID (and optional NIK validation for citizen security)
 */
export async function searchSuratByTicket(ticketId: string, nik?: string): Promise<PermohonanSurat | null> {
  try {
    if (!supabase) return null;

    let query = supabase
      .from("permohonan_surat")
      .select("id, jenis_surat, nama_lengkap, status, catatan_admin, file_surat_selesai, nama_file_selesai, created_at, updated_at")
      .eq("id", ticketId.trim());

    if (nik) {
      query = query.eq("nik", nik.trim());
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("searchSuratByTicket error:", error.message);
      return null;
    }

    return (data as PermohonanSurat) || null;
  } catch (err) {
    console.error("searchSuratByTicket exception:", err);
    return null;
  }
}

export async function createPermohonanSurat(
  input: CreatePermohonanInput
): Promise<{ success: boolean; data?: PermohonanSurat; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const ticketId = generateTicketCode();
    const now = new Date().toISOString();

    const newSurat: PermohonanSurat = {
      id: ticketId,
      user_id: input.user_id || undefined,
      opsi_surat_id: input.opsi_surat_id || undefined,
      nik: input.nik.trim(),
      nama_lengkap: input.nama_lengkap.trim(),
      no_whatsapp: input.no_whatsapp.trim(),
      email: input.email?.trim() || undefined,
      jenis_surat: input.jenis_surat,
      data_formulir: input.data_formulir || {},
      status: "MENUNGGU",
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabase.from("permohonan_surat").insert([newSurat]);

    if (error) {
      console.error("createPermohonanSurat error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: newSurat };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengajukan permohonan surat.";
    return { success: false, error: msg };
  }
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
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const payload: Record<string, any> = {
      status: updates.status,
      updated_at: new Date().toISOString(),
    };

    if (updates.file_surat_selesai !== undefined) payload.file_surat_selesai = updates.file_surat_selesai;
    if (updates.nama_file_selesai !== undefined) payload.nama_file_selesai = updates.nama_file_selesai;
    if (updates.catatan_admin !== undefined) payload.catatan_admin = updates.catatan_admin;

    const { error } = await supabase
      .from("permohonan_surat")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("updateStatusDanFileSurat error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui permohonan surat.";
    return { success: false, error: msg };
  }
}

export async function deletePermohonanSurat(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Database client is not available." };

    const { error } = await supabase.from("permohonan_surat").delete().eq("id", id);

    if (error) {
      console.error("deletePermohonanSurat error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus permohonan surat.";
    return { success: false, error: msg };
  }
}
