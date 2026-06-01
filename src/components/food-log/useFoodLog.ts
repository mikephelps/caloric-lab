import { useState, useEffect, useRef } from "react";

export type MealId = "breakfast" | "lunch" | "dinner" | "snacks";

export interface FoodEntry {
  id: string;
  text: string;
  time: string;
}

export interface DayLog {
  date: string;
  meals: Record<MealId, FoodEntry[]>;
}

export interface UndoState {
  entry: FoodEntry;
  mealId: MealId;
}

function getDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(date: string): string {
  return `cl_foodlog_${date}`;
}

function emptyMeals(): Record<MealId, FoodEntry[]> {
  return { breakfast: [], lunch: [], dinner: [], snacks: [] };
}

function loadDay(date: string): DayLog {
  try {
    const raw = localStorage.getItem(storageKey(date));
    if (raw) return JSON.parse(raw) as DayLog;
  } catch {}
  return { date, meals: emptyMeals() };
}

function saveDay(log: DayLog): void {
  try {
    localStorage.setItem(storageKey(log.date), JSON.stringify(log));
  } catch {}
}

function scanPastDays(todayStr: string): DayLog[] {
  const past: DayLog[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("cl_foodlog_")) continue;
      const date = key.slice("cl_foodlog_".length);
      if (date === todayStr) continue;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const log = JSON.parse(raw) as DayLog;
          const hasEntries = Object.values(log.meals).some(arr => arr.length > 0);
          if (hasEntries) past.push(log);
        }
      } catch {}
    }
  } catch {}
  return past.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
}

export function useFoodLog() {
  const todayStr = getDateString();
  const [today, setToday] = useState<DayLog>(() => loadDay(todayStr));
  const [pastDays, setPastDays] = useState<DayLog[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPastDays(scanPastDays(todayStr));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveDay(today);
  }, [today, initialized]);

  function addEntry(mealId: MealId, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const entry: FoodEntry = {
      id: `${mealId}_${Date.now()}`,
      text: trimmed,
      time: new Date().toISOString(),
    };
    setToday(prev => ({
      ...prev,
      meals: { ...prev.meals, [mealId]: [...prev.meals[mealId], entry] },
    }));
  }

  function deleteEntry(mealId: MealId, entryId: string) {
    const entry = today.meals[mealId].find(e => e.id === entryId);
    if (!entry) return;

    setToday(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealId]: prev.meals[mealId].filter(e => e.id !== entryId),
      },
    }));

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndo({ entry, mealId });
    undoTimerRef.current = setTimeout(() => setUndo(null), 4000);
  }

  function restoreEntry() {
    if (!undo) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = null;
    const { entry, mealId } = undo;
    setToday(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealId]: [...prev.meals[mealId], entry].sort((a, b) =>
          a.time.localeCompare(b.time)
        ),
      },
    }));
    setUndo(null);
  }

  function dismissUndo() {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = null;
    setUndo(null);
  }

  function clearToday() {
    setToday({ date: todayStr, meals: emptyMeals() });
  }

  function deletePastDay(date: string) {
    try {
      localStorage.removeItem(storageKey(date));
    } catch {}
    setPastDays(prev => prev.filter(d => d.date !== date));
  }

  const totalTodayEntries = Object.values(today.meals).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return {
    today,
    pastDays,
    undo,
    totalTodayEntries,
    addEntry,
    deleteEntry,
    restoreEntry,
    dismissUndo,
    clearToday,
    deletePastDay,
  };
}
