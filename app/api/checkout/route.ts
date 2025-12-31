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
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const priceId = process.env.STRIPE_PRICE_ID;
    const secretKey = process.env.STRIPE_SECRET_KEY;

    // Check all required environment variables
    const missingVars: string[] = [];
    if (!siteUrl) missingVars.push("NEXT_PUBLIC_SITE_URL");
    if (!priceId) missingVars.push("STRIPE_PRICE_ID");
    if (!secretKey) missingVars.push("STRIPE_SECRET_KEY");

    if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars);
      return Response.json(
        { 
          error: `Missing environment variables: ${missingVars.join(", ")}. Please configure them in Vercel project settings.` 
        },
        { status: 500 }
      );
    }

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

    if (!session.url) {
      return Response.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
    return Response.json(
      { error: `Stripe error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

