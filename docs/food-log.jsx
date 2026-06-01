import { useState, useEffect, useCallback, useRef } from "react";

// ─── Constants ───
const MEALS = [
  { id: "breakfast", label: "Breakfast", icon: "sunrise" },
  { id: "lunch", label: "Lunch", icon: "sun" },
  { id: "dinner", label: "Dinner", icon: "moon" },
  { id: "snacks", label: "Snacks", icon: "coffee" },
];

const MEAL_COLORS = {
  breakfast: "#f59e0b",
  lunch: "#22d3ee",
  dinner: "#8b5cf6",
  snacks: "#f97316",
};

// ─── localStorage ───
const LS = {
  get: (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  remove: (key) => { try { localStorage.removeItem(key); } catch {} },
};

const todayKey = () => `cl_foodlog_${new Date().toISOString().slice(0, 10)}`;
const dateFromKey = (key) => key.replace("cl_foodlog_", "");
const formatDate = (dateStr) => {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === today.toISOString().slice(0, 10)) return "Today";
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

// ─── Meal Icon SVGs ───
function MealIcon({ type, size = 16 }) {
  const color = MEAL_COLORS[type] || "rgba(255,255,255,0.4)";
  if (type === "breakfast") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83M12 18v4M19.07 19.07l-2.83-2.83M22 12h-4M19.07 4.93l-2.83 2.83" /><circle cx="12" cy="12" r="4" />
    </svg>
  );
  if (type === "lunch") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
  if (type === "dinner") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
    </svg>
  );
}

