import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

/**
 * Creates a Stripe Checkout session for the one-time lifetime purchase.
 * Inactive (503) until STRIPE_SECRET_KEY and STRIPE_LIFETIME_PRICE_ID are set.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Sign in first" }, { status: 401 });

  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_LIFETIME_PRICE_ID;
  if (!key || !price) {
    return Response.json({ error: "Lifetime purchase not configured yet" }, { status: 503 });
  }

  const origin = req.nextUrl.origin;
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    client_reference_id: userId,
    success_url: `${origin}/pricing?lifetime=success`,
    cancel_url: `${origin}/pricing`,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const session = await res.json();
  if (!res.ok || !session.url) {
    console.error("Stripe checkout error", session?.error?.message);
    return Response.json({ error: "Couldn't start checkout" }, { status: 502 });
  }
  return Response.json({ url: session.url });
}
