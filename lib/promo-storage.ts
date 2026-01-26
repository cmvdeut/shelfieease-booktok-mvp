// Shared storage for promo codes across API routes
// In production, replace this with a database

interface PromoCodeData {
  createdAt: string;
  used: boolean;
  usedAt?: string;
}

// Global Map to store codes (shared across all API routes)
const promoCodes: Map<string, PromoCodeData> = new Map();

// Load codes from environment variable on initialization
function loadCodesFromEnv() {
  const envCodes = process.env.PROMO_CODES;
  if (envCodes) {
    const codes = envCodes.split(",");
    codes.forEach((code) => {
      if (code.trim()) {
        promoCodes.set(code.trim().toUpperCase(), {
          createdAt: new Date().toISOString(),
          used: false,
        });
      }
    });
  }
}

// Initialize on first import
let initialized = false;
if (!initialized) {
  loadCodesFromEnv();
  initialized = true;
}

export function getPromoCodes(): Map<string, PromoCodeData> {
  return promoCodes;
}

export function addPromoCode(code: string, data: PromoCodeData): void {
  promoCodes.set(code.toUpperCase(), data);
}

export function getPromoCode(code: string): PromoCodeData | undefined {
  return promoCodes.get(code.toUpperCase());
}

export function markPromoCodeAsUsed(code: string): void {
  const codeData = promoCodes.get(code.toUpperCase());
  if (codeData) {
    codeData.used = true;
    codeData.usedAt = new Date().toISOString();
  }
}

export function getAllPromoCodes(): Array<{ code: string; data: PromoCodeData }> {
  return Array.from(promoCodes.entries()).map(([code, data]) => ({
    code,
    data,
  }));
}

// Check if code exists in environment variable (for serverless fallback)
export function isCodeInEnv(code: string): boolean {
  const envCodes = process.env.PROMO_CODES;
  if (!envCodes) return false;
  
  const codes = envCodes.split(",").map(c => c.trim().toUpperCase());
  return codes.includes(code.toUpperCase());
}
