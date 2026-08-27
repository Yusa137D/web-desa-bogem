import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/utils/constants";

export async function GET() {
  return NextResponse.json({
    status: "online",
    app: APP_CONFIG.name,
    subTitle: APP_CONFIG.subTitle,
    timestamp: new Date().toISOString(),
  });
}
