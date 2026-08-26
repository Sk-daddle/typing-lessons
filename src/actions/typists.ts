"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, gameScores, lessonProgress, typists } from "@/db/schema";
import { LESSON_BY_ID, GAMES, GameId } from "@/lib/curriculum";
import { LessonResult, TypistData, TypistSummary } from "@/lib/progress/types";

async function requireUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

async function requireTypist(typistId: string, userId: string) {
  const db = getDb();
  const rows = await db
    .select({ id: typists.id })
    .from(typists)
    .where(and(eq(typists.id, typistId), eq(typists.ownerId, userId)))
    .limit(1);
  if (rows.length === 0) throw new Error("Typist not found");
}

const clampInt = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(Number(n) || 0)));

export async function listTypists(): Promise<TypistSummary[]> {
  const userId = await requireUser();
  const db = getDb();
  const rows = await db
    .select()
    .from(typists)
    .where(eq(typists.ownerId, userId))
    .orderBy(typists.createdAt);
  if (rows.length === 0) return [];
  const prog = await db
    .select()
    .from(lessonProgress)
    .where(inArray(lessonProgress.typistId, rows.map((r) => r.id)));
  const starMap = new Map<string, number>();
  for (const p of prog) starMap.set(p.typistId, (starMap.get(p.typistId) ?? 0) + p.stars);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    avatar: r.avatar,
    stars: starMap.get(r.id) ?? 0,
  }));
}

export async function getTypist(typistId: string): Promise<TypistData> {
  const userId = await requireUser();
  const db = getDb();
  const rows = await db
    .select()
    .from(typists)
    .where(and(eq(typists.id, typistId), eq(typists.ownerId, userId)))
    .limit(1);
  if (rows.length === 0) throw new Error("Typist not found");
  const t = rows[0];
  const [prog, scores, hist] = await Promise.all([
    db.select().from(lessonProgress).where(eq(lessonProgress.typistId, typistId)),
    db.select().from(gameScores).where(eq(gameScores.typistId, typistId)),
    db
      .select()
      .from(attempts)
      .where(eq(attempts.typistId, typistId))
      .orderBy(desc(attempts.createdAt))
      .limit(100),
  ]);
  return {
    id: t.id,
    name: t.name,
    avatar: t.avatar,
    progress: Object.fromEntries(
      prog.map((p) => [p.lessonId, { stars: p.stars, bestWpm: p.bestWpm, bestAcc: p.bestAcc, tries: p.tries }]),
    ),
    scores: Object.fromEntries(scores.map((s) => [s.gameId, s.best])),
    history: hist
      .reverse()
      .map((h) => ({ d: h.createdAt.getTime(), lessonId: h.lessonId, wpm: h.wpm, acc: h.acc, stars: h.stars })),
  };
}

export async function createTypist(name: string, avatar: string): Promise<TypistSummary> {
  const userId = await requireUser();
  const cleanName = String(name).trim().slice(0, 24) || "Typist";
  const cleanAvatar = String(avatar).slice(0, 8) || "🙂";
  const db = getDb();
  const [row] = await db
    .insert(typists)
    .values({ ownerId: userId, name: cleanName, avatar: cleanAvatar })
    .returning();
  return { id: row.id, name: row.name, avatar: row.avatar, stars: 0 };
}

export async function deleteTypist(typistId: string): Promise<void> {
  const userId = await requireUser();
  const db = getDb();
  await db.delete(typists).where(and(eq(typists.id, typistId), eq(typists.ownerId, userId)));
}

export async function resetTypist(typistId: string): Promise<void> {
  const userId = await requireUser();
  await requireTypist(typistId, userId);
  const db = getDb();
  await Promise.all([
    db.delete(lessonProgress).where(eq(lessonProgress.typistId, typistId)),
    db.delete(gameScores).where(eq(gameScores.typistId, typistId)),
    db.delete(attempts).where(eq(attempts.typistId, typistId)),
  ]);
}

