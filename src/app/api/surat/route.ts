import { NextResponse } from "next/server";
import {
  fetchOpsiSuratList,
  fetchSuratList,
  createPermohonanSurat,
  updateStatusDanFileSurat,
  deletePermohonanSurat,
} from "@/services/suratService";
import { verifyAdminSession } from "@/lib/auth/serverAuth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Public options list
    if (type === "opsi") {
      const opsi = await fetchOpsiSuratList();
      return NextResponse.json({ success: true, data: opsi });
    }

    // Fetching all citizen applications requires Admin session
    const authCheck = await verifyAdminSession();
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Data permohonan surat hanya dapat diakses oleh admin desa." },
        { status: 403 }
      );
    }

    const suratList = await fetchSuratList();
    return NextResponse.json({ success: true, data: suratList });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Surat data";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createPermohonanSurat(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data, message: "Permohonan surat berhasil diajukan" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to submit permohonan surat";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authCheck = await verifyAdminSession();
    if (!authCheck.isAdmin) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
    }

    const body = await request.json();
    const result = await updateStatusDanFileSurat(id, {
      status: body.status,
      catatan_admin: body.catatan_admin || body.catatanAdmin,
      file_surat_selesai: body.file_surat_selesai || body.fileSuratSelesai,
      nama_file_selesai: body.nama_file_selesai || body.namaFileSelesai,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Status surat berhasil diperbarui" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update surat status";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authCheck = await verifyAdminSession();
    if (!authCheck.isAdmin) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
    }

    const result = await deletePermohonanSurat(id);
    return NextResponse.json({ success: result.success });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete permohonan surat";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
