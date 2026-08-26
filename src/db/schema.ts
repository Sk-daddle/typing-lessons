import {
  pgTable,
  text,
  uuid,
  integer,
  timestamp,
  bigserial,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export const typists = pgTable(
  "typists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    avatar: text("avatar").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("typists_owner_idx").on(t.ownerId)],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    typistId: uuid("typist_id")
      .notNull()
      .references(() => typists.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    stars: integer("stars").notNull().default(0),
    bestWpm: integer("best_wpm").notNull().default(0),
    bestAcc: integer("best_acc").notNull().default(0),
    tries: integer("tries").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.typistId, t.lessonId] })],
);

export const attempts = pgTable(
  "attempts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    typistId: uuid("typist_id")
      .notNull()
      .references(() => typists.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    wpm: integer("wpm").notNull(),
    acc: integer("acc").notNull(),
    stars: integer("stars").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("attempts_typist_idx").on(t.typistId)],
);

export const gameScores = pgTable(
  "game_scores",
  {
    typistId: uuid("typist_id")
      .notNull()
      .references(() => typists.id, { onDelete: "cascade" }),
    gameId: text("game_id").notNull(),
    best: integer("best").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.typistId, t.gameId] })],
);
