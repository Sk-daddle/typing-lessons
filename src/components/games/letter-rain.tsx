"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/audio";

interface Falling {
  ch: string;
  x: number;
  y: number;
  v: number;
  node: HTMLDivElement;
}

export function LetterRain({
  letters,
  onEnd,
}: {
  letters: string[];
  onEnd: (score: number, title: string, note: string) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    let items: Falling[] = [];
    let speed = 34;
    let gap = 1600;
    let last = performance.now();
    let scoreNow = 0;
    let heartsNow = 3;
    let alive = true;
    let raf = 0;
    let spawnTimer: ReturnType<typeof setTimeout> | undefined;

    const floatMsg = (x: number, y: number, text: string) => {
      const m = document.createElement("span");
      m.className = "game-msg";
      m.textContent = text;
      m.style.left = `${x}px`;
      m.style.top = `${y}px`;
      stage.appendChild(m);
      setTimeout(() => m.remove(), 850);
    };

    const spawn = () => {
      const ch = letters[Math.floor(Math.random() * letters.length)];
      const node = document.createElement("div");
      node.className = "fall-letter";
      node.textContent = ch;
      const x = 20 + Math.random() * (W - 86);
      node.style.left = `${x}px`;
      node.style.top = "-50px";
      stage.appendChild(node);
      items.push({ ch, x, y: -50, node, v: speed * (0.8 + Math.random() * 0.5) });
    };

    const spawnLoop = () => {
      if (!alive) return;
      spawn();
      speed = Math.min(110, speed + 1.4);
      gap = Math.max(620, gap - 22);
      spawnTimer = setTimeout(spawnLoop, gap);
    };
    spawnLoop();

    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const L of [...items]) {
        L.y += L.v * dt;
        L.node.style.top = `${L.y}px`;
        if (L.y > H - 56) {
          items = items.filter((x) => x !== L);
          L.node.remove();
          heartsNow--;
          setHearts(heartsNow);
          sfx.lose();
          floatMsg(L.x, H - 80, "splash!");
          if (heartsNow <= 0) {
            alive = false;
            onEnd(scoreNow, "🌧️", "The rain won this time!");
            return;
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      e.preventDefault();
      const k = e.key.toLowerCase();
      const match = items.filter((L) => L.ch === k).sort((a, b) => b.y - a.y)[0];
      if (match) {
        items = items.filter((x) => x !== match);
        match.node.classList.add("zap");
        setTimeout(() => match.node.remove(), 240);
        scoreNow += 10;
        setScore(scoreNow);
        sfx.zap();
        floatMsg(match.x, match.y, "+10");
      } else {
        sfx.err();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      if (spawnTimer) clearTimeout(spawnTimer);
      window.removeEventListener("keydown", onKey);
      items.forEach((L) => L.node.remove());
    };
  }, [letters, onEnd]);

  return (
    <div ref={stageRef} className="game-stage">
      <div className="absolute inset-x-3 top-2.5 z-10 flex items-center justify-between gap-2 font-display font-bold">
        <span className="rounded-full border-2 border-border bg-white/90 px-3.5 py-1 text-sm">
          Score <b className="tabular-nums">{score}</b>
        </span>
        <span className="rounded-full border-2 border-border bg-white/90 px-3.5 py-1 text-sm">
          Type the falling letters!
        </span>
        <span className="rounded-full border-2 border-border bg-white/90 px-3.5 py-1 text-sm tracking-wider">
          {"❤️".repeat(hearts)}
          {"🤍".repeat(Math.max(0, 3 - hearts))}
        </span>
      </div>
    </div>
  );
}
