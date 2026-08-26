"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Show, SignInButton } from "@clerk/nextjs";
import { CloudUpload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AVATARS } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress/provider";

export function TypistPicker() {
  const { ready, typists, select, create, remove, hasLocalData, migrateLocal } = useProgress();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [busy, setBusy] = useState(false);

  const upgradeToast = () =>
    toast.error("The free plan includes one cloud typist.", {
      description: "The Family plan adds unlimited typists for the whole crew.",
      action: { label: "See plans", onClick: () => router.push("/pricing") },
    });

  const startQuest = async () => {
    setBusy(true);
    try {
      await create(name, avatar);
      setOpen(false);
      router.push("/map");
    } catch (e) {
      if (e instanceof Error && e.message === "FAMILY_PLAN_REQUIRED") upgradeToast();
      else toast.error("Couldn't create that typist. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const pick = async (id: string) => {
    try {
      await select(id);
      router.push("/map");
    } catch {
      toast.error("Couldn't load that typist. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mt-8 text-center">
        <span className="block text-6xl">🦉</span>
        <h1 className="mt-2 font-display text-5xl font-extrabold">TypeQuest</h1>
        <p className="mx-auto mt-3 max-w-md text-balance text-muted-foreground">
          A typing adventure for home learners. Professor Hoot will guide your fingers from the
          Home Row Harbor all the way to Story Summit — with games along the way!
        </p>
      </div>

      <div className="mt-6">
        <Show when="signed-out">
          <Card className="flex-row items-center gap-3 border-2 px-4 py-3">
            <span className="text-xl">💾</span>
            <p className="text-sm text-muted-foreground">
              Playing as a guest — progress stays on this device only.
            </p>
            <SignInButton mode="modal">
              <Button size="sm" variant="secondary" className="font-display font-bold">
                Sign in to sync
              </Button>
            </SignInButton>
          </Card>
        </Show>
        <Show when="signed-in">
          <Card className="flex-row items-center gap-3 border-2 border-mint bg-mint-soft px-4 py-3">
            <span className="text-xl">☁️</span>
            <p className="text-sm">
              Cloud sync is on — typists and stars follow you to any device.
            </p>
            {hasLocalData && (
              <Button
                size="sm"
                variant="secondary"
                className="font-display font-bold"
                onClick={() =>
                  migrateLocal().catch((e) => {
                    if (e instanceof Error && e.message === "FAMILY_PLAN_REQUIRED") upgradeToast();
                    else toast.error("Couldn't move local typists. Try again.");
                  })
                }
              >
                <CloudUpload className="size-4" />
                Move this device&apos;s typists to my account
              </Button>
            )}
          </Card>
        </Show>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {!ready &&
          [1, 2].map((i) => <Skeleton key={i} className="h-40 w-[150px] rounded-2xl" />)}
        {ready &&
          typists.map((t) => (
            <div key={t.id} className="group relative">
              <button
                onClick={() => pick(t.id)}
                className="keycap w-[150px] flex-col gap-1 rounded-2xl px-3 py-5 transition-transform hover:-translate-y-1"
              >
                <span className="text-4xl">{t.avatar}</span>
                <span className="font-display text-lg font-bold">{t.name}</span>
                <span className="text-sm text-muted-foreground">⭐ {t.stars} stars</span>
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-2 -top-2 hidden size-7 rounded-full border-2 bg-card group-hover:flex"
                    title={`Remove ${t.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {t.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This erases all of {t.name}&apos;s stars, scores and history. It cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep {t.name}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        remove(t.id).catch(() => toast.error("Couldn't remove that typist."))
                      }
                    >
                      Yes, remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        {ready && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="keycap w-[150px] flex-col gap-1 rounded-2xl border-dashed bg-transparent px-3 py-5 text-muted-foreground transition-transform hover:-translate-y-1">
                <span className="text-4xl">➕</span>
                <span className="font-display text-lg font-bold">New typist</span>
                <span className="text-sm">Join the quest</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader className="items-center">
                <DialogTitle className="font-display text-2xl">Who is typing?</DialogTitle>
                <DialogDescription>Pick a buddy and tell us your name.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap justify-center gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-2xl transition ${
                      a === avatar
                        ? "border-coral bg-coral/10 ring-2 ring-coral"
                        : "border-border bg-card"
                    }`}
                    aria-pressed={a === avatar}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") startQuest();
                }}
                maxLength={24}
                placeholder="Your name"
                className="mx-auto max-w-xs text-center font-display text-lg font-bold"
              />
              <Button
                onClick={startQuest}
                disabled={busy}
                className="mx-auto font-display text-base font-bold"
              >
                {busy ? "Packing your bag…" : "Start my quest!"}
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        💡 TypeQuest needs a real keyboard — a laptop or a computer with a keyboard plugged in.
      </p>
    </div>
  );
}
