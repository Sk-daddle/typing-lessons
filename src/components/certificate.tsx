"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { totalStars } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress/provider";

export function Certificate() {
  const { ready, active } = useProgress();
  const router = useRouter();

  useEffect(() => {
    if (ready && !active) router.replace("/");
  }, [ready, active, router]);

  if (!ready || !active) return <Skeleton className="mt-6 h-96 w-full rounded-3xl" />;

  const bestWpm = active.history.length ? Math.max(...active.history.map((h) => h.wpm)) : 0;
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="no-print flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" className="font-display font-bold text-muted-foreground">
          <Link href="/map">
            <ArrowLeft className="size-4" /> Map
          </Link>
        </Button>
        <h1 className="flex-1 font-display text-3xl font-extrabold">Certificate</h1>
        <Button onClick={() => window.print()} className="border-2 border-b-4 border-coral-deep font-display font-bold">
          <Printer className="size-4" /> Print
        </Button>
      </div>

      <div className="cert-sheet mt-4 rounded-3xl border-[6px] border-double border-sun bg-[#FFFDF6] px-9 py-11 text-center shadow-lg">
        <div className="text-5xl">🎓</div>
        <h2 className="mt-1 font-display text-3xl font-extrabold">Certificate of Typing Mastery</h2>
        <p className="mt-2 text-muted-foreground">This certifies that</p>
        <div className="my-3 font-display text-4xl font-extrabold text-coral-deep">
          {active.avatar} {active.name}
        </div>
        <p className="text-muted-foreground">
          has completed the full TypeQuest journey —<br />
          every key from A to Z, capitals, numbers and all.
        </p>
        <div className="my-5 flex justify-center gap-7 font-display font-bold">
          <span>⭐ {totalStars(active.progress)} stars</span>
          <span>⚡ {bestWpm} wpm best</span>
        </div>
        <p className="text-muted-foreground">{date}</p>
        <div className="mt-6 text-sm text-muted-foreground">
          <div className="font-display text-lg font-bold text-foreground">🦉 Professor Hoot</div>
          Headmaster, TypeQuest Academy
        </div>
      </div>
    </div>
  );
}
