"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/audio";

const BALLOON_COLORS = ["#FFD1DC", "#C9E4FF", "#FFE9B8", "#D6F5E3", "#E8DEFF", "#FFDFC9"];
const BALLOON_FACES = ["🐞", "🐤", "🐟", "🌼", "🍓", "⚡"];

interface Floating {
  word: string;
  typed: number;
  x: number;
  y: number;
  v: number;
  node: HTMLDivElement;
  wordEl: HTMLDivElement;
}

export function BalloonPop({
  words,
  onEnd,
}: {
  words: string[];
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
    let balloons: Floating[] = [];
    let target: Floating | null = null;
    let speed = 26;
    let gap = 3000;
    let last = performance.now();
    let scoreNow = 0;
    let heartsNow = 3;
    let alive = true;
    let raf = 0;
    let spawnTimer: ReturnType<typeof setTimeout> | undefined;

    const paintWord = (b: Floating) => {
      b.wordEl.innerHTML = "";
      const did = document.createElement("span");
      did.className = "did";
      did.textContent = b.word.slice(0, b.typed);
      b.wordEl.appendChild(did);
      b.wordEl.appendChild(document.createTextNode(b.word.slice(b.typed)));
    };

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
      const word = words[Math.floor(Math.random() * words.length)];
      if (balloons.some((b) => b.word[0] === word[0])) return; // avoid ambiguous first letters
      const node = document.createElement("div");
      node.className = "balloon";
      const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
      const face = BALLOON_FACES[Math.floor(Math.random() * BALLOON_FACES.length)];
      node.innerHTML = `<div class="body" style="background:${color}">${face}</div><div class="string"></div><div class="word"></div>`;
      const x = 14 + Math.random() * (W - 140);
      node.style.left = `${x}px`;
      node.style.top = `${H}px`;
      stage.appendChild(node);
      const b: Floating = {
        word,
        typed: 0,
        x,
        y: H,
        v: speed * (0.85 + Math.random() * 0.4),
        node,
        wordEl: node.querySelector(".word") as HTMLDivElement,
      };
      paintWord(b);
      balloons.push(b);
    };

    const spawnLoop = () => {
      if (!alive) return;
      spawn();
      speed = Math.min(60, speed + 1.2);
      gap = Math.max(1500, gap - 60);
      spawnTimer = setTimeout(spawnLoop, gap);
    };
    spawnLoop();

    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const b of [...balloons]) {
        b.y -= b.v * dt;
        b.node.style.top = `${b.y}px`;
        if (b.y < -170) {
          balloons = balloons.filter((x) => x !== b);
          if (target === b) target = null;
          b.node.remove();
          heartsNow--;
          setHearts(heartsNow);
          sfx.lose();
          if (heartsNow <= 0) {
            alive = false;
            onEnd(scoreNow, "🎈", "The balloons floated away!");
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
      if (!target) {
        const candidates = balloons.filter((b) => b.word[0] === k).sort((a, b) => a.y - b.y);
        if (candidates.length) {
          target = candidates[0];
          target.node.classList.add("active");
        } else {
          sfx.err();
          return;
        }
      } else if (target.word[target.typed] !== k) {
        sfx.err();
        return;
      }
      target.typed++;
      sfx.tap();
      paintWord(target);
      if (target.typed >= target.word.length) {
        const b = target;
        target = null;
        balloons = balloons.filter((x) => x !== b);
        b.node.classList.add("pop");
        setTimeout(() => b.node.remove(), 260);
        scoreNow += b.word.length * 5;
        setScore(scoreNow);
        sfx.pop();
        floatMsg(b.x + 30, b.y, `+${b.word.length * 5}`);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      if (spawnTimer) clearTimeout(spawnTimer);
      window.removeEventListener("keydown", onKey);
      balloons.forEach((b) => b.node.remove());
    };
  }, [words, onEnd]);

  return (
    <div ref={stageRef} className="game-stage">
      <div className="absolute inset-x-3 top-2.5 z-10 flex items-center justify-between gap-2 font-display font-bold">
        <span className="rounded-full border-2 border-border bg-white/90 px-3.5 py-1 text-sm">
          Score <b className="tabular-nums">{score}</b>
        </span>
        <span className="rounded-full border-2 border-border bg-white/90 px-3.5 py-1 text-sm">
          Type a word to pop its balloon!
        </span>
        <span className="rounded-full border-2 border-border bg-white/90 px-3.5 py-1 text-sm tracking-wider">
          {"❤️".repeat(hearts)}
          {"🤍".repeat(Math.max(0, 3 - hearts))}
        </span>
      </div>
    </div>
  );
}
