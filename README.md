# TypeQuest

A complete touch-typing course for homeschool kids — Next.js 16, Tailwind CSS v4, shadcn/ui, Clerk auth, and Neon Postgres via Drizzle.

## What's inside

**41 lessons across 7 units**, from first keystrokes to full paragraphs:

1. **Home Row Harbor** — F/J through the full home row, first real words
2. **Top Row Trail** — E/I, R/U, T/Y, W/O, Q/P and two-row words
3. **Bottom Row Bay** — the rest of the alphabet, pangrams
4. **Capital City** — shift keys, capitals, `. , ? ! ' "`
5. **Number Mountain** — the number row with correct fingering
6. **Word Wizard Woods** — common words, digraphs, double letters, silly sentences
7. **Story Summit** — paragraphs, timed tests, accuracy challenge, graduation run

**The Arcade** (`/arcade`) — play any game, any time, no unlocking:

- 🌧️ **Letter Rain** — zap falling letters before they splash
- 🎈 **Balloon Pop** — type words to pop balloons before they float away
- 🚀 **Rocket Race** — a 45-second typing race against Robo-Rocket

Each game has four difficulty settings: **Auto** (matches lessons completed), Sprout, Explorer, and Wizard.

**Also:**

- On-screen keyboard with color-coded fingers and next-key highlighting
- Live WPM + accuracy, 1–3 stars per lesson, star-gated lesson progression
- Multiple typist profiles per family
- "For grown-ups" progress report with per-lesson stats, speed chart, and coaching tips
- Printable graduation certificate

## Accounts and sync

- **Guest mode** — works with no account; progress saves to the browser (`localStorage`).
- **Signed in (Clerk)** — typists, stars, attempts, and game scores live in Neon Postgres and follow the family to any device. A one-click banner moves guest typists into the account after signing in.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | Tailwind CSS v4 + shadcn/ui (Radix) |
| Auth | Clerk (`@clerk/nextjs` v7, Core 3) via Vercel Marketplace |
| Database | Neon Postgres via Vercel Marketplace, Drizzle ORM |
| Fonts | Baloo 2 (display), Atkinson Hyperlegible (body), IBM Plex Mono (typing) |

Key paths:

- `src/lib/curriculum.ts` — units, lessons, drills, game word pools
- `src/lib/keyboard.ts` — key layout, finger map, shift logic
- `src/components/lesson-player.tsx` — the typing engine
- `src/components/games/` — the three arcade games
- `src/lib/progress/provider.tsx` — local/cloud progress store
- `src/actions/typists.ts` — server actions (auth-checked)
- `src/db/schema.ts` — typists, lesson_progress, attempts, game_scores

## Development

```bash
pnpm install
vercel env pull .env.local   # Clerk + Neon credentials from the linked Vercel project
pnpm db:push                 # sync Drizzle schema to Neon
pnpm dev
```

The old single-file prototype lives in `prototype/`.
