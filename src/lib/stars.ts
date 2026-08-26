import { FlatLesson } from "./curriculum";

export function computeStars(lesson: FlatLesson, wpm: number, acc: number): number {
  if (lesson.mode === "timed" && lesson.starsWpm) {
    const t = lesson.starsWpm;
    let s = wpm >= t[2] ? 3 : wpm >= t[1] ? 2 : wpm >= t[0] ? 1 : 0;
    if (acc < 85) s = Math.min(s, 1);
    return s;
  }
  if (lesson.mode === "acc" && lesson.starsAcc) {
    const t = lesson.starsAcc;
    return acc >= t[2] ? 3 : acc >= t[1] ? 2 : acc >= t[0] ? 1 : 0;
  }
  if (acc >= 96 && wpm >= lesson.unit.wpm3) return 3;
  if (acc >= 90) return 2;
  if (acc >= 80) return 1;
  return 0;
}

export const VERDICTS = ["Keep practicing!", "Nice work!", "Great typing!", "Superstar! ⭐"];

export function resultNote(stars: number, isGraduation: boolean): string {
  const notes = [
    "Try this lesson again — slow down and aim for every key.",
    "One more try could earn you more stars!",
    "So close to three stars — a touch more accuracy!",
    isGraduation ? "You finished the whole quest!" : "On to the next adventure!",
  ];
  return notes[stars];
}
