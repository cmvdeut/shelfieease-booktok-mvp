// Promo code database using Upstash Redis
// Free tier: 10,000 requests/day - perfect for promo codes

import { Redis } from "@upstash/redis";

// Initialize Redis client
// Will use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from environment
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

interface PromoCodeData {
  createdAt: string;
  used: boolean;
  usedAt?: string;
}

const CODE_PREFIX = "promo:code:";
const USED_PREFIX = "promo:used:";

// Check if Redis is available
export function isRedisAvailable(): boolean {
  return redis !== null;
}

// Add a promo code
export async function addPromoCode(code: string, data: PromoCodeData): Promise<void> {
  if (!redis) {
    console.warn("Redis not available, falling back to memory storage");
    throw new Error("Redis not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN");
  }

  try {
    const key = `${CODE_PREFIX}${code.toUpperCase()}`;
    // Upstash Redis automatically serializes objects
    await redis.set(key, data);
    console.log(`Promo code ${code.toUpperCase()} saved to Redis`);
  } catch (error) {
    console.error("Failed to add promo code to Redis:", error);
    throw error;
  }
}

// Get a promo code
export async function getPromoCode(code: string): Promise<PromoCodeData | null> {
  if (!redis) {
    console.warn("Redis not available in getPromoCode");
    return null;
  }

  try {
    const upperCode = code.toUpperCase().trim();
    const key = `${CODE_PREFIX}${upperCode}`;
    console.log(`Looking up Redis key: ${key}`);
    
    // Upstash Redis returns the parsed object directly, not a string
    const data = await redis.get<PromoCodeData>(key);
    
    if (!data) {
      console.log(`Code ${upperCode} not found in Redis`);
      return null;
    }

    console.log(`Code ${upperCode} found in Redis:`, data);
    return data;
  } catch (error) {
    console.error("Failed to get promo code from Redis:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return null;
  }
}

// Mark code as used
export async function markPromoCodeAsUsed(code: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    const codeKey = `${CODE_PREFIX}${code.toUpperCase()}`;
    const usedKey = `${USED_PREFIX}${code.toUpperCase()}`;
    
    // Get current data
    const data = await redis.get<PromoCodeData>(codeKey);
    if (data) {
      data.used = true;
      data.usedAt = new Date().toISOString();
      
      // Update code data (Upstash automatically serializes)
      await redis.set(codeKey, data);
    }
    
    // Also mark as used in separate key for quick lookup
    await redis.set(usedKey, "1");
  } catch (error) {
    console.error("Failed to mark promo code as used in Redis:", error);
  }
}

// Check if code is used
export async function isCodeUsed(code: string): Promise<boolean> {
  if (!redis) {
    return false;
  }

  try {
    const usedKey = `${USED_PREFIX}${code.toUpperCase()}`;
    const used = await redis.get<string>(usedKey);
    return used === "1";
  } catch (error) {
    console.error("Failed to check if code is used in Redis:", error);
    return false;
  }
}

// Get all promo codes (for admin)
export async function getAllPromoCodes(): Promise<Array<{ code: string; data: PromoCodeData }>> {
  if (!redis) {
    return [];
  }

  try {
    // Get all keys with CODE_PREFIX
    const keys = await redis.keys(`${CODE_PREFIX}*`);
    
    if (!keys || keys.length === 0) {
      return [];
    }

    // Get all codes
    const codes = await Promise.all(
      keys.map(async (key) => {
        const code = key.replace(CODE_PREFIX, "");
        // Upstash Redis returns parsed object directly
        const data = await redis.get<PromoCodeData>(key);
        if (data) {
          return {
            code,
            data,
          };
        }
        return null;
      })
    );

    return codes.filter((c): c is { code: string; data: PromoCodeData } => c !== null);
  } catch (error) {
    console.error("Failed to get all promo codes from Redis:", error);
    return [];
  }
}
