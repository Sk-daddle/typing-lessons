"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Volume2, VolumeX, BarChart3, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "@/lib/progress/provider";
import { totalStars } from "@/lib/curriculum";

export function Topbar() {
  const { active, muted, toggleMuted } = useProgress();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-2.5">
        <Link
          href={active ? "/map" : "/"}
          className="flex items-center gap-2.5 font-display text-xl font-extrabold"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-b-4 border-sun-deep bg-sun text-base">
            ⌨️
          </span>
          TypeQuest
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="font-display font-bold">
            <Link href="/arcade">
              <Gamepad2 className="size-4" />
              Arcade
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="font-display font-bold">
            <Link href="/pricing">Plans</Link>
          </Button>
          {active && (
            <>
              <Badge className="border-2 border-sun bg-sun-soft font-display text-sm font-bold text-accent-foreground">
                ⭐ {totalStars(active.progress)}
              </Badge>
              <Button asChild variant="ghost" size="icon" title="Progress for grown-ups">
                <Link href="/progress">
                  <BarChart3 className="size-4" />
                </Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMuted}
            title={muted ? "Sound off" : "Sound on"}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Button>
          {active && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-2 border-b-4 font-display font-bold"
              title="Switch typist"
            >
              <Link href="/">
                <span className="text-base">{active.avatar}</span>
                {active.name}
              </Link>
            </Button>
          )}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button size="sm" className="rounded-full font-display font-bold">
                Sign in
              </Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
