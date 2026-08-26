"use client";

import { Component, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { PricingTable, Show, SignInButton, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getMyPlan, redeemInviteCode } from "@/actions/billing";
import type { PlanStatus } from "@/lib/billing";

/* PricingTable throws while billing is disabled in the Clerk dashboard;
   show a friendly placeholder instead of crashing the page. */
class BillingBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <p className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Monthly and yearly plans are almost ready — check back soon! Lifetime and beta codes
          work today.
        </p>
      );
    }
    return this.props.children;
  }
}

const FREE_PERKS = [
  "All 41 lessons and every game",
  "1 cloud typist synced across devices",
  "Unlimited local typists on one device",
  "Printable certificate",
];
const FAMILY_PERKS = [
  "Everything in Free",
  "Unlimited typists — the whole crew",
  "Progress synced on every device",
  "Supports a tiny independent app 💛",
];

export function PricingPlans() {
  const { isSignedIn } = useUser();
  const [status, setStatus] = useState<PlanStatus | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    getMyPlan()
      .then(setStatus)
      .catch(() => setStatus(null));
  };
  useEffect(refresh, [isSignedIn]);

  const redeem = async () => {
    setBusy(true);
    try {
      const res = await redeemInviteCode(code);
      if (res.ok) {
        toast.success("Welcome to the Family plan — forever! 🎉");
        setCode("");
        refresh();
      } else {
        const msg = {
          "signed-out": "Sign in first, then redeem your code.",
          "already-family": "You're already on the Family plan!",
          invalid: "That code doesn't look right. Check for typos?",
          "used-up": "That code has been fully used.",
        }[res.reason];
        toast.error(msg);
      }
    } catch {
      toast.error("Couldn't redeem right now. Try again in a minute.");
    } finally {
      setBusy(false);
    }
  };

  const buyLifetime = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) window.location.href = data.url;
      else if (res.status === 401) toast.error("Sign in first to buy lifetime access.");
      else if (res.status === 503) toast.info("Lifetime purchase opens soon — beta codes work today!");
      else toast.error("Couldn't start checkout. Try again.");
    } catch {
      toast.error("Couldn't start checkout. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="text-center">
        <span className="block text-5xl">🧡</span>
        <h1 className="mt-1 font-display text-4xl font-extrabold">Plans for every family</h1>
        <p className="mx-auto mt-2 max-w-lg text-balance text-muted-foreground">
          The full typing course is free, forever, no ads ever. The Family plan adds cloud sync for
          the whole crew — and keeps TypeQuest running.
        </p>
        {status?.plan === "family" && (
          <Badge className="mt-3 border-2 border-mint bg-mint-soft font-display text-sm font-bold text-foreground">
            ✅ You&apos;re on the Family plan{status.lifetime ? " — lifetime!" : ""}
          </Badge>
        )}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card className="gap-3 border-2 border-b-6 p-6">
          <h2 className="font-display text-xl font-bold">🌱 Free</h2>
          <p className="font-display text-3xl font-extrabold">
            $0 <span className="text-base font-bold text-muted-foreground">forever</span>
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {FREE_PERKS.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </Card>
        <Card className="gap-3 border-2 border-b-6 border-berry bg-berry-soft/40 p-6">
          <h2 className="font-display text-xl font-bold">👨‍👩‍👧‍👦 Family — Lifetime</h2>
          <p className="font-display text-3xl font-extrabold">
            $59 <span className="text-base font-bold text-muted-foreground">once, forever</span>
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {FAMILY_PERKS.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
          <Show when="signed-in">
            <Button
              onClick={buyLifetime}
              disabled={busy || status?.plan === "family"}
              className="border-2 border-b-4 border-coral-deep font-display font-bold"
            >
              {status?.plan === "family" ? "You have it! 🎉" : "Buy lifetime"}
            </Button>
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button className="border-2 border-b-4 border-coral-deep font-display font-bold">
                Sign in to buy
              </Button>
            </SignInButton>
          </Show>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-center font-display text-2xl font-extrabold">
          Prefer monthly or yearly?
        </h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Cancel anytime, keep your local progress always.
        </p>
        <div className="mx-auto mt-5 max-w-2xl">
          <BillingBoundary>
            <PricingTable />
          </BillingBoundary>
        </div>
      </div>

      <Card className="mx-auto mt-10 max-w-md gap-3 border-2 border-b-6 border-dashed p-6 text-center">
        <h3 className="font-display text-lg font-bold">🎟️ Have a beta code?</h3>
        <p className="text-sm text-muted-foreground">
          Friends-and-family codes unlock the Family plan for life. Sign in, paste, go.
        </p>
        <div className="flex justify-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && code.trim()) redeem();
            }}
            placeholder="TYPE-QUEST-XXXX"
            className="max-w-52 text-center font-mono uppercase"
          />
          <Button
            onClick={redeem}
            disabled={busy || !code.trim()}
            variant="secondary"
            className="font-display font-bold"
          >
            Redeem
          </Button>
        </div>
        <Show when="signed-out">
          <p className="text-xs text-muted-foreground">
            You&apos;ll need to{" "}
            <SignInButton mode="modal">
              <button className="underline">sign in</button>
            </SignInButton>{" "}
            first so we know who to upgrade.
          </p>
        </Show>
      </Card>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Questions? <Link href="/" className="underline">Back to TypeQuest</Link>
      </p>
    </div>
  );
}
