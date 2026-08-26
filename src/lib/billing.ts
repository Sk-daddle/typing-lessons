import "server-only";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { entitlements, typists } from "@/db/schema";

export type PlanStatus = {
  plan: "guest" | "free" | "family";
  lifetime: boolean;
};

/** Cloud typists allowed on the free signed-in tier. */
export const FREE_TYPIST_LIMIT = 1;

export const CLERK_PLAN_SLUG = "family";

export async function getPlanStatus(): Promise<PlanStatus> {
  const { userId, has } = await auth();
  if (!userId) return { plan: "guest", lifetime: false };
  if (has({ plan: CLERK_PLAN_SLUG })) return { plan: "family", lifetime: false };
  const db = getDb();
  const rows = await db
    .select({ plan: entitlements.plan })
    .from(entitlements)
    .where(eq(entitlements.userId, userId))
    .limit(1);
  if (rows.length > 0) return { plan: "family", lifetime: true };
  return { plan: "free", lifetime: false };
}

/** Throws unless the user may own `wanted` cloud typists in total. */
export async function assertTypistCapacity(userId: string, wanted: number): Promise<void> {
  const status = await getPlanStatus();
  if (status.plan === "family") return;
  const db = getDb();
  const existing = await db
    .select({ id: typists.id })
    .from(typists)
    .where(eq(typists.ownerId, userId));
  if (existing.length + wanted > FREE_TYPIST_LIMIT) {
    throw new Error("FAMILY_PLAN_REQUIRED");
  }
}
