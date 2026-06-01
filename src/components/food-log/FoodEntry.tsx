import { useState } from "react";
import type { FoodEntry as FoodEntryType } from "./useFoodLog";

interface Props {
  entry: FoodEntryType;
  accentColor: string;
  onDelete: () => void;
}

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function FoodEntry({ entry, accentColor, onDelete }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        minHeight: 40,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 3px accent bar */}
      <div
        style={{ width: 3, height: 20, borderRadius: 2, background: accentColor, flexShrink: 0 }}
      />

      {/* Food text */}
      <span
        style={{
          flex: 1,
          fontSize: 14,
          color: "rgba(255,255,255,0.88)",
          fontFamily: "var(--font-sans)",
          lineHeight: 1.4,
        }}
      >
        {entry.text}
      </span>

      {/* Timestamp — hidden on narrow screens via fl-timestamp class */}
      <span
        className="fl-timestamp"
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.28)",
          fontFamily: "var(--font-sans)",
          flexShrink: 0,
          marginRight: 4,
        }}
      >
        {formatTime(entry.time)}
      </span>

      {/* Delete button — always visible at low opacity, full on hover; always visible on touch */}
      <button
        onClick={onDelete}
        aria-label="Remove entry"
        className="fl-delete-btn"
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "none",
          background: hovered ? "rgba(255,255,255,0.10)" : "transparent",
          color: hovered ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.22)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.15s, color 0.15s",
          padding: 0,
        }}
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
          <path
            d="M1 1 8 8M8 1 1 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
