import { NextResponse } from "next/server";
import { getPromoCode, markPromoCodeAsUsed, isCodeInEnv } from "@/lib/promo-storage";

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

    // Check if code exists in shared storage
    const codeData = getPromoCode(upperCode);

    if (!codeData) {
      // Code doesn't exist in memory
      // This can happen in serverless environments where memory is not shared
      // Check if code exists in environment variable (PROMO_CODES)
      if (isCodeInEnv(upperCode)) {
        // Code exists in environment variable but not in memory
        // This is a fallback for serverless environments
        console.warn(`Code ${upperCode} found in environment variable but not in memory - serverless issue?`);
        
        // Code is valid (from env var), but we can't track usage without database
        // For now, we'll allow it but log it
        // TODO: Use database to track usage properly
        return NextResponse.json({
          valid: true,
          message: "Code is valid (from environment variable)",
          warning: "Code validated from env var - usage not tracked",
        });
      }
      
      // Code doesn't exist in memory or environment variable
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

    // Mark as used in shared storage
    markPromoCodeAsUsed(upperCode);

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
