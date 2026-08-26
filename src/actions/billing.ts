"use server";

import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { entitlements, inviteCodes } from "@/db/schema";
import { getPlanStatus, PlanStatus } from "@/lib/billing";

export async function getMyPlan(): Promise<PlanStatus> {
  return getPlanStatus();
}

export type RedeemResult =
  | { ok: true }
  | { ok: false; reason: "signed-out" | "already-family" | "invalid" | "used-up" };

export async function redeemInviteCode(rawCode: string): Promise<RedeemResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, reason: "signed-out" };
  const code = String(rawCode).trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,40}$/.test(code)) return { ok: false, reason: "invalid" };

  const status = await getPlanStatus();
  if (status.plan === "family") return { ok: false, reason: "already-family" };

  const db = getDb();
  const found = await db.select().from(inviteCodes).where(eq(inviteCodes.code, code)).limit(1);
  if (found.length === 0) return { ok: false, reason: "invalid" };

  // Atomic consume: only succeeds while uses remain.
  const consumed = await db
    .update(inviteCodes)
    .set({ usedCount: sql`${inviteCodes.usedCount} + 1` })
    .where(sql`${inviteCodes.code} = ${code} and ${inviteCodes.usedCount} < ${inviteCodes.maxUses}`)
    .returning({ code: inviteCodes.code });
  if (consumed.length === 0) return { ok: false, reason: "used-up" };

  await db
    .insert(entitlements)
    .values({ userId, plan: "lifetime", source: "invite", sourceRef: code })
    .onConflictDoNothing();
  return { ok: true };
}
