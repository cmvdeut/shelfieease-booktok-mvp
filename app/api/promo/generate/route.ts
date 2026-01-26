import { NextResponse } from "next/server";
import { getPromoCodes, addPromoCode, getAllPromoCodes } from "@/lib/promo-storage";

export const runtime = "nodejs"; // Server-side only

function generateUniqueCode(): string {
  // Generate a random code: 8 characters, uppercase alphanumeric
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars: 0, O, I, 1
  const promoCodes = getPromoCodes();
  let code = "";
  
  // Generate until we have a unique one
  let attempts = 0;
  do {
    code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    attempts++;
    if (attempts > 100) {
      // Fallback: use timestamp + random
      code = `PRO${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(Math.random() * 1000)}`;
      break;
    }
  } while (promoCodes.has(code.toUpperCase()));

  return code;
}

export async function POST(req: Request) {
  try {
    // Optional: Check for admin authentication header
    // For now, we'll allow generation from authenticated admin page only
    // In production, you might want to add a token check here
    
    const code = generateUniqueCode();
    const now = new Date().toISOString();

    // Store the code in shared storage
    addPromoCode(code, {
      createdAt: now,
      used: false,
    });

    return NextResponse.json({
      code,
      createdAt: now,
      message: "Code generated successfully",
    });
  } catch (error) {
    console.error("Failed to generate promo code:", error);
    return NextResponse.json(
      { error: "Failed to generate code" },
      { status: 500 }
    );
  }
}

// GET endpoint to list all codes (for admin)
export async function GET() {
  const codes = getAllPromoCodes().map(({ code, data }) => ({
    code,
    ...data,
  }));

  return NextResponse.json({ codes });
}
