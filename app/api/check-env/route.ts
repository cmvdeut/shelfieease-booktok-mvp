import { NextResponse } from "next/server";

/**
 * Debug endpoint to check which environment variables are set.
 * Only shows which vars exist, not their values (for security).
 * This helps diagnose missing environment variables in Vercel.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const requiredVars = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "STRIPE_PRICE_ID",
  ];

  const optionalVars = [
    "STRIPE_WEBHOOK_SECRET",
  ];

  const status: {
    required: Record<string, boolean>;
    optional: Record<string, boolean>;
    allSet: boolean;
  } = {
    required: {},
    optional: {},
    allSet: true,
  };

  // Check required variables
  for (const varName of requiredVars) {
    const isSet = !!process.env[varName];
    status.required[varName] = isSet;
    if (!isSet) {
      status.allSet = false;
    }
  }

  // Check optional variables
  for (const varName of optionalVars) {
    status.optional[varName] = !!process.env[varName];
  }

  return NextResponse.json(status, {
    status: status.allSet ? 200 : 500,
  });
}


