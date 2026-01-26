import { NextResponse } from "next/server";
import { getPromoCode, markPromoCodeAsUsed } from "@/lib/promo-storage";

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
      // Code doesn't exist - invalid
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
