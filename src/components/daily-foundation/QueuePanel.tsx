import { useState } from "react";
import type { Habit } from "./useDailyState";

export const CATEGORY_COLORS: Record<string, string> = {
  Nutrition: "#f97316",
  Hydration: "#22d3ee",
  Movement: "#f59e0b",
  Recovery: "oklch(72% 0.18 292)",
  Metabolic: "#e07a5f",
  Custom: "#c4737e",
};

interface QueueItemProps {
  habit: Habit;
  label: string;
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
}

function QueueItem({ habit, label, onComplete, onRemove }: QueueItemProps) {
  const [press, setPress] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [xHovered, setXHovered] = useState(false);

  const handleActivate = () => {
    if (press) return;
    setPress(true);
    setTimeout(() => onComplete(habit.id), 350);
  };

  const hasNoCalcValue = habit.calcKey
    ? (() => { try { return !localStorage.getItem(habit.calcKey!); } catch { return false; } })()
    : false;

  return (
    <div
      onClick={handleActivate}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleActivate()}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "13px 16px", borderRadius: 12, cursor: "pointer",
        background: press ? "rgba(150,35,35,0.10)" : "rgba(255,255,255,0.035)",
        border: `1px solid ${press ? "rgba(150,35,35,0.22)" : "rgba(255,255,255,0.07)"}`,
        transition: "background 0.2s, border-color 0.2s",
        outline: "none",
      }}
      onMouseEnter={e => {
        setHovered(true);
        if (!press) {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.borderColor = "rgba(150,35,35,0.18)";
        }
      }}
      onMouseLeave={e => {
        setHovered(false);
        setXHovered(false);
        if (!press) {
          e.currentTarget.style.background = "rgba(255,255,255,0.035)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        }
      }}
    >
      {/* Checkbox circle */}
      <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${press ? "rgba(160,40,40,0.55)" : "rgba(255,255,255,0.13)"}`,
        background: press ? "rgba(160,40,40,0.18)" : "transparent",
        transition: "all 0.2s",
      }}>
        {press && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,180,180,0.9)" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      {/* Category accent bar */}
      <span
        style={{
          width: 4, height: 22, borderRadius: 2, flexShrink: 0,
          background: CATEGORY_COLORS[habit.category] || "#c4737e",
        }}
        aria-hidden="true"
      />
      {/* Label */}
      <span style={{
        flex: 1, fontSize: 14, fontFamily: "var(--font-sans)", fontWeight: 500,
        color: press ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.82)",
        transform: press ? "translateX(-6px)" : "none",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        lineHeight: 1.4,
      }}>
        {label}
        {hasNoCalcValue && (
          <a
            href={habit.calcPage || "#"}
            onClick={e => e.stopPropagation()}
            style={{
              marginLeft: 8, fontSize: 11, fontWeight: 500,
              color: CATEGORY_COLORS[habit.category] || "#c4737e",
              opacity: 0.70, textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.opacity = "1"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.opacity = "0.70"; }}
          >
            Personalize ↗
          </a>
        )}
      </span>
      {/* Tap hint — fades out on card hover to give visual space to the × */}
      <span style={{
        fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans)",
        whiteSpace: "nowrap",
        opacity: press || hovered ? 0 : 1,
        transition: "opacity 0.2s",
        pointerEvents: "none",
      }}>
        tap to complete
      </span>
      {/* Remove button */}
      <button
        onClick={e => { e.stopPropagation(); onRemove(habit.id); }}
        onMouseEnter={() => setXHovered(true)}
        onMouseLeave={() => setXHovered(false)}
        aria-label={`Remove ${label} from queue`}
        style={{
          width: 26, height: 26, borderRadius: 6, border: "none", flexShrink: 0,
          background: xHovered ? "rgba(210,60,60,0.12)" : "transparent",
          color: xHovered ? "rgba(220,80,80,0.85)" : hovered ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.16)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "color 0.15s, background 0.15s",
          fontSize: 16, lineHeight: 1,
          opacity: press ? 0 : 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

interface QueuePanelProps {
  queueHabits: Habit[];
  getLabel: (h: Habit) => string;
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onStartOver: () => void;
  onAddMore: () => void;
}

export function QueuePanel({ queueHabits, getLabel, onComplete, onRemove, onStartOver, onAddMore }: QueuePanelProps) {
  return (
    <div>
      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{
          fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-sans)",
        }}>
          {queueHabits.length > 0 ? "Today's Queue" : "All Done"}
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Start over", onClick: onStartOver },
            { label: "+ Add more", onClick: onAddMore },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              style={{
                fontSize: 11, padding: "5px 11px", borderRadius: 7,
                background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.28)", cursor: "pointer",
                fontFamily: "var(--font-sans)", transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "rgba(255,255,255,0.60)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "rgba(255,255,255,0.28)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.background = "rgba(255,255,255,0.035)";
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {queueHabits.map(h => (
          <QueueItem key={h.id} habit={h} label={getLabel(h)} onComplete={onComplete} onRemove={onRemove} />
        ))}
      </div>

      {/* Empty queue state */}
      {queueHabits.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.15)" }}>
          <p style={{ fontSize: 15, fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Queue clear.
          </p>
          <p style={{ fontSize: 12, marginTop: 5, fontFamily: "var(--font-sans)" }}>
            Everything's in the heart.
          </p>
        </div>
      )}
    </div>
  );
}
