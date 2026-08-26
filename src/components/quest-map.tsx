"use client";

import { Fragment, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ALL_LESSONS,
  GAMES,
  GRADUATION_LESSON_ID,
  UNITS,
  isLessonUnlocked,
  lessonsDone,
  nextLessonId,
  starsOf,
  type FlatLesson,
} from "@/lib/curriculum";
import { useProgress } from "@/lib/progress/provider";

function nodeLabel(l: FlatLesson): string {
  if (l.newKeys.length && l.newKeys[0].length === 1) {
    return l.newKeys.slice(0, 2).join("").toUpperCase();
  }
  if (l.mode === "timed") return "⏱";
  if (l.mode === "acc") return "🎯";
  if (l.mode === "para") return "📖";
  return "✦";
}

export function QuestMap() {
  const { ready, active } = useProgress();
  const router = useRouter();

  useEffect(() => {
    if (ready && !active) router.replace("/");
  }, [ready, active, router]);

  if (!ready || !active) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-12 w-64" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  const progress = active.progress;
  const done = lessonsDone(progress);
  const nextId = nextLessonId(progress);
  const graduated = starsOf(progress, GRADUATION_LESSON_ID) >= 1;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">
            {active.avatar} {active.name}&apos;s Quest
          </h1>
          <p className="mt-1 text-muted-foreground">
            {done} of {ALL_LESSONS.length} lessons complete.{" "}
            {done === ALL_LESSONS.length ? "You did it all! 🎉" : "Keep going — the summit awaits!"}
          </p>
        </div>
        {graduated && (
          <Button asChild className="border-2 border-b-4 border-sun-deep bg-sun font-display text-base font-bold text-accent-foreground hover:bg-sun/90">
            <Link href="/certificate">🎓 View your certificate</Link>
          </Button>
        )}
      </div>

      {UNITS.map((unit) => {
        const unlocked = unit.lessons.some((l) => isLessonUnlocked(progress, l.id));
        const uStars = unit.lessons.reduce((n, l) => n + starsOf(progress, l.id), 0);
        const game = unit.game ? GAMES[unit.game] : null;
        return (
          <Card
            key={unit.id}
            className={`mt-6 gap-0 border-2 border-b-6 p-6 ${unlocked ? "" : "opacity-60"}`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-b-4 bg-background text-2xl">
                {unit.icon}
              </span>
              <div className="min-w-44 flex-1">
                <h2 className="font-display text-xl font-bold">{unit.name}</h2>
                <p className="text-sm text-muted-foreground">{unit.blurb}</p>
              </div>
              <Badge variant="outline" className="border-2 font-display text-sm font-bold text-muted-foreground">
                ⭐ {uStars}/{unit.lessons.length * 3}
              </Badge>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-5">
              {unit.lessons.map((lesson, i) => {
                const flat = ALL_LESSONS[ALL_LESSONS.findIndex((x) => x.id === lesson.id)];
                const canPlay = isLessonUnlocked(progress, lesson.id);
                const st = starsOf(progress, lesson.id);
                const cls = !canPlay ? "locked" : st > 0 ? "done" : lesson.id === nextId ? "next" : "";
                return (
                  <Fragment key={lesson.id}>
                    {i > 0 && <span className="flow-link">· ·</span>}
                    <button
                      className={`lesson-node ${cls}`}
                      title={lesson.title}
                      disabled={!canPlay}
                      onClick={() => router.push(`/lesson/${lesson.id}`)}
                    >
                      {canPlay ? nodeLabel(flat) : "🔒"}
                      {st > 0 && <span className="stars">{"⭐".repeat(st)}</span>}
                    </button>
                  </Fragment>
                );
              })}
              {game && (
                <>
                  <span className="flow-link">· ·</span>
                  <Link
                    href={`/arcade/${game.id}`}
                    className="keycap h-16 gap-2 rounded-2xl border-berry-deep bg-berry px-5 text-white hover:-translate-y-0.5"
                  >
                    <span>{game.icon}</span> {game.name}
                    {active.scores[game.id] ? (
                      <span className="font-sans text-xs opacity-85">
                        best {active.scores[game.id]}
                      </span>
                    ) : null}
                  </Link>
                </>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
