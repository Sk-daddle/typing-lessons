import { ProgressMap } from "@/lib/curriculum";

export interface Attempt {
  d: number; // epoch ms
  lessonId: string;
  wpm: number;
  acc: number;
  stars: number;
}

export interface TypistData {
  id: string;
  name: string;
  avatar: string;
  progress: ProgressMap;
  scores: Record<string, number>;
  history: Attempt[];
}

export interface TypistSummary {
  id: string;
  name: string;
  avatar: string;
  stars: number;
}

export interface LessonResult {
  wpm: number;
  acc: number;
  stars: number;
}
