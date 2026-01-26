import { NextResponse } from "next/server";
import { addPromoCode as addToRedis, getAllPromoCodes as getAllFromRedis, isRedisAvailable } from "@/lib/promo-db";
import { getPromoCodes, addPromoCode as addToMemory, getAllPromoCodes as getAllFromMemory } from "@/lib/promo-storage";

export const runtime = "nodejs"; // Server-side only

function generateUniqueCode(): string {
  // Generate a random code: 8 characters, uppercase alphanumeric
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars: 0, O, I, 1
  let code = "";
  
  // Generate a unique code (we'll check uniqueness in storage)
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

export async function POST(req: Request) {
  try {
    const code = generateUniqueCode();
    const now = new Date().toISOString();

    const codeData = {
      createdAt: now,
      used: false,
    };

    // Try Redis first, fallback to memory
    try {
      if (isRedisAvailable()) {
        await addToRedis(code, codeData);
        console.log(`Code ${code} generated and saved to Redis`);
      } else {
        console.warn("Redis not available, using memory storage");
        addToMemory(code, codeData);
      }

      return NextResponse.json({
        code,
        createdAt: now,
        message: "Code generated successfully",
      });
    } catch (error) {
      console.error("Error saving code:", error);
      // Fallback to memory if Redis fails
      addToMemory(code, codeData);
      return NextResponse.json({
        code,
        createdAt: now,
        message: "Code generated successfully (saved to memory - Redis unavailable)",
        warning: "Redis connection failed, using memory storage",
      });
    }
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
  try {
    let codes: Array<{ code: string; createdAt: string; used: boolean; usedAt?: string }> = [];

    // Try Redis first, fallback to memory
    if (isRedisAvailable()) {
      const redisCodes = await getAllFromRedis();
      codes = redisCodes.map(({ code, data }) => ({
        code,
        ...data,
      }));
    } else {
      const memoryCodes = getAllFromMemory();
      codes = memoryCodes.map(({ code, data }) => ({
        code,
        ...data,
      }));
    }

    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Failed to get promo codes:", error);
    return NextResponse.json({ codes: [] });
  }
}