export async function recordLesson(
  typistId: string,
  lessonId: string,
  result: LessonResult,
): Promise<void> {
  const userId = await requireUser();
  if (!LESSON_BY_ID.has(lessonId)) throw new Error("Unknown lesson");
  await requireTypist(typistId, userId);
  const wpm = clampInt(result.wpm, 0, 400);
  const acc = clampInt(result.acc, 0, 100);
  const stars = clampInt(result.stars, 0, 3);
  const db = getDb();
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.typistId, typistId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(lessonProgress).values({
      typistId,
      lessonId,
      stars,
      bestWpm: wpm,
      bestAcc: acc,
      tries: 1,
    });
  } else {
    const e = existing[0];
    await db
      .update(lessonProgress)
      .set({
        stars: Math.max(e.stars, stars),
        bestWpm: Math.max(e.bestWpm, wpm),
        bestAcc: Math.max(e.bestAcc, acc),
        tries: e.tries + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(lessonProgress.typistId, typistId), eq(lessonProgress.lessonId, lessonId)));
  }
  await db.insert(attempts).values({ typistId, lessonId, wpm, acc, stars });
}

export async function recordScore(typistId: string, gameId: string, score: number): Promise<void> {
  const userId = await requireUser();
  if (!(gameId in GAMES)) throw new Error("Unknown game");
  await requireTypist(typistId, userId);
  const clean = clampInt(score, 0, 1000000);
  const db = getDb();
  const existing = await db
    .select()
    .from(gameScores)
    .where(and(eq(gameScores.typistId, typistId), eq(gameScores.gameId, gameId)))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(gameScores).values({ typistId, gameId: gameId as GameId, best: clean });
  } else if (clean > existing[0].best) {
    await db
      .update(gameScores)
      .set({ best: clean, updatedAt: new Date() })
      .where(and(eq(gameScores.typistId, typistId), eq(gameScores.gameId, gameId)));
  }
}

/** One-shot migration of guest (localStorage) typists into the signed-in account. */
export async function importTypists(data: TypistData[]): Promise<void> {
  const userId = await requireUser();
  const db = getDb();
  for (const t of data.slice(0, 12)) {
    const [row] = await db
      .insert(typists)
      .values({
        ownerId: userId,
        name: String(t.name).trim().slice(0, 24) || "Typist",
        avatar: String(t.avatar).slice(0, 8) || "🙂",
      })
      .returning();
    const progressRows = Object.entries(t.progress ?? {})
      .filter(([lessonId]) => LESSON_BY_ID.has(lessonId))
      .map(([lessonId, s]) => ({
        typistId: row.id,
        lessonId,
        stars: clampInt(s.stars, 0, 3),
        bestWpm: clampInt(s.bestWpm, 0, 400),
        bestAcc: clampInt(s.bestAcc, 0, 100),
        tries: clampInt(s.tries, 0, 10000),
      }));
    if (progressRows.length) await db.insert(lessonProgress).values(progressRows);
    const scoreRows = Object.entries(t.scores ?? {})
      .filter(([gameId]) => gameId in GAMES)
      .map(([gameId, best]) => ({
        typistId: row.id,
        gameId,
        best: clampInt(best, 0, 1000000),
      }));
    if (scoreRows.length) await db.insert(gameScores).values(scoreRows);
    const histRows = (t.history ?? [])
      .filter((h) => LESSON_BY_ID.has(h.lessonId))
      .slice(-100)
      .map((h) => ({
        typistId: row.id,
        lessonId: h.lessonId,
        wpm: clampInt(h.wpm, 0, 400),
        acc: clampInt(h.acc, 0, 100),
        stars: clampInt(h.stars, 0, 3),
        createdAt: new Date(h.d || Date.now()),
      }));
    if (histRows.length) await db.insert(attempts).values(histRows);
  }
}
