import { NextResponse } from "next/server";
import { fetchProfilDesa, updateProfilDesa } from "@/services/profilService";

export async function GET() {
  try {
    const data = await fetchProfilDesa();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Profil Desa";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await updateProfilDesa(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Profil Desa updated successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update Profil Desa";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
