"use client";

import { useEffect, useRef, useState } from "react";
import { Difficulty } from "@/lib/curriculum";
import { sfx } from "@/lib/audio";

const RACE_LEN = 140; // characters to the finish line
const DURATION = 45;
const ROBO_CPS: Record<Difficulty, number> = { easy: 1.0, medium: 1.6, hard: 2.2 };

export function RocketRace({
  words,
  difficulty,
  onEnd,
}: {
  words: string[];
  difficulty: Difficulty;
  onEnd: (score: number, title: string, note: string) => void;
}) {
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [typedChars, setTypedChars] = useState(0);
  const [roboChars, setRoboChars] = useState(0);
  const [typed, setTyped] = useState(0);
  const [score, setScore] = useState(0);
  const [queue, setQueue] = useState<string[]>(() => {
    const draw = () => words[Math.floor(Math.random() * words.length)];
    return [draw(), draw(), draw()];
  });

  const state = useRef({
    typedChars: 0,
    roboChars: 0,
    typed: 0,
    score: 0,
    time: DURATION,
    done: false,
  });
  const queueRef = useRef(queue);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    const roboCps = ROBO_CPS[difficulty];
    const clock = setInterval(() => {
      const s = state.current;
      if (s.done) return;
      s.roboChars += roboCps;
      s.time -= 1;
      setRoboChars(s.roboChars);
      setTimeLeft(Math.max(0, s.time));
      const meDone = s.typedChars >= RACE_LEN;
      const roboDone = s.roboChars >= RACE_LEN;
      if (meDone || roboDone || s.time <= 0) {
        s.done = true;
        const win = s.typedChars >= s.roboChars;
        onEnd(
          s.score,
          win ? "🏆" : "🛸",
          win ? "You beat Robo-Rocket!" : "Robo-Rocket wins this round — try again!",
        );
      }
    }, 1000);
    return () => clearInterval(clock);
  }, [difficulty, onEnd]);

  useEffect(() => {
    const draw = () => words[Math.floor(Math.random() * words.length)];
    const onKey = (e: KeyboardEvent) => {
      const s = state.current;
      if (s.done) return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      e.preventDefault();
      const w = queueRef.current[0];
      if (!w) return;
      if (e.key.toLowerCase() === w[s.typed]) {
        s.typed++;
        sfx.tap();
        if (s.typed >= w.length) {
          s.typedChars += w.length + 1;
          s.score += w.length;
          s.typed = 0;
          setTypedChars(s.typedChars);
          setScore(s.score);
          setQueue((q) => [...q.slice(1), draw()]);
          sfx.pop();
        }
        setTyped(s.typed);
      } else {
        sfx.err();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [words]);

  const mePct = Math.min(1, typedChars / RACE_LEN);
  const roboPct = Math.min(1, roboChars / RACE_LEN);
  const word = queue[0] ?? "";

  return (
    <div className="game-stage night">
      <div className="absolute inset-x-3 top-2.5 z-10 flex items-center justify-between gap-2 font-display font-bold">
        <span className="rounded-full border-2 border-border bg-white/90 px-3.5 py-1 text-sm">
          Score <b className="tabular-nums">{score}</b>
        </span>
        <span className="rounded-full border-2 border-border bg-white/90 px-3.5 py-1 text-sm">
          ⏱ <b className="tabular-nums">{timeLeft}</b>s
        </span>
      </div>
      <div className="race-lane" style={{ top: 52 }}>
        <div className="road" />
        <span className="racer me" style={{ left: `calc(20px + ${mePct} * (100% - 120px))` }}>
          🚀
        </span>
      </div>
      <div className="race-lane" style={{ top: 150 }}>
        <div className="road" />
        <span className="racer" style={{ left: `calc(20px + ${roboPct} * (100% - 120px))` }}>
          🛸
        </span>
      </div>
      <div className="race-word-zone">
        <div className="race-word">
          <span className="did">{word.slice(0, typed)}</span>
          {word.slice(typed)}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          up next: {queue.slice(1, 3).join("  ·  ")}
        </p>
      </div>
    </div>
  );
}
