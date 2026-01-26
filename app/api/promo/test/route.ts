import { NextResponse } from "next/server";
import { getAllPromoCodes } from "@/lib/promo-db";
import { isRedisAvailable } from "@/lib/promo-db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!isRedisAvailable()) {
      return NextResponse.json({
        error: "Redis not available",
        redisConfigured: false,
      });
    }

    if (code) {
      // Test specific code
      const { getPromoCode } = await import("@/lib/promo-db");
      const codeData = await getPromoCode(code.toUpperCase());
      
      return NextResponse.json({
        code: code.toUpperCase(),
        found: !!codeData,
        data: codeData,
      });
    }

    // List all codes
    const allCodes = await getAllPromoCodes();
    
    return NextResponse.json({
      total: allCodes.length,
      codes: allCodes.map(({ code, data }) => ({
        code,
        createdAt: data.createdAt,
        used: data.used,
      })),
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      { error: "Test failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
