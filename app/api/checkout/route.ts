// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs"; // belangrijk: Stripe SDK werkt het fijnst op node runtime

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const stripeSecret = requiredEnv("STRIPE_SECRET_KEY");
    const priceId = requiredEnv("STRIPE_PRICE_ID");

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2025-12-15.clover",
    });

    const body = await req.json().catch(() => ({}));
    const origin =
      (body?.origin as string) ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    // Optioneel: je kan metadata doorgeven (bv. userId, deviceId, etc)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // "eenmalige betaling"
      success_url: `${origin}/?paid=1`,
      cancel_url: `${origin}/?canceled=1`,
      // Je kan later webhooks gebruiken voor echte "unlock" verificatie,
      // maar voor MVP kan je success redirect + local unlock doen.
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("[checkout] error", e);
    return NextResponse.json(
      {
        error: "PAYMENT_SETUP_INCOMPLETE",
        message: e?.message || "Payment setup incomplete. Please contact support.",
      },
      { status: 500 }
    );
  }
}
