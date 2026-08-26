/**
 * Generate friends-and-family invite codes.
 *
 *   pnpm dotenv -e .env.local -- pnpm tsx scripts/make-codes.ts [count] [label]
 *
 * Each code grants the lifetime Family plan once (maxUses: 1).
 */
import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { inviteCodes } from "../src/db/schema";

const count = Number(process.argv[2] ?? 10);
const label = process.argv[3] ?? "friends-family";

// Unambiguous alphabet: no 0/O, 1/I/L
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function chunk(len: number): string {
  const bytes = randomBytes(len);
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return s;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const db = drizzle(neon(url));
  const rows = Array.from({ length: count }, () => ({
    code: `TQ-${chunk(4)}-${chunk(4)}`,
    label,
    maxUses: 1,
  }));
  await db.insert(inviteCodes).values(rows);
  console.log(`Created ${count} codes (label: ${label}):\n`);
  rows.forEach((r) => console.log("  " + r.code));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
