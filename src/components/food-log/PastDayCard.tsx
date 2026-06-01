import { useState } from "react";
import type { DayLog, MealId } from "./useFoodLog";

const MEAL_LABELS: Record<MealId, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

const MEAL_ORDER: MealId[] = ["breakfast", "lunch", "dinner", "snacks"];

const MEAL_COLORS: Record<MealId, string> = {
  breakfast: "#f59e0b",
  lunch: "#22d3ee",
  dinner: "oklch(72% 0.18 292)",
  snacks: "#f97316",
};

function formatDayLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";

  // Use T12:00:00 to avoid timezone edge cases
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface Props {
  log: DayLog;
  onDelete: () => void;
}

export default function PastDayCard({ log, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);

  const totalEntries = Object.values(log.meals).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const activeMeals = MEAL_ORDER.filter(m => log.meals[m].length > 0);

  return (
    <div
      style={{
        background: "var(--cl-dark-card)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      {/* Collapsed header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "13px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          gap: 10,
          textAlign: "left",
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(255,255,255,0.65)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {formatDayLabel(log.date)}
        </span>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.38)",
            background: "rgba(255,255,255,0.07)",
            padding: "2px 8px",
            borderRadius: 20,
            fontFamily: "var(--font-sans)",
          }}
        >
          {totalEntries} {totalEntries === 1 ? "item" : "items"}
        </span>

        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
          style={{
            color: "rgba(255,255,255,0.28)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.293 5.293a1 1 0 0 1 1.414 0L8 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
          />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 16px 16px",
          }}
        >
          {activeMeals.map(mealId => (
            <div key={mealId} style={{ marginBottom: 12 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.28)",
                  marginBottom: 6,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {MEAL_LABELS[mealId]}
              </p>
              {log.meals[mealId].map(entry => (
                <div
                  key={entry.id}
                  style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 5 }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 16,
                      borderRadius: 2,
                      background: MEAL_COLORS[mealId],
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.72)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {entry.text}
                  </span>
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={onDelete}
            onMouseEnter={() => setDeleteHovered(true)}
            onMouseLeave={() => setDeleteHovered(false)}
            style={{
              marginTop: 4,
              fontSize: 12,
              color: deleteHovered ? "rgba(248,113,113,0.80)" : "rgba(255,255,255,0.28)",
              background: "none",
              border: `1px solid ${deleteHovered ? "rgba(248,113,113,0.25)" : "rgba(255,255,255,0.09)"}`,
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            Delete this day
          </button>
        </div>
      )}
    </div>
  );
}
