import { useState } from "react";
import { useFoodLog } from "./useFoodLog";
import type { MealId } from "./useFoodLog";
import MealSection from "./MealSection";
import PastDayCard from "./PastDayCard";
import UndoToast from "./UndoToast";

const MEAL_ORDER: MealId[] = ["breakfast", "lunch", "dinner", "snacks"];

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const FL_STYLES = `
  @keyframes flSlideUp {
    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .fl-input::placeholder { color: rgba(255,255,255,0.25); }
  .fl-input:focus { border-color: rgba(255,255,255,0.18) !important; }
  @media (hover: none) {
    .fl-delete-btn { color: rgba(255,255,255,0.28) !important; }
  }
  @media (max-width: 400px) {
    .fl-timestamp { display: none; }
  }
`;

function CtaLink({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: hovered ? "rgba(255,255,255,0.95)" : "var(--cl-violet-light)",
        border: `1px solid ${hovered ? "rgba(124,58,237,0.80)" : "rgba(124,58,237,0.55)"}`,
        borderRadius: 20,
        padding: "7px 14px",
        textDecoration: "none",
        fontFamily: "var(--font-sans)",
        background: hovered ? "var(--cl-violet)" : "rgba(124,58,237,0.08)",
        transition: "color 0.15s, border-color 0.15s, background 0.15s",
      }}
    >
      {label}
    </a>
  );
}

export default function FoodLog() {
  const {
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
  } = useFoodLog();

  const [clearHovered, setClearHovered] = useState(false);

  return (
    <>
      <style>{FL_STYLES}</style>

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "40px 20px 100px",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 32,
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 5vw, 34px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1.1,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.3em",
              }}
            >
              <svg width="0.85em" height="0.85em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ color: "#f97316", flexShrink: 0 }}>
                <path d="M8 14Q5.5 10 5.5 6Q5.5 3 8 3Q10.5 3 10.5 6Q10.5 10 8 14Z"/>
                <path d="M7 3.5Q5.5 1.5 5 1Q5.5 0.5 7 2Q7.5 3 7 3.5Z" opacity="0.65"/>
                <path d="M8 3Q7.5 1.5 8 0.5Q8.5 1.5 8 3Z" opacity="0.5"/>
                <path d="M9 3.5Q10.5 1.5 11 1Q10.5 0.5 9 2Q8.5 3 9 3.5Z" opacity="0.65"/>
              </svg>
              Food Log
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.28)",
                marginTop: 6,
                fontFamily: "var(--font-sans)",
              }}
            >
              {formatDate(today.date)}
            </p>
          </div>

          {totalTodayEntries > 0 && (
            <button
              onClick={clearToday}
              onMouseEnter={() => setClearHovered(true)}
              onMouseLeave={() => setClearHovered(false)}
              style={{
                fontSize: 12,
                color: clearHovered ? "rgba(255,255,255,0.60)" : "rgba(255,255,255,0.32)",
                background: "none",
                border: `1px solid ${clearHovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.09)"}`,
                borderRadius: 8,
                padding: "7px 13px",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                marginTop: 4,
                transition: "color 0.15s, border-color 0.15s",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              Clear today
            </button>
          )}
        </div>

        {/* Empty state intro */}
        {totalTodayEntries === 0 && (
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.42)",
              lineHeight: 1.7,
              marginBottom: 28,
              maxWidth: 540,
              fontFamily: "var(--font-sans)",
            }}
          >
            Write down what you eat. No calories, no macros, no judgment. Just
            awareness. The first step to eating better is noticing what you eat now.
          </p>
        )}

        {/* TODAY label + card with glow */}
        <div style={{ position: "relative" }}>

          {/* Triple-color aurora glow */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "-4px -4px",
              borderRadius: 48,
              background: "linear-gradient(130deg, rgba(14,116,144,0.30) 0%, rgba(124,58,220,0.20) 52%, rgba(34,211,238,0.15) 100%)",
              filter: "blur(48px)",
              pointerEvents: "none",
            }}
          />

          <p
            style={{
              position: "relative",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.18)",
              marginBottom: 10,
              fontFamily: "var(--font-sans)",
            }}
          >
            Today
          </p>

          {/* Today's meal card */}
          <div
            style={{
              position: "relative",
              background: "var(--cl-dark-card)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              overflow: "hidden",
              marginBottom: 40,
            }}
          >
          {MEAL_ORDER.map((mealId, idx) => (
            <MealSection
              key={mealId}
              mealId={mealId}
              entries={today.meals[mealId]}
              onAdd={text => addEntry(mealId, text)}
              onDelete={id => deleteEntry(mealId, id)}
              isLast={idx === MEAL_ORDER.length - 1}
            />
          ))}
          </div>

        </div>{/* end glow wrapper */}

        {/* Past days */}
        {pastDays.length > 0 && (
          <>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.18)",
                marginBottom: 10,
                fontFamily: "var(--font-sans)",
              }}
            >
              Previous Days
            </p>
            {pastDays.map(log => (
              <PastDayCard
                key={log.date}
                log={log}
                onDelete={() => deletePastDay(log.date)}
              />
            ))}
          </>
        )}

        {/* Calculator CTAs */}
        <div
          style={{
            marginTop: 56,
            padding: "24px 20px",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.40)",
              lineHeight: 1.65,
              marginBottom: 16,
              fontFamily: "var(--font-sans)",
            }}
          >
            Logging what you eat is the first step. When you&rsquo;re ready for the
            next one, find out how much your body actually needs.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "TDEE Calculator", href: "/tdee-calculator/" },
              { label: "Protein Calculator", href: "/protein-calculator/" },
              { label: "Calorie Deficit Calculator", href: "/calorie-deficit-calculator/" },
            ].map(({ label, href }) => (
              <CtaLink key={href} label={label} href={href} />
            ))}
          </div>
        </div>
      </div>

      {undo && (
        <UndoToast
          text={undo.entry.text}
          onUndo={restoreEntry}
          onDismiss={dismissUndo}
        />
      )}
    </>
  );
}
