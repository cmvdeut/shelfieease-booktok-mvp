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

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const priceId = process.env.STRIPE_PRICE_ID!;

  if (!siteUrl || !priceId) {
    return Response.json({ error: "Missing env vars" }, { status: 500 });
  }

  try {
    const stripe = getStripe();
    
    // One-time payment Checkout Session
    const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    // IMPORTANT: session id meegeven in success url
    success_url: `${siteUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/pay/cancel`,
    // Optioneel: customer email laten invullen in Checkout
    billing_address_collection: "auto",
    // metadata is handig voor later
      metadata: { product: "shelfieease_pro" },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

