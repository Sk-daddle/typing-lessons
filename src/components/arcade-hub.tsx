"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GAMES } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress/provider";

export function ArcadeHub() {
  const { active } = useProgress();
  return (
    <div>
      <div className="text-center">
        <span className="block text-5xl">🕹️</span>
        <h1 className="mt-1 font-display text-4xl font-extrabold">The Arcade</h1>
        <p className="mx-auto mt-2 max-w-md text-balance text-muted-foreground">
          Play any game, any time — no unlocking needed. Every game is secret typing practice.
          Shhh. 🤫
        </p>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {Object.values(GAMES).map((g) => (
          <Link key={g.id} href={`/arcade/${g.id}`} className="group">
            <Card className="h-full gap-2 border-2 border-b-6 p-6 text-center transition-transform group-hover:-translate-y-1">
              <span className="text-5xl">{g.icon}</span>
              <h2 className="font-display text-xl font-bold">{g.name}</h2>
              <p className="text-sm text-muted-foreground">{g.how}</p>
              {active?.scores[g.id] ? (
                <Badge className="mx-auto border-2 border-sun bg-sun-soft font-display font-bold text-accent-foreground">
                  🏆 Best: {active.scores[g.id]}
                </Badge>
              ) : (
                <Badge variant="outline" className="mx-auto border-2 font-display font-bold text-muted-foreground">
                  No score yet
                </Badge>
              )}
            </Card>
          </Link>
        ))}
      </div>
      {!active && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Scores save to a typist —{" "}
          <Link href="/" className="underline">
            pick or create one
          </Link>{" "}
          to start a high-score streak.
        </p>
      )}
    </div>
  );
}
