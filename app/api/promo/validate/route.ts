import { NextResponse } from "next/server";
import { getPromoCode as getFromRedis, markPromoCodeAsUsed as markUsedInRedis, isRedisAvailable } from "@/lib/promo-db";
import { getPromoCode as getFromMemory, markPromoCodeAsUsed as markUsedInMemory, isCodeInEnv } from "@/lib/promo-storage";

export const runtime = "nodejs"; // Server-side only

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Code is required" },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();

    // Try Redis first, fallback to memory
    let codeData;
    if (isRedisAvailable()) {
      codeData = await getFromRedis(upperCode);
    } else {
      codeData = getFromMemory(upperCode);
    }

    // If not found in Redis/memory, check environment variable (legacy fallback)
    if (!codeData) {
      if (isCodeInEnv(upperCode)) {
        // Code exists in environment variable but not in storage
        console.warn(`Code ${upperCode} found in environment variable but not in storage`);
        return NextResponse.json({
          valid: true,
          message: "Code is valid (from environment variable)",
          warning: "Code validated from env var - usage not tracked",
        });
      }
      
      // Code doesn't exist anywhere
      return NextResponse.json(
        { valid: false, error: "Invalid code" },
        { status: 404 }
      );
    }

    // Check if already used
    if (codeData.used) {
      return NextResponse.json(
        { valid: false, error: "Code has already been used" },
        { status: 400 }
      );
    }

    // Mark as used
    if (isRedisAvailable()) {
      await markUsedInRedis(upperCode);
    } else {
      markUsedInMemory(upperCode);
    }

    return NextResponse.json({
      valid: true,
      message: "Code is valid",
    });
  } catch (error) {
    console.error("Failed to validate promo code:", error);
    return NextResponse.json(
      { valid: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}
