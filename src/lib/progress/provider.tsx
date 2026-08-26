"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { totalStars } from "@/lib/curriculum";
import { setMuted as setSfxMuted } from "@/lib/audio";
import * as cloud from "@/actions/typists";
import { loadLocal, newLocalTypist, saveLocal } from "./local";
import { Attempt, LessonResult, TypistData, TypistSummary } from "./types";

export type StoreMode = "local" | "cloud";

interface Store {
  ready: boolean;
  mode: StoreMode;
  typists: TypistSummary[];
  active: TypistData | null;
  muted: boolean;
  hasLocalData: boolean;
  toggleMuted: () => void;
  create: (name: string, avatar: string) => Promise<void>;
  select: (id: string) => Promise<void>;
  deselect: () => void;
  remove: (id: string) => Promise<void>;
  reset: (id: string) => Promise<void>;
  recordLesson: (lessonId: string, result: LessonResult) => void;
  recordScore: (gameId: string, score: number) => void;
  migrateLocal: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

const ACTIVE_CLOUD_KEY = "typequest.activeCloud";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const mode: StoreMode = isSignedIn ? "cloud" : "local";

  const [ready, setReady] = useState(false);
  const [typists, setTypists] = useState<TypistSummary[]>([]);
  const [active, setActive] = useState<TypistData | null>(null);
  const [muted, setMutedState] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);
  // Mirror of the full local state so we can write it back synchronously.
  const localRef = useRef(loadLocal());

  const syncLocalDerived = useCallback(() => {
    const s = localRef.current;
    setHasLocalData(s.typists.length > 0);
    if (s.muted !== undefined) {
      setMutedState(s.muted);
      setSfxMuted(s.muted);
    }
  }, []);

  // Initial + auth-change load
  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    (async () => {
      localRef.current = loadLocal();
      syncLocalDerived();
      if (isSignedIn) {
        try {
          const list = await cloud.listTypists();
          if (cancelled) return;
          setTypists(list);
          const savedId = localStorage.getItem(ACTIVE_CLOUD_KEY);
          if (savedId && list.some((t) => t.id === savedId)) {
            const data = await cloud.getTypist(savedId);
            if (!cancelled) setActive(data);
          } else {
            setActive(null);
          }
        } catch {
          if (!cancelled) toast.error("Couldn't load your typists. Check your connection.");
        }
      } else {
        const s = localRef.current;
        setTypists(
          s.typists.map((t) => ({ id: t.id, name: t.name, avatar: t.avatar, stars: totalStars(t.progress) })),
        );
        setActive(s.typists.find((t) => t.id === s.activeId) ?? null);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, syncLocalDerived]);

  const persistLocal = useCallback(() => {
    saveLocal(localRef.current);
  }, []);

  const toggleMuted = useCallback(() => {
    setMutedState((m) => {
      const next = !m;
      setSfxMuted(next);
      localRef.current.muted = next;
      saveLocal(localRef.current);
      return next;
    });
  }, []);

  const refreshSummaries = useCallback((data: TypistData) => {
    setTypists((prev) =>
      prev.map((t) => (t.id === data.id ? { ...t, stars: totalStars(data.progress) } : t)),
    );
  }, []);

  const create = useCallback(
    async (name: string, avatar: string) => {
      if (mode === "cloud") {
        const summary = await cloud.createTypist(name, avatar);
        const data = await cloud.getTypist(summary.id);
        setTypists((prev) => [...prev, summary]);
        setActive(data);
        localStorage.setItem(ACTIVE_CLOUD_KEY, summary.id);
      } else {
        const t = newLocalTypist(name.trim().slice(0, 24) || "Typist", avatar);
        localRef.current.typists.push(t);
        localRef.current.activeId = t.id;
        persistLocal();
        setTypists((prev) => [...prev, { id: t.id, name: t.name, avatar: t.avatar, stars: 0 }]);
        setActive(t);
        setHasLocalData(true);
      }
    },
    [mode, persistLocal],
  );

  const select = useCallback(
    async (id: string) => {
      if (mode === "cloud") {
        const data = await cloud.getTypist(id);
        setActive(data);
        localStorage.setItem(ACTIVE_CLOUD_KEY, id);
      } else {
        const t = localRef.current.typists.find((x) => x.id === id);
        if (t) {
          localRef.current.activeId = id;
          persistLocal();
          setActive(t);
        }
      }
    },
    [mode, persistLocal],
  );

  const deselect = useCallback(() => {
    setActive(null);
    if (mode === "cloud") localStorage.removeItem(ACTIVE_CLOUD_KEY);
    else {
      localRef.current.activeId = null;
      persistLocal();
    }
  }, [mode, persistLocal]);

  const remove = useCallback(
    async (id: string) => {
      if (mode === "cloud") {
        await cloud.deleteTypist(id);
        localStorage.removeItem(ACTIVE_CLOUD_KEY);
      } else {
        localRef.current.typists = localRef.current.typists.filter((t) => t.id !== id);
        if (localRef.current.activeId === id) localRef.current.activeId = null;
        persistLocal();
        setHasLocalData(localRef.current.typists.length > 0);
      }
      setTypists((prev) => prev.filter((t) => t.id !== id));
      setActive((a) => (a?.id === id ? null : a));
    },
    [mode, persistLocal],
  );

  const reset = useCallback(
    async (id: string) => {
      if (mode === "cloud") await cloud.resetTypist(id);
      else {
        const t = localRef.current.typists.find((x) => x.id === id);
        if (t) {
          t.progress = {};
          t.scores = {};
          t.history = [];
          persistLocal();
        }
      }
      setActive((a) => (a?.id === id ? { ...a, progress: {}, scores: {}, history: [] } : a));
      setTypists((prev) => prev.map((t) => (t.id === id ? { ...t, stars: 0 } : t)));
    },
    [mode, persistLocal],
  );

  const recordLesson = useCallback(
    (lessonId: string, result: LessonResult) => {
      setActive((a) => {
        if (!a) return a;
        const prev = a.progress[lessonId] ?? { stars: 0, bestWpm: 0, bestAcc: 0, tries: 0 };
        const attempt: Attempt = { d: Date.now(), lessonId, ...result };
        const next: TypistData = {
          ...a,
          progress: {
            ...a.progress,
            [lessonId]: {
              stars: Math.max(prev.stars, result.stars),
              bestWpm: Math.max(prev.bestWpm, result.wpm),
              bestAcc: Math.max(prev.bestAcc, result.acc),
              tries: prev.tries + 1,
            },
          },
          history: [...a.history, attempt].slice(-100),
        };
        if (mode === "cloud") {
          cloud.recordLesson(a.id, lessonId, result).catch(() => {
            toast.error("Couldn't save that attempt to the cloud.");
          });
        } else {
          const t = localRef.current.typists.find((x) => x.id === a.id);
          if (t) {
            t.progress = next.progress;
            t.history = next.history;
            persistLocal();
          }
        }
        refreshSummaries(next);
        return next;
      });
    },
    [mode, persistLocal, refreshSummaries],
  );

  const recordScore = useCallback(
    (gameId: string, score: number) => {
      setActive((a) => {
        if (!a) return a;
        const best = Math.max(a.scores[gameId] ?? 0, score);
        const next = { ...a, scores: { ...a.scores, [gameId]: best } };
        if (mode === "cloud") {
          cloud.recordScore(a.id, gameId, score).catch(() => {
            toast.error("Couldn't save that score to the cloud.");
          });
        } else {
          const t = localRef.current.typists.find((x) => x.id === a.id);
          if (t) {
            t.scores = next.scores;
            persistLocal();
          }
        }
        return next;
      });
    },
    [mode, persistLocal],
  );

  const migrateLocal = useCallback(async () => {
    const localTypists = localRef.current.typists;
    if (localTypists.length === 0) return;
    await cloud.importTypists(localTypists);
    localRef.current.typists = [];
    localRef.current.activeId = null;
    persistLocal();
    setHasLocalData(false);
    const list = await cloud.listTypists();
    setTypists(list);
    toast.success("Typists moved to your account — they'll follow you to any device!");
  }, [persistLocal]);

  const value = useMemo<Store>(
    () => ({
      ready,
      mode,
      typists,
      active,
      muted,
      hasLocalData,
      toggleMuted,
      create,
      select,
      deselect,
      remove,
      reset,
      recordLesson,
      recordScore,
      migrateLocal,
    }),
    [ready, mode, typists, active, muted, hasLocalData, toggleMuted, create, select, deselect, remove, reset, recordLesson, recordScore, migrateLocal],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useProgress must be used inside ProgressProvider");
  return s;
}
