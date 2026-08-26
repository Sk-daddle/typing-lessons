"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  autoDifficulty,
  Difficulty,
  DIFFICULTY_LABELS,
  GAME_LETTERS,
  GAME_WORDS,
  GAMES,
  GameId,
} from "@/lib/curriculum";
import { sfx } from "@/lib/audio";
import { useProgress } from "@/lib/progress/provider";
import { LetterRain } from "./letter-rain";
import { BalloonPop } from "./balloon-pop";
import { RocketRace } from "./rocket-race";

type Phase = "start" | "playing" | "over";
type DiffSel = Difficulty | "auto";

export function GamePlayer({ gameId }: { gameId: GameId }) {
  const game = GAMES[gameId];
  const { active, recordScore } = useProgress();
  const [phase, setPhase] = useState<Phase>("start");
  const [diffSel, setDiffSel] = useState<DiffSel>("auto");
  const [round, setRound] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [endTitle, setEndTitle] = useState("");
  const [endNote, setEndNote] = useState("");

  const resolved: Difficulty =
    diffSel === "auto" ? (active ? autoDifficulty(active.progress) : "easy") : diffSel;
  const best = active?.scores[gameId] ?? 0;

  const onEnd = useCallback(
    (score: number, title: string, note: string) => {
      setLastScore(score);
      setEndTitle(title);
      setEndNote(note);
      setPhase("over");
      if (active && score > (active.scores[gameId] ?? 0) && score > 0) {
        sfx.win();
        recordScore(gameId, score);
      } else {
        sfx.lose();
        if (active) recordScore(gameId, score);
      }
    },
    [active, gameId, recordScore],
  );

  // Escape backs out of a running round
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhase("start");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const play = () => {
    setRound((r) => r + 1);
    setPhase("playing");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" className="font-display font-bold text-muted-foreground">
          <Link href="/arcade">
            <ArrowLeft className="size-4" /> Arcade
          </Link>
        </Button>
        <div className="min-w-52 flex-1">
          <h1 className="font-display text-2xl font-extrabold">
            {game.icon} {game.name}
          </h1>
          <p className="text-sm text-muted-foreground">{game.how}</p>
        </div>
      </div>

      <div className="relative mt-4">
        {phase === "playing" && gameId === "rain" && (
          <LetterRain key={round} letters={GAME_LETTERS[resolved]} onEnd={onEnd} />
        )}
        {phase === "playing" && gameId === "pop" && (
          <BalloonPop key={round} words={GAME_WORDS[resolved]} onEnd={onEnd} />
        )}
        {phase === "playing" && gameId === "race" && (
          <RocketRace key={round} words={GAME_WORDS[resolved]} difficulty={resolved} onEnd={onEnd} />
        )}

        {phase !== "playing" && (
          <div className="game-stage flex items-center justify-center">
            <Card className="pop-in mx-4 max-w-sm border-2 border-b-8 p-7 text-center">
              {phase === "start" ? (
                <>
                  <div className="text-5xl">{game.icon}</div>
                  <h2 className="font-display text-2xl font-extrabold">{game.name}</h2>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setDiffSel("auto")}
                      className={`keycap rounded-xl px-3 py-1.5 text-sm ${diffSel === "auto" ? "border-berry bg-berry-soft" : ""}`}
                      title="Matches the lessons you've finished"
                    >
                      ✨ Auto
                    </button>
                    {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDiffSel(d)}
                        className={`keycap rounded-xl px-3 py-1.5 text-sm ${diffSel === d ? "border-berry bg-berry-soft" : ""}`}
                        title={DIFFICULTY_LABELS[d].desc}
                      >
                        {DIFFICULTY_LABELS[d].icon} {DIFFICULTY_LABELS[d].name}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {DIFFICULTY_LABELS[resolved].icon} {DIFFICULTY_LABELS[resolved].desc}
                  </p>
                  {active ? (
                    <p className="text-sm text-muted-foreground">Best score: {best}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Playing just for fun —{" "}
                      <Link href="/" className="underline">
                        pick a typist
                      </Link>{" "}
                      to save scores.
                    </p>
                  )}
                  <Button onClick={play} size="lg" className="mx-auto mt-2 border-2 border-b-4 border-coral-deep font-display text-lg font-bold">
                    Play!
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-5xl">{endTitle}</div>
                  <div className="mt-3 flex justify-center gap-3">
                    <Card className="min-w-24 gap-0 border-2 px-4 py-2">
                      <div className="font-display text-xl font-extrabold tabular-nums">{lastScore}</div>
                      <div className="text-[0.68rem] uppercase tracking-widest text-muted-foreground">score</div>
                    </Card>
                    <Card className="min-w-24 gap-0 border-2 px-4 py-2">
                      <div className="font-display text-xl font-extrabold tabular-nums">
                        {Math.max(best, lastScore)}
                      </div>
                      <div className="text-[0.68rem] uppercase tracking-widest text-muted-foreground">best</div>
                    </Card>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {active && lastScore > 0 && lastScore >= best ? "🏆 New record!" : endNote}
                  </p>
                  <div className="mt-2 flex justify-center gap-2.5">
                    <Button onClick={play} className="border-2 border-b-4 border-coral-deep font-display font-bold">
                      ↻ Play again
                    </Button>
                    <Button asChild variant="ghost" className="font-display font-bold text-muted-foreground">
                      <Link href="/arcade">Arcade</Link>
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
