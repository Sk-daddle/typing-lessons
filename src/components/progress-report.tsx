"use client";

import { Fragment, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_LESSONS, lessonsDone, totalStars, UNITS } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress/provider";

export function ProgressReport() {
  const { ready, active, reset, mode } = useProgress();
  const router = useRouter();

  useEffect(() => {
    if (ready && !active) router.replace("/");
  }, [ready, active, router]);

  if (!ready || !active) return <Skeleton className="mt-6 h-96 w-full rounded-3xl" />;

  const done = lessonsDone(active.progress);
  const bestWpm = active.history.length ? Math.max(...active.history.map((h) => h.wpm)) : 0;
  const recent = active.history.slice(-30);
  const avgAcc = recent.length
    ? Math.round(recent.reduce((a, h) => a + h.acc, 0) / recent.length)
    : 0;
  const spark = active.history.slice(-24);
  const sparkMax = Math.max(...spark.map((h) => h.wpm), 10);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" className="font-display font-bold text-muted-foreground">
          <Link href="/map">
            <ArrowLeft className="size-4" /> Map
          </Link>
        </Button>
        <div className="min-w-52 flex-1">
          <h1 className="font-display text-3xl font-extrabold">Progress report</h1>
          <p className="text-sm text-muted-foreground">
            For grown-ups — how {active.name} is doing
            {mode === "cloud" ? " · ☁️ synced to your account" : " · 💾 saved on this device"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { v: `${done}/${ALL_LESSONS.length}`, l: "lessons done" },
          { v: `${totalStars(active.progress)}`, l: "stars earned" },
          { v: bestWpm ? `${bestWpm}` : "—", l: "best wpm" },
          { v: avgAcc ? `${avgAcc}%` : "—", l: "recent accuracy" },
        ].map((t) => (
          <Card key={t.l} className="gap-0 border-2 border-b-5 px-4 py-3 text-center">
            <div className="font-display text-2xl font-extrabold tabular-nums">{t.v}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{t.l}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-2 border-b-6 p-6">
        <h3 className="font-display text-lg font-bold">Speed over the last attempts</h3>
        {spark.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No attempts yet — the chart fills in as lessons are played.
          </p>
        ) : (
          <div className="spark mt-2">
            {spark.map((h, i) => (
              <i
                key={i}
                className={h.wpm === sparkMax ? "hi" : ""}
                style={{ height: `${Math.max(4, Math.round((h.wpm / sparkMax) * 100))}%` }}
                title={`${h.wpm} wpm`}
              />
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-4 border-2 border-b-6 p-6">
        <h3 className="font-display text-lg font-bold">Lesson by lesson</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Stars</TableHead>
                <TableHead>Best wpm</TableHead>
                <TableHead>Best acc</TableHead>
                <TableHead>Tries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {UNITS.map((u) => (
                <Fragment key={u.id}>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={5} className="font-display font-bold">
                      {u.icon} {u.name}
                    </TableCell>
                  </TableRow>
                  {u.lessons.map((l) => {
                    const r = active.progress[l.id];
                    return (
                      <TableRow key={l.id}>
                        <TableCell>{l.title}</TableCell>
                        <TableCell>{r ? "⭐".repeat(r.stars) || "—" : "—"}</TableCell>
                        <TableCell className="font-mono text-sm tabular-nums">
                          {r ? r.bestWpm : "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm tabular-nums">
                          {r ? `${r.bestAcc}%` : "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm tabular-nums">
                          {r ? r.tries : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="mt-4 border-2 border-b-6 p-6">
        <h3 className="font-display text-lg font-bold">Tips for typing coaches</h3>
        <ul className="mt-1 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            <b>Short and often beats long and rare.</b> Ten minutes a day builds skill faster than
            an hour once a week.
          </li>
          <li>
            <b>Accuracy first, speed second.</b> Speed grows naturally once fingers know the way.
            Aim for 90%+ accuracy before chasing wpm.
          </li>
          <li>
            <b>Watch the posture.</b> Feet flat, wrists floating, screen at eye height, fingers
            curved on the home row bumps (F and J).
          </li>
          <li>
            <b>Games are practice too!</b> The arcade uses the same keys the lessons teach —
            guilt-free play.
          </li>
          <li>
            <b>Ages 6–8:</b> Home Row Harbor and Top Row Trail may be a full year&apos;s journey.
            That&apos;s normal and great.
          </li>
        </ul>
        <div className="mt-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="font-display font-bold text-muted-foreground">
                Reset {active.name}&apos;s progress…
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This erases all of {active.name}&apos;s stars, scores and history. It cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep progress</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    reset(active.id).catch(() => toast.error("Couldn't reset. Try again."))
                  }
                >
                  Yes, reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}
