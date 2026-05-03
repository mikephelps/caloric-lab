import { useState, useEffect } from "react";

export type Category = "Nutrition" | "Hydration" | "Movement" | "Recovery" | "Metabolic" | "Custom";

export interface Habit {
  id: string;
  label: string;
  category: Category;
  calcKey?: string;
  calcPage?: string;
  dynamicLabel?: (val: string) => string;
}

interface CompletedData {
  date: string;
  items: string[];
}

interface StreakData {
  count: number;
  lastDate: string;
}

export interface DailyState {
  queue: string[];
  completed: string[];
  target: number;
  streak: StreakData;
  customHabits: Habit[];
  setTarget: (n: number | ((prev: number) => number)) => void;
  complete: (id: string) => void;
  undo: (id: string) => void;
  startOver: () => void;
  addToQueue: (ids: string[]) => void;
  removeFromQueue: (id: string) => void;
  addCustomHabit: (label: string) => boolean;
  clearAllData: () => void;
}

const LS = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, val: unknown) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
  remove(key: string) {
    try { localStorage.removeItem(key); } catch {}
  },
};

export const todayStr = () => new Date().toISOString().slice(0, 10);

const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export function useDailyState(): DailyState {
  const [queue, setQueue] = useState<string[]>(() => LS.get("cl_daily_queue", []));
  const [completed, setCompleted] = useState<string[]>(() => {
    const d = LS.get<CompletedData>("cl_daily_completed", { date: "", items: [] });
    return d.date === todayStr() ? d.items : [];
  });
  const [target, setTarget] = useState<number>(() => LS.get("cl_daily_target", 5));
  const [streak, setStreak] = useState<StreakData>(() => LS.get("cl_daily_streak", { count: 0, lastDate: "" }));
  const [customHabits, setCustomHabits] = useState<Habit[]>(() => LS.get("cl_daily_custom", []));

  // Daily reset on mount
  useEffect(() => {
    const d = LS.get<CompletedData>("cl_daily_completed", { date: "", items: [] });
    const today = todayStr();
    if (d.date !== today) {
      const yesterday = yesterdayStr();
      const savedTarget = LS.get<number>("cl_daily_target", 5);
      if (d.date === yesterday && d.items.length >= savedTarget) {
        setStreak(s => ({ count: s.count + 1, lastDate: yesterday }));
      } else if (d.date !== "" && d.date !== yesterday) {
        setStreak({ count: 0, lastDate: "" });
      }
      LS.set("cl_daily_completed", { date: today, items: [] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { LS.set("cl_daily_queue", queue); }, [queue]);
  useEffect(() => { LS.set("cl_daily_completed", { date: todayStr(), items: completed }); }, [completed]);
  useEffect(() => { LS.set("cl_daily_target", target); }, [target]);
  useEffect(() => { LS.set("cl_daily_streak", streak); }, [streak]);
  useEffect(() => { LS.set("cl_daily_custom", customHabits); }, [customHabits]);

  const complete = (id: string) => {
    setCompleted(p => [...p, id]);
    setQueue(p => p.filter(q => q !== id));
  };

  const undo = (id: string) => {
    setCompleted(p => p.filter(c => c !== id));
    setQueue(p => [...p, id]);
  };

  const startOver = () => {
    setQueue([]);
    setCompleted([]);
  };

  const addToQueue = (ids: string[]) => {
    setQueue(p => [...p, ...ids.filter(id => !p.includes(id) && !completed.includes(id))]);
  };

  const removeFromQueue = (id: string) => {
    setQueue(p => p.filter(q => q !== id));
  };

  const addCustomHabit = (label: string): boolean => {
    if (!label.trim() || customHabits.length >= 10) return false;
    const newHabit: Habit = { id: `c${Date.now()}`, label: label.trim(), category: "Custom" };
    setCustomHabits(p => [...p, newHabit]);
    return true;
  };

  const clearAllData = () => {
    ["cl_daily_queue", "cl_daily_completed", "cl_daily_target", "cl_daily_streak", "cl_daily_custom"].forEach(k => LS.remove(k));
    window.location.reload();
  };

  return {
    queue, completed, target, streak, customHabits,
    setTarget, complete, undo, startOver, addToQueue, removeFromQueue, addCustomHabit, clearAllData,
  };
}
