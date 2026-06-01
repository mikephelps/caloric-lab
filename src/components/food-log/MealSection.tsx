import { useState, useRef } from "react";
import type { MealId, FoodEntry as FoodEntryType } from "./useFoodLog";
import FoodEntry from "./FoodEntry";

interface MealConfig {
  label: string;
  color: string;
  bgColor: string;
  badgeBg: string;
  placeholder: (hasEntries: boolean) => string;
}

const MEAL_CONFIGS: Record<MealId, MealConfig> = {
  breakfast: {
    label: "Breakfast",
    color: "#f59e0b",
    bgColor: "rgba(245,158,11,0.12)",
    badgeBg: "rgba(245,158,11,0.14)",
    placeholder: (has) => (has ? "Add another..." : "What did you have for breakfast?"),
  },
  lunch: {
    label: "Lunch",
    color: "#22d3ee",
    bgColor: "rgba(34,211,238,0.10)",
    badgeBg: "rgba(34,211,238,0.12)",
    placeholder: (has) => (has ? "Add another..." : "What did you have for lunch?"),
  },
  dinner: {
    label: "Dinner",
    color: "oklch(72% 0.18 292)",
    bgColor: "rgba(139,92,246,0.10)",
    badgeBg: "rgba(139,92,246,0.14)",
    placeholder: (has) => (has ? "Add another..." : "What did you have for dinner?"),
  },
  snacks: {
    label: "Snacks",
    color: "#f97316",
    bgColor: "rgba(249,115,22,0.10)",
    badgeBg: "rgba(249,115,22,0.14)",
    placeholder: (has) => (has ? "Add another..." : "Any snacks today?"),
  },
};

function MealIcon({ mealId, color }: { mealId: MealId; color: string }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none" as const,
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (mealId === "breakfast") {
    return (
      <svg {...props}>
        <circle cx="8" cy="8" r="3" />
        <line x1="8" y1="1" x2="8" y2="2.5" />
        <line x1="8" y1="13.5" x2="8" y2="15" />
        <line x1="1" y1="8" x2="2.5" y2="8" />
        <line x1="13.5" y1="8" x2="15" y2="8" />
        <line x1="3.05" y1="3.05" x2="4.12" y2="4.12" />
        <line x1="11.88" y1="11.88" x2="12.95" y2="12.95" />
        <line x1="12.95" y1="3.05" x2="11.88" y2="4.12" />
        <line x1="4.12" y1="11.88" x2="3.05" y2="12.95" />
      </svg>
    );
  }

  if (mealId === "lunch") {
    return (
      <svg {...props}>
        <circle cx="8" cy="8" r="5.5" />
        <circle cx="8" cy="8" r="2.5" />
      </svg>
    );
  }

  if (mealId === "dinner") {
    return (
      <svg {...props}>
        <path d="M12 4.5a5.5 5.5 0 1 1-8 7.8A5.5 5.5 0 0 0 12 4.5z" />
      </svg>
    );
  }

  // snacks — coffee cup
  return (
    <svg {...props}>
      <path d="M4 7h8v4.5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7z" />
      <path d="M12 8h1a2 2 0 0 1 0 4h-1" />
      <line x1="6.5" y1="7" x2="6" y2="4.5" />
      <line x1="9.5" y1="7" x2="10" y2="4.5" />
    </svg>
  );
}

interface Props {
  mealId: MealId;
  entries: FoodEntryType[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  isLast?: boolean;
}

export default function MealSection({ mealId, entries, onAdd, onDelete, isLast }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [addHovered, setAddHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cfg = MEAL_CONFIGS[mealId];

  function handleSubmit() {
    const text = inputValue.trim();
    if (!text) return;
    onAdd(text);
    setInputValue("");
    inputRef.current?.focus();
  }

  return (
    <div
      style={{
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Section header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "13px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <MealIcon mealId={mealId} color={cfg.color} />

        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.65)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {cfg.label}
        </span>

        {entries.length > 0 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: cfg.color,
              background: cfg.badgeBg,
              padding: "1px 7px",
              borderRadius: 20,
              fontFamily: "var(--font-sans)",
            }}
          >
            {entries.length}
          </span>
        )}

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

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: "0 16px 14px" }}>
          {entries.map(entry => (
            <FoodEntry
              key={entry.id}
              entry={entry}
              accentColor={cfg.color}
              onDelete={() => onDelete(entry.id)}
            />
          ))}

          {/* Input row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: entries.length > 0 ? 8 : 2,
            }}
          >
            <input
              ref={inputRef}
              className="fl-input"
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder={cfg.placeholder(entries.length > 0)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 13,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.85)",
                fontFamily: "var(--font-sans)",
                outline: "none",
                minHeight: 44,
                boxSizing: "border-box",
              }}
            />

            {inputValue.trim() && (
              <button
                onClick={handleSubmit}
                onMouseEnter={() => setAddHovered(true)}
                onMouseLeave={() => setAddHovered(false)}
                aria-label={`Add ${cfg.label.toLowerCase()} entry`}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  border: "none",
                  background: addHovered ? cfg.bgColor : "rgba(255,255,255,0.06)",
                  color: cfg.color,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 24,
                  lineHeight: 1,
                  fontWeight: 300,
                  transition: "background 0.15s",
                }}
              >
                +
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
