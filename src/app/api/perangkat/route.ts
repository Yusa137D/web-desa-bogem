import { NextResponse } from "next/server";
import { fetchPerangkatList, createPerangkat, updatePerangkat, deletePerangkat } from "@/services/perangkatService";

export async function GET() {
  try {
    const list = await fetchPerangkatList();
    return NextResponse.json({ success: true, data: list });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Perangkat";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createPerangkat(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Perangkat successfully created" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create Perangkat";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
    }
    const body = await request.json();
    const result = await updatePerangkat(id, body);
    return NextResponse.json({ success: result.success });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update Perangkat";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const nama = searchParams.get("nama");

    if (!id && !nama) {
      return NextResponse.json({ success: false, error: "Missing id or nama" }, { status: 400 });
    }

    const result = await deletePerangkat(id || "", nama || undefined);
    return NextResponse.json({ success: result.success });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete Perangkat";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
