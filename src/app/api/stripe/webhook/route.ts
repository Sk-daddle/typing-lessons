import { createHmac, timingSafeEqual } from "node:crypto";
import { getDb } from "@/db";
import { entitlements } from "@/db/schema";

/** Stripe webhook: grants the lifetime entitlement after a completed checkout. */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("Not configured", { status: 503 });

  const payload = await req.text();
  const sigHeader = req.headers.get("stripe-signature") ?? "";
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => p.split("=") as [string, string]),
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return new Response("Bad signature", { status: 400 });
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response("Bad signature", { status: 400 });
  }
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) {
    return new Response("Stale timestamp", { status: 400 });
  }

  const event = JSON.parse(payload);
  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const userId = session?.client_reference_id;
    if (userId && session?.payment_status === "paid") {
      await getDb()
        .insert(entitlements)
        .values({ userId, plan: "lifetime", source: "stripe", sourceRef: session.id })
        .onConflictDoNothing();
    }
  }
  return new Response("ok", { status: 200 });
}
