import { NextResponse } from "next/server";
import { fetchBeritaList, createBerita, updateBerita, deleteBerita } from "@/services/beritaService";
import { verifyAdminSession } from "@/lib/auth/serverAuth";

export async function GET() {
  try {
    const list = await fetchBeritaList();
    return NextResponse.json({ success: true, data: list });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Berita";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await verifyAdminSession();
    if (!authCheck.isAdmin) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const result = await createBerita(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Berita successfully created" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create Berita";
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
    const result = await updateBerita(id, body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Berita successfully updated" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update Berita";
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

    const result = await deleteBerita(id);
    return NextResponse.json({ success: result.success });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete Berita";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