// ─── Single Food Entry ───
function FoodEntry({ entry, onDelete, mealColor }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8,
        background: hov ? "rgba(255,255,255,0.04)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <span style={{ width: 3, height: 20, borderRadius: 2, background: mealColor, flexShrink: 0, opacity: 0.5 }} />
      <span style={{ flex: 1, fontSize: 14, color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-sans, 'Satoshi', sans-serif)" }}>{entry.text}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>
        {new Date(entry.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </span>
      {hov && (
        <button onClick={() => onDelete(entry.id)} style={{
          background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex",
          color: "rgba(255,255,255,0.25)", transition: "color 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(220,80,80,0.6)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      )}
    </div>
  );
}

// ─── Meal Section ───
function MealSection({ meal, entries, onAddEntry, onDeleteEntry }) {
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(true);
  const inputRef = useRef(null);
  const color = MEAL_COLORS[meal.id];
  const count = entries.length;

  const handleAdd = () => {
    if (!input.trim()) return;
    onAddEntry(meal.id, input.trim());
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          padding: "8px 0", background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-display, 'Cabinet Grotesk', sans-serif)",
        }}
      >
        <MealIcon type={meal.id} size={16} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: "-0.01em" }}>{meal.label}</span>
        {count > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 500, padding: "1px 8px", borderRadius: 10,
            background: `${color}18`, color: color, marginLeft: 2,
          }}>{count}</span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" style={{ marginLeft: "auto", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div style={{ paddingLeft: 4 }}>
          {entries.map(e => (
            <FoodEntry key={e.id} entry={e} onDelete={onDeleteEntry} mealColor={color} />
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: count > 0 ? 6 : 0, padding: "0 12px" }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder={count === 0 ? `What did you have for ${meal.label.toLowerCase()}?` : "Add another..."}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 13,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                color: "#fff", outline: "none", fontFamily: "var(--font-sans, 'Satoshi', sans-serif)",
              }}
            />
            {input.trim() && (
              <button onClick={handleAdd} style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: `${color}18`, border: `1px solid ${color}30`,
                color: color, cursor: "pointer",
              }}>+</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Day Card (for past days) ───
function PastDayCard({ dateStr, log, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const totalItems = Object.values(log.meals).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "14px 16px",
          background: "none", border: "none", cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-display, 'Cabinet Grotesk', sans-serif)" }}>
          {formatDate(dateStr)}
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" style={{ marginLeft: "auto", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 14px" }}>
          {MEALS.map(meal => {
            const entries = log.meals[meal.id] || [];
            if (entries.length === 0) return null;
            return (
              <div key={meal.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <MealIcon type={meal.id} size={13} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{meal.label}</span>
                </div>
                {entries.map(e => (
                  <div key={e.id} style={{ padding: "3px 0 3px 22px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    {e.text}
                  </div>
                ))}
              </div>
            );
          })}
          <button onClick={() => onDelete(dateStr)} style={{
            marginTop: 8, fontSize: 11, padding: "4px 10px", borderRadius: 6,
            background: "rgba(220,60,60,0.08)", border: "1px solid rgba(220,60,60,0.15)",
            color: "rgba(220,100,100,0.6)", cursor: "pointer",
          }}>Delete this day</button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───
export default function FoodLog() {
  const [todayLog, setTodayLog] = useState(() => {
    const saved = LS.get(todayKey(), null);
    return saved || { date: new Date().toISOString().slice(0, 10), meals: { breakfast: [], lunch: [], dinner: [], snacks: [] } };
  });
  const [pastDays, setPastDays] = useState([]);
  const [undoItem, setUndoItem] = useState(null);
  const undoTimer = useRef(null);

  // Load past days on mount
  useEffect(() => {
    const days = [];
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("cl_foodlog_") && dateFromKey(key) !== today) {
        const dateStr = dateFromKey(key);
        const log = LS.get(key, null);
        if (log) days.push({ dateStr, log });
      }
    }
    days.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
    setPastDays(days.slice(0, 7));
  }, []);

  // Persist today
  useEffect(() => { LS.set(todayKey(), todayLog); }, [todayLog]);

  const addEntry = useCallback((mealId, text) => {
    setTodayLog(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealId]: [...(prev.meals[mealId] || []), {
          id: `${mealId}_${Date.now()}`,
          text,
          time: new Date().toISOString(),
        }],
      },
    }));
  }, []);

  const deleteEntry = useCallback((entryId) => {
    let deleted = null;
    let mealId = null;
    setTodayLog(prev => {
      const updated = { ...prev, meals: { ...prev.meals } };
      for (const m of MEALS) {
        const idx = updated.meals[m.id]?.findIndex(e => e.id === entryId);
        if (idx !== undefined && idx >= 0) {
          deleted = updated.meals[m.id][idx];
          mealId = m.id;
          updated.meals[m.id] = updated.meals[m.id].filter(e => e.id !== entryId);
          break;
        }
      }
      return updated;
    });

    if (deleted && mealId) {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      setUndoItem({ entry: deleted, mealId });
      undoTimer.current = setTimeout(() => setUndoItem(null), 4000);
    }
  }, []);

  const handleUndo = () => {
    if (!undoItem) return;
    setTodayLog(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [undoItem.mealId]: [...(prev.meals[undoItem.mealId] || []), undoItem.entry],
      },
    }));
    setUndoItem(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const deletePastDay = (dateStr) => {
    LS.remove(`cl_foodlog_${dateStr}`);
    setPastDays(prev => prev.filter(d => d.dateStr !== dateStr));
  };

  const clearToday = () => {
    const empty = { date: new Date().toISOString().slice(0, 10), meals: { breakfast: [], lunch: [], dinner: [], snacks: [] } };
    setTodayLog(empty);
  };

  const totalToday = Object.values(todayLog.meals).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, oklch(10% 0.02 220) 0%, oklch(11% 0.02 220) 50%, oklch(10% 0.02 220) 100%)", color: "#fff", fontFamily: "var(--font-sans, 'Satoshi', sans-serif)" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes undoSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}button{font-family:inherit}
        input::placeholder{color:rgba(255,255,255,0.2)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", maxWidth: 720, margin: "0 auto" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display, 'Cabinet Grotesk', sans-serif)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Food Log</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        {totalToday > 0 && (
          <button onClick={clearToday} style={{
            fontSize: 11, padding: "5px 12px", borderRadius: 6,
            background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.28)", cursor: "pointer",
          }}>Clear today</button>
        )}
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        {/* Intro text for empty state */}
        {totalToday === 0 && (
          <div style={{ marginBottom: 24, animation: "fadeUp 0.4s ease-out" }}>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
              Write down what you eat. No calories, no macros, no judgment. Just awareness. The first step to eating better is noticing what you eat now.
            </p>
          </div>
        )}

        {/* Today's log */}
        <div style={{
          borderRadius: 14, padding: "20px 18px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.18)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Today</p>
            {totalToday > 0 && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{totalToday} {totalToday === 1 ? "item" : "items"} logged</span>
            )}
          </div>

          {MEALS.map(meal => (
            <MealSection
              key={meal.id}
              meal={meal}
              entries={todayLog.meals[meal.id] || []}
              onAddEntry={addEntry}
              onDeleteEntry={deleteEntry}
            />
          ))}
        </div>

        {/* Undo toast */}
        {undoItem && (
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 10,
            background: "oklch(13% 0.025 220)", border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            animation: "undoSlide 0.25s ease-out", zIndex: 50,
          }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Removed "{undoItem.entry.text}"</span>
            <button onClick={handleUndo} style={{
              fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 6,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)", cursor: "pointer",
            }}>Undo</button>
          </div>
        )}

        {/* Past days */}
        {pastDays.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Previous days</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pastDays.map(d => (
                <PastDayCard key={d.dateStr} dateStr={d.dateStr} log={d.log} onDelete={deletePastDay} />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ margin: "36px 0", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.045), transparent)" }} />

        {/* Soft CTA */}
        <div style={{ borderRadius: 14, padding: 22, marginBottom: 40, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.15)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Know your numbers</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>
            Logging what you eat is the first step. When you are ready for the next one, find out how much your body actually needs.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {["TDEE Calculator", "Protein Calculator", "Calorie Deficit Calculator"].map(calc => (
              <span key={calc} style={{
                fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 8,
                background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.35)", cursor: "pointer",
              }}>{calc}</span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
