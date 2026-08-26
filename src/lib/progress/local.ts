/* localStorage backend for guest mode. Client only. */
import { TypistData } from "./types";

const KEY = "typequest.v2";

interface LocalState {
  typists: TypistData[];
  activeId: string | null;
  muted: boolean;
}

export function loadLocal(): LocalState {
  if (typeof window === "undefined") return { typists: [], activeId: null, muted: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as LocalState;
      if (s && Array.isArray(s.typists)) return s;
    }
  } catch {
    // corrupted or unavailable storage — start fresh
  }
  return { typists: [], activeId: null, muted: false };
}

export function saveLocal(state: LocalState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked — progress lives in memory for this session
  }
}

export function newLocalTypist(name: string, avatar: string): TypistData {
  return {
    id: "local-" + Date.now() + "-" + Math.floor(Math.random() * 9999),
    name,
    avatar,
    progress: {},
    scores: {},
    history: [],
  };
}
