import { useState } from "react";
import type { Habit } from "./useDailyState";
import { CATEGORY_COLORS } from "./QueuePanel";

const CATEGORIES = ["All", "Nutrition", "Hydration", "Movement", "Recovery", "Metabolic"];

interface HabitGridProps {
  allHabits: Habit[];
  queue: string[];
  completed: string[];
  customHabits: Habit[];
  onAddCustom: (label: string) => boolean;
  onAddToQueue: (ids: string[]) => void;
  onBack: () => void;
  hasActivity: boolean;
  getLabel: (h: Habit) => string;
}

export function HabitGrid({
  allHabits, queue, completed, customHabits,
  onAddCustom, onAddToQueue, onBack, hasActivity, getLabel,
}: HabitGridProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [gridSelection, setGridSelection] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  const cats = customHabits.length > 0 ? [...CATEGORIES, "Custom"] : CATEGORIES;
  const filteredHabits = activeFilter === "All"
    ? allHabits
    : allHabits.filter(h => h.category === activeFilter);

  const handleAddCustom = () => {
    if (onAddCustom(customInput)) setCustomInput("");
  };

  const handleAddToQueue = () => {
    onAddToQueue(gridSelection);
    setGridSelection([]);
    onBack();
  };

  const togglePill = (id: string, disabled: boolean) => {
    if (disabled) return;
    setGridSelection(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  };

  return (
    <div style={{ animation: "fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)", paddingTop: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{
          fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)",
          letterSpacing: "-0.02em", color: "rgba(255,255,255,0.88)", lineHeight: 1.2,
        }}>
          Choose Your Habits
        </h2>
        {hasActivity && (
          <button
            onClick={onBack}
            style={{
              fontSize: 12, padding: "6px 16px", borderRadius: 20,
              background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.35)", cursor: "pointer",
              fontFamily: "var(--font-sans)", transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "rgba(255,255,255,0.70)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgba(255,255,255,0.35)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.background = "rgba(255,255,255,0.035)";
            }}
          >
            ← Back to queue
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
        {cats.map(c => {
          const isActive = activeFilter === c;
          const color = CATEGORY_COLORS[c];
          return (
            <button
              key={c}
              onClick={() => setActiveFilter(c)}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.2s",
                background: isActive
                  ? (c === "All" ? "rgba(255,255,255,0.09)" : `${color}1a`)
                  : "rgba(255,255,255,0.025)",
                border: `1px solid ${isActive
                  ? (c === "All" ? "rgba(255,255,255,0.20)" : `${color}55`)
                  : "rgba(255,255,255,0.07)"}`,
                color: isActive
                  ? (c === "All" ? "rgba(255,255,255,0.82)" : color)
                  : "rgba(255,255,255,0.30)",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Habit pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
        {filteredHabits.map(h => {
          const inQ = queue.includes(h.id);
          const done = completed.includes(h.id);
          const sel = gridSelection.includes(h.id);
          const dis = inQ || done;
          return (
            <button
              key={h.id}
              onClick={() => togglePill(h.id, dis)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                fontFamily: "var(--font-sans)", transition: "all 0.2s",
                background: sel
                  ? "rgba(145,28,28,0.18)"
                  : dis ? "rgba(255,255,255,0.012)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${sel
                  ? "rgba(145,28,28,0.40)"
                  : dis ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.08)"}`,
                color: dis
                  ? "rgba(255,255,255,0.15)"
                  : sel ? "rgba(255,175,175,0.90)" : "rgba(255,255,255,0.55)",
                cursor: dis ? "default" : "pointer",
                transform: sel ? "scale(1.04)" : "scale(1)",
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: CATEGORY_COLORS[h.category] || "#c4737e",
                opacity: dis ? 0.18 : 1,
              }} />
              {getLabel(h)}
              {sel && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(190,50,50,0.85)" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {dis && (
                <span style={{ fontSize: 9, opacity: 0.30 }}>
                  {done ? "done" : "queued"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom habit input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAddCustom()}
          placeholder={customHabits.length >= 10 ? "Custom habit limit reached (10)" : "Add your own habit..."}
          disabled={customHabits.length >= 10}
          className="df-input"
          style={{
            flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.85)", outline: "none",
            fontFamily: "var(--font-sans)", transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        />
        <button
          onClick={handleAddCustom}
          disabled={!customInput.trim() || customHabits.length >= 10}
          style={{
            padding: "10px 22px", borderRadius: 12, fontSize: 16, fontWeight: 600,
            fontFamily: "var(--font-sans)", cursor: customInput.trim() ? "pointer" : "default",
            background: customInput.trim() ? "rgba(145,28,28,0.18)" : "rgba(255,255,255,0.025)",
            border: `1px solid ${customInput.trim() ? "rgba(145,28,28,0.32)" : "rgba(255,255,255,0.05)"}`,
            color: customInput.trim() ? "rgba(255,175,175,0.90)" : "rgba(255,255,255,0.12)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            if (customInput.trim()) e.currentTarget.style.background = "rgba(145,28,28,0.28)";
          }}
          onMouseLeave={e => {
            if (customInput.trim()) e.currentTarget.style.background = "rgba(145,28,28,0.18)";
          }}
        >
          +
        </button>
      </div>

      {/* Add to queue CTA — appears when habits are selected */}
      {gridSelection.length > 0 && (
        <button
          onClick={handleAddToQueue}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 13, fontSize: 14, fontWeight: 600,
            fontFamily: "var(--font-sans)", cursor: "pointer",
            background: "rgba(145,28,28,0.22)",
            border: "1px solid rgba(145,28,28,0.38)",
            color: "rgba(255,190,190,0.92)",
            animation: "fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            transition: "background 0.2s, transform 0.1s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(145,28,28,0.32)";
            e.currentTarget.style.transform = "scale(1.01)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(145,28,28,0.22)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Add {gridSelection.length} to today's queue
        </button>
      )}
    </div>
  );
}
