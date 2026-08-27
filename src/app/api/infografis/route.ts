import { NextResponse } from "next/server";
import { fetchInfografisData, updateInfografisData } from "@/services/infografisService";

export async function GET() {
  try {
    const data = await fetchInfografisData();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Infografis data";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await updateInfografisData(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Infografis data successfully updated" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update Infografis data";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
