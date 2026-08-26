"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { OnscreenKeyboard } from "@/components/onscreen-keyboard";
import {
  ALL_LESSONS,
  GRADUATION_LESSON_ID,
  LESSON_BY_ID,
  TIMED_POOL,
} from "@/lib/curriculum";
import { keysForChar } from "@/lib/keyboard";
import { computeStars, resultNote, VERDICTS } from "@/lib/stars";
import { sfx } from "@/lib/audio";
import { useProgress } from "@/lib/progress/provider";

const CONFETTI_COLORS = ["#FFC845", "#FF7B6B", "#3EC28F", "#8A6FE8", "#8F9FF3"];

// Deterministic PRNG so text generation stays pure for a given (lesson, attempt).
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLines(lessonId: string, attempt: number): string[] {
  const l = LESSON_BY_ID.get(lessonId)!;
  if (l.mode === "timed") {
    const rand = mulberry32(l.index * 101 + attempt * 7919 + 1);
    const pool = [...TIMED_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const reps: string[] = [];
    while (reps.join(" ").length < 1200) reps.push(pool[reps.length % pool.length]);
    return [reps.join(" ")];
  }
  return l.lines ?? [];
}

interface ResultState {
  wpm: number;
  acc: number;
  stars: number;
}

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const lesson = LESSON_BY_ID.get(lessonId);
  const { ready, active, recordLesson } = useProgress();
  const router = useRouter();

  const [attempt, setAttempt] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [pos, setPos] = useState(0);
  const [errFlash, setErrFlash] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [live, setLive] = useState({ wpm: 0, acc: 100, elapsed: 0 });

  const stats = useRef({ correct: 0, errors: 0, startedAt: 0 });
  const finishedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isTimed = lesson?.mode === "timed";
  const lines = useMemo(
    () => (lesson ? buildLines(lesson.id, attempt) : []),
    [lesson, attempt],
  );

  // Retry: reset everything from the event handler, not an effect.
  const retry = useCallback(() => {
    stats.current = { correct: 0, errors: 0, startedAt: 0 };
    finishedRef.current = false;
    posRef.current = 0;
    lineRef.current = 0;
    setLineIdx(0);
    setPos(0);
    setResult(null);
    setLive({ wpm: 0, acc: 100, elapsed: 0 });
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    if (ready && !active) router.replace("/");
  }, [ready, active, router]);

  const finish = useCallback(() => {
    if (finishedRef.current || !lesson) return;
    finishedRef.current = true;
    const s = stats.current;
    const mins = s.startedAt ? Math.max(0.02, (Date.now() - s.startedAt) / 60000) : 1;
    const wpm = Math.round(s.correct / 5 / mins);
    const att = s.correct + s.errors;
    const acc = att ? Math.round((s.correct / att) * 100) : 100;
    const stars = computeStars(lesson, wpm, acc);
    recordLesson(lesson.id, { wpm, acc, stars });
    sfx.star(stars);
    setResult({ wpm, acc, stars });
  }, [lesson, recordLesson]);

  // Timer tick: recompute live wpm/accuracy and drive the timed countdown.
  useEffect(() => {
    const t = setInterval(() => {
      if (finishedRef.current) return;
      const s = stats.current;
      const elapsed = s.startedAt ? (Date.now() - s.startedAt) / 1000 : 0;
      const mins = elapsed / 60;
      const att = s.correct + s.errors;
      setLive({
        wpm: mins > 0.02 ? Math.round(s.correct / 5 / mins) : 0,
        acc: att ? Math.round((s.correct / att) * 100) : 100,
        elapsed,
      });
      if (isTimed && lesson?.seconds && s.startedAt && elapsed >= lesson.seconds) finish();
    }, 250);
    return () => clearInterval(t);
  }, [isTimed, lesson, finish]);

  // Authoritative engine position lives in refs (state is render-only),
  // so StrictMode double-invoked updaters can't double-count keystrokes.
  const posRef = useRef(0);
  const lineRef = useRef(0);
  const linesRef = useRef<string[]>([]);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  // Keyboard input
  useEffect(() => {
    if (!lesson) return;
    const onKey = (e: KeyboardEvent) => {
      if (finishedRef.current) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Escape") {
        router.push("/map");
        return;
      }
      if (e.key.length !== 1) return;
      e.preventDefault();
      const curLines = linesRef.current;
      const line = curLines[lineRef.current];
      const want = line?.[posRef.current];
      if (want == null) return;
      if (!stats.current.startedAt) stats.current.startedAt = Date.now();
      if (e.key === want) {
        stats.current.correct++;
        sfx.tap();
        if (posRef.current + 1 >= line.length) {
          if (lineRef.current >= curLines.length - 1) {
            finish();
            return;
          }
          sfx.line();
          lineRef.current++;
          posRef.current = 0;
        } else {
          posRef.current++;
        }
        setLineIdx(lineRef.current);
        setPos(posRef.current);
      } else {
        stats.current.errors++;
        sfx.err();
        setErrFlash(true);
        setTimeout(() => setErrFlash(false), 200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lesson, finish, router]);

  const line = lines[lineIdx] ?? "";
  const expected = result ? null : line[pos] ?? null;
  const highlight = useMemo(() => (expected ? keysForChar(expected) : null), [expected]);

  // Scroll current char into view for long paragraphs
  useEffect(() => {
    cardRef.current?.querySelector(".c.cur")?.scrollIntoView({ block: "nearest" });
  }, [pos, lineIdx]);

  if (!lesson) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-2xl font-bold">That lesson doesn&apos;t exist.</p>
        <Button asChild className="mt-4 font-display font-bold">
          <Link href="/map">Back to the map</Link>
        </Button>
      </div>
    );
  }
  if (!ready || !active) {
    return <Skeleton className="mt-6 h-96 w-full rounded-3xl" />;
  }

  const liveWpm = live.wpm;
  const liveAcc = live.acc;
  const totalChars = lines.reduce((n, x) => n + x.length, 0);
  const charsBefore = lines.slice(0, lineIdx).reduce((n, x) => n + x.length, 0);
  const timeLeft =
    isTimed && lesson.seconds ? Math.max(0, lesson.seconds - live.elapsed) : null;
  const progressPct = isTimed
    ? lesson.seconds
      ? (1 - (timeLeft ?? 0) / lesson.seconds) * 100
      : 0
    : totalChars
      ? ((charsBefore + pos) / totalChars) * 100
      : 0;

  const nextLesson = ALL_LESSONS[lesson.index + 1] ?? null;
  const isGraduation = lesson.id === GRADUATION_LESSON_ID;
  const newKeyChips = lesson.newKeys.map((k) =>
    k === "ShiftL" || k === "ShiftR" ? "shift" : k === " " ? "space" : k,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" className="font-display font-bold text-muted-foreground">
          <Link href="/map">
            <ArrowLeft className="size-4" /> Map
          </Link>
        </Button>
        <div className="min-w-52 flex-1">
          <div className="text-sm text-muted-foreground">
            {lesson.unit.icon} {lesson.unit.name}
          </div>
          <h1 className="font-display text-2xl font-extrabold">{lesson.title}</h1>
        </div>
        {lines.length > 1 && (
          <div className="flex gap-1.5">
            {lines.map((_, i) => (
              <span
                key={i}
                className={`h-3 w-3 rounded-full ${
                  i < lineIdx
                    ? "bg-mint"
                    : i === lineIdx
                      ? "bg-sun ring-2 ring-sun-deep"
                      : "bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Card className="mt-4 flex-row items-start gap-3.5 border-2 border-berry/30 bg-berry-soft p-4">
        <span className="text-3xl leading-none" aria-hidden>
          🦉
        </span>
        <p className="flex-1">
          <b className="font-display">Professor Hoot:</b>{" "}
          <span dangerouslySetInnerHTML={{ __html: lesson.tip }} />
          {newKeyChips.length > 0 && (
            <span className="ml-2 inline-flex gap-1.5 align-middle">
              {newKeyChips.map((k, i) => (
                <span
                  key={i}
                  className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border-2 border-b-4 border-sun bg-card px-1.5 font-mono text-sm font-semibold uppercase"
                >
                  {k}
                </span>
              ))}
            </span>
          )}
        </p>
      </Card>

      <Card
        ref={cardRef}
        className={`mt-4 border-2 border-b-6 p-7 ${errFlash ? "shake" : ""} ${isTimed ? "type-card-tall" : ""}`}
      >
        <div className="type-line">
          {(() => {
            let idx = 0;
            const words = line.split(" ");
            return words.map((w, wi) => {
              const wordSpans = (
                <span className="w" key={`w${wi}`}>
                  {[...w].map((ch) => {
                    const i = idx++;
                    return (
                      <span
                        key={i}
                        className={`c ${i < pos ? "ok" : ""} ${i === pos ? "cur" : ""} ${i === pos && errFlash ? "err" : ""}`}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </span>
              );
              const spaceSpan =
                wi < words.length - 1
                  ? (() => {
                      const i = idx++;
                      return (
                        <span
                          key={`s${i}`}
                          className={`c sp ${i < pos ? "ok" : ""} ${i === pos ? "cur" : ""}`}
                        >
                          {" "}
                        </span>
                      );
                    })()
                  : null;
              return [wordSpans, spaceSpan];
            });
          })()}
        </div>
        {!isTimed && lines[lineIdx + 1] && (
          <p className="mt-3 font-mono text-sm text-muted-foreground/75">
            next: {lines[lineIdx + 1]}
          </p>
        )}
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-3.5">
        {timeLeft !== null && (
          <Card className="min-w-24 gap-0 border-2 px-4 py-2 text-center">
            <div className="font-display text-xl font-extrabold tabular-nums text-coral-deep">
              {Math.ceil(timeLeft)}
            </div>
            <div className="text-[0.68rem] uppercase tracking-widest text-muted-foreground">
              seconds
            </div>
          </Card>
        )}
        <Card className="min-w-24 gap-0 border-2 px-4 py-2 text-center">
          <div className="font-display text-xl font-extrabold tabular-nums">{liveWpm}</div>
          <div className="text-[0.68rem] uppercase tracking-widest text-muted-foreground">wpm</div>
        </Card>
        <Card className="min-w-24 gap-0 border-2 px-4 py-2 text-center">
          <div className="font-display text-xl font-extrabold tabular-nums">{liveAcc}</div>
          <div className="text-[0.68rem] uppercase tracking-widest text-muted-foreground">
            % accuracy
          </div>
        </Card>
        <Progress value={progressPct} className="h-3.5 min-w-36 flex-1 border-2 border-border" />
      </div>

      <OnscreenKeyboard highlight={highlight} />

      <Dialog open={result !== null} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md overflow-hidden border-2 border-b-8 text-center [&>button]:hidden"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {result && (
            <div className="pop-in relative">
              {result.stars === 3 &&
                Array.from({ length: 26 }).map((_, i) => (
                  <i
                    key={i}
                    className="confetti"
                    style={{
                      left: `${(i * 37) % 100}%`,
                      background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                      animationDelay: `${(i % 5) * 0.1}s`,
                    }}
                  />
                ))}
              <div className="result-stars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`s ${result.stars >= n ? "on" : ""}`}>
                    ⭐
                  </span>
                ))}
              </div>
              <DialogTitle className="mt-1 font-display text-2xl font-extrabold">
                {VERDICTS[result.stars]}
              </DialogTitle>
              <div className="mt-4 flex justify-center gap-3">
                <Card className="min-w-24 gap-0 border-2 px-4 py-2">
                  <div className="font-display text-xl font-extrabold tabular-nums">{result.wpm}</div>
                  <div className="text-[0.68rem] uppercase tracking-widest text-muted-foreground">
                    wpm
                  </div>
                </Card>
                <Card className="min-w-24 gap-0 border-2 px-4 py-2">
                  <div className="font-display text-xl font-extrabold tabular-nums">{result.acc}</div>
                  <div className="text-[0.68rem] uppercase tracking-widest text-muted-foreground">
                    % accuracy
                  </div>
                </Card>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {resultNote(result.stars, isGraduation)}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                <Button
                  variant="outline"
                  className="border-2 border-b-4 font-display font-bold"
                  onClick={retry}
                >
                  ↻ Try again
                </Button>
                {isGraduation && result.stars >= 1 ? (
                  <Button
                    asChild
                    className="border-2 border-b-4 border-sun-deep bg-sun font-display font-bold text-accent-foreground hover:bg-sun/90"
                  >
                    <Link href="/certificate">🎓 Certificate</Link>
                  </Button>
                ) : (
                  nextLesson &&
                  result.stars >= 1 && (
                    <Button asChild className="border-2 border-b-4 border-coral-deep font-display font-bold">
                      <Link href={`/lesson/${nextLesson.id}`}>Next lesson →</Link>
                    </Button>
                  )
                )}
                <Button asChild variant="ghost" className="font-display font-bold text-muted-foreground">
                  <Link href="/map">Map</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
