import type { Habit } from "./useDailyState";

function MiniHeart() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(190,50,50,0.6)" style={{ flexShrink: 0 }} aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

interface CompletedPillProps {
  label: string;
  pulseSpeed: number;
  mountTime: number;
  onUndo: () => void;
}

function CompletedPill({ label, pulseSpeed, mountTime, onUndo }: CompletedPillProps) {
  const periodMs = pulseSpeed * 1000;
  const elapsed = Date.now() - mountTime;
  const phaseDelay = -((elapsed % periodMs) / 1000);

  return (
    <button
      onClick={onUndo}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", padding: "8px 14px", borderRadius: 10,
        background: "rgba(145,28,28,0.14)", border: "1px solid rgba(165,38,38,0.22)",
        color: "rgba(255,195,195,0.85)", cursor: "pointer",
        fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500,
        textAlign: "left", transition: "background 0.15s, border-color 0.15s",
        animation: `plP ${pulseSpeed}s ease-in-out ${phaseDelay.toFixed(3)}s infinite`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(145,28,28,0.24)";
        e.currentTarget.style.borderColor = "rgba(180,45,45,0.38)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(145,28,28,0.14)";
        e.currentTarget.style.borderColor = "rgba(165,38,38,0.22)";
      }}
    >
      <MiniHeart />
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", fontWeight: 400 }}>undo</span>
    </button>
  );
}

interface CompletedStackProps {
  completedHabits: Habit[];
  getLabel: (h: Habit) => string;
  pulseSpeed: number;
  mountTime: number;
  onUndo: (id: string) => void;
}

export function CompletedStack({ completedHabits, getLabel, pulseSpeed, mountTime, onUndo }: CompletedStackProps) {
  if (completedHabits.length === 0) return null;
  return (
    <div style={{ width: "100%" }}>
      <p style={{
        fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.18)",
        letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
        fontFamily: "var(--font-sans)",
      }}>
        Completed
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {completedHabits.map(h => (
          <CompletedPill
            key={h.id}
            label={getLabel(h)}
            pulseSpeed={pulseSpeed}
            mountTime={mountTime}
            onUndo={() => onUndo(h.id)}
          />
        ))}
      </div>
    </div>
  );
}
