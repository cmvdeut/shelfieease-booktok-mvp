import Stripe from "stripe";

export const runtime = "nodejs";
// Note: API routes don't work with static export (Cloudflare Pages)
// These routes are for Vercel/server-side deployments only

// Initialize Stripe only if secret key is available (not during build)
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) return Response.json({ paid: false }, { status: 400 });

  try {
    const stripe = getStripe();
    
    // Retrieve session and check payment_status
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === "paid";
    return Response.json({ paid });
  } catch (error) {
    console.error("Stripe verify error:", error);
    return Response.json(
      { paid: false, error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}

