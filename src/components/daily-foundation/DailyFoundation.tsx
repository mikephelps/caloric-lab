import { useState, useEffect, useRef } from "react";
import { useDailyState } from "./useDailyState";
import { LiquidHeart } from "./LiquidHeart";
import { CompletedStack } from "./CompletedStack";
import { QueuePanel } from "./QueuePanel";
import { HabitGrid } from "./HabitGrid";
import { WhyThisWorks } from "./WhyThisWorks";
import type { Habit } from "./useDailyState";

const HABITS: Habit[] = [
  { id: "n1", label: "Hit your protein target", category: "Nutrition", calcKey: "cl_calc_protein", calcPage: "/protein-calculator/", dynamicLabel: v => `Hit ${v}g protein` },
  { id: "n2", label: "30g protein at breakfast", category: "Nutrition" },
  { id: "n3", label: "Hit your calorie target", category: "Nutrition", calcKey: "cl_calc_calories", calcPage: "/calorie-deficit-calculator/", dynamicLabel: v => `Stay within ${v} cal` },
  { id: "n4", label: "Eat enough fiber", category: "Nutrition" },
  { id: "n5", label: "No late-night snacking", category: "Nutrition" },
  { id: "n6", label: "Eat a vegetable every meal", category: "Nutrition" },
  { id: "n7", label: "Drink a protein shake", category: "Nutrition" },
  { id: "n8", label: "Meal prep today", category: "Nutrition" },
  { id: "h1", label: "Hit your water target", category: "Hydration", calcKey: "cl_calc_water", calcPage: "/water-intake-calculator/", dynamicLabel: v => `Drink ${v}oz water` },
  { id: "h2", label: "Water before coffee", category: "Hydration" },
  { id: "h3", label: "No sugary drinks", category: "Hydration" },
  { id: "h4", label: "Electrolytes today", category: "Hydration" },
  { id: "m1", label: "10,000 steps", category: "Movement" },
  { id: "m2", label: "30-minute walk", category: "Movement" },
  { id: "m3", label: "Strength training", category: "Movement" },
  { id: "m4", label: "Stretch for 10 minutes", category: "Movement" },
  { id: "m5", label: "Take the stairs", category: "Movement" },
  { id: "m6", label: "Stand every hour", category: "Movement" },
  { id: "r1", label: "8 hours of sleep", category: "Recovery" },
  { id: "r2", label: "No screens 1hr before bed", category: "Recovery" },
  { id: "r3", label: "Morning sunlight 10 min", category: "Recovery" },
  { id: "r4", label: "Cold exposure", category: "Recovery" },
  { id: "r5", label: "Meditate 5 minutes", category: "Recovery" },
  { id: "r6", label: "Journal today", category: "Recovery" },
  { id: "x1", label: "Track your weight", category: "Metabolic" },
  { id: "x2", label: "Take your vitamins", category: "Metabolic" },
  { id: "x3", label: "Check in with hunger cues", category: "Metabolic" },
  { id: "x4", label: "No mindless eating", category: "Metabolic" },
];

const CALC_LINKS = [
  { label: "Protein Calculator", href: "/protein-calculator/" },
  { label: "Water Intake Calculator", href: "/water-intake-calculator/" },
  { label: "TDEE Calculator", href: "/tdee-calculator/" },
  { label: "Calorie Deficit Calculator", href: "/calorie-deficit-calculator/" },
];

const ONBOARDING_STEPS = [
  { num: 1, color: "#22d3ee", bg: "rgba(34,211,238,0.10)", border: "rgba(34,211,238,0.22)", glow: "rgba(34,211,238,0.18)", title: "Pick your habits", desc: "Choose from 28 science-backed actions or create your own." },
  { num: 2, color: "oklch(72% 0.18 292)", bg: "rgba(124,58,237,0.10)", border: "rgba(124,58,237,0.22)", glow: "rgba(124,58,237,0.20)", title: "Check them off", desc: "Complete habits throughout the day. The heart fills as you go." },
  { num: 3, color: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.22)", glow: "rgba(249,115,22,0.18)", title: "Build your streak", desc: "Hit your daily target to keep the streak alive. Come back tomorrow." },
];

export default function DailyFoundation() {
  const [mounted, setMounted] = useState(false);
  const mountTime = useRef(0);
  useEffect(() => {
    mountTime.current = Date.now();
    const params = new URLSearchParams(window.location.search);
    const addId = params.get("add");
    if (addId) {
      window.history.replaceState({}, "", window.location.pathname);
      addToQueue([addId]);
    }
    setMounted(true);
  }, []);

  const {
    queue, completed, target, streak, customHabits,
    setTarget, complete, undo, startOver, addToQueue, removeFromQueue, addCustomHabit, clearAllData,
  } = useDailyState();

  const [view, setView] = useState<"action" | "browse">("action");
  const [showSettings, setShowSettings] = useState(false);

  // Render nothing until client-side mount to prevent hydration mismatch
  // (localStorage state on server vs. client would produce different output)
  if (!mounted) return <div style={{ minHeight: "100%" }} />;

  const allHabits = [...HABITS, ...customHabits];
  const hasActivity = queue.length > 0 || completed.length > 0;
  const queueHabits = queue.map(id => allHabits.find(h => h.id === id)).filter(Boolean) as Habit[];
  const completedHabits = completed.map(id => allHabits.find(h => h.id === id)).filter(Boolean) as Habit[];

  const fillPercent = target > 0 ? Math.min(100, (completed.length / target) * 100) : 0;
  const pulseSpeed = Math.max(1.4, 2.6 - (fillPercent / 100) * 1.2);

  const getLabel = (h: Habit): string => {
    if (h.calcKey && h.dynamicLabel) {
      try {
        const v = localStorage.getItem(h.calcKey);
        if (v) return h.dynamicLabel(v);
      } catch {}
    }
    return h.label;
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const streakIcon = streak.count >= 7 ? "🔥" : streak.count >= 3 ? "✨" : "⚡";

  return (
    <div style={{ minHeight: "100%", color: "#fff" }}>
      <style>{`
        @keyframes plP {
          0%,100% { box-shadow: 0 0 6px rgba(160,35,35,0.10); }
          50% { box-shadow: 0 0 16px rgba(160,35,35,0.30); }
        }
        @keyframes gentlePulse {
          0%,100% { opacity: 0.88; }
          50% { opacity: 1; }
        }
        @keyframes slideFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .df-input::placeholder { color: rgba(255,255,255,0.25); }
        .df-input:focus {
          outline: none;
          border-color: rgba(145,28,28,0.42) !important;
          box-shadow: 0 0 0 3px rgba(145,28,28,0.14);
        }
      `}</style>

      {/* Page header */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 0" }}>

        {/* Onboarding: wrap hero row in same 780px inner box the cards use */}
        {!hasActivity && view === "action" ? (
          <div style={{ maxWidth: 780, margin: "0 auto", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{
                  fontFamily: "var(--font-display)", fontSize: "clamp(26px, 5vw, 34px)",
                  fontWeight: 800, letterSpacing: "-0.02em",
                  color: "rgba(255,255,255,0.92)", lineHeight: 1.1,
                }}>
                  Habit Tracker
                </h1>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", marginTop: 6, fontFamily: "var(--font-sans)" }}>
                  {today}
                </p>
                <p style={{
                  fontSize: "clamp(13px, 2vw, 15px)", color: "rgba(255,255,255,0.50)",
                  marginTop: 10, fontFamily: "var(--font-sans)", lineHeight: 1.65,
                  maxWidth: 480,
                }}>
                  Pick the habits that move the needle, check them off as you go, and build a streak worth keeping.
                </p>
              </div>
              <div style={{ width: 220, flexShrink: 0, marginLeft: 24 }}>
                <LiquidHeart fillPercent={0} completedCount={0} targetCount={target} />
              </div>
            </div>
          </div>
        ) : (
          /* Active / browse state: full-width header row */
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-display)", fontSize: "clamp(26px, 5vw, 34px)",
                fontWeight: 800, letterSpacing: "-0.02em",
                color: "rgba(255,255,255,0.92)", lineHeight: 1.1,
              }}>
                Habit Tracker
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", marginTop: 6, fontFamily: "var(--font-sans)" }}>
                {today}
              </p>
              <p style={{
                fontSize: "clamp(13px, 2vw, 15px)", color: "rgba(255,255,255,0.50)",
                marginTop: 10, fontFamily: "var(--font-sans)", lineHeight: 1.65,
                maxWidth: 600,
              }}>
                Pick the habits that move the needle, check them off as you go, and build a streak worth keeping. Connect your calculator results for personalized daily targets.
              </p>
            </div>
          {/* Normal header right: streak badge + settings */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              {streak.count > 0 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 20,
                  background: "rgba(255,130,30,0.08)", border: "1px solid rgba(255,130,30,0.16)",
                }}>
                  <span style={{ fontSize: 13, lineHeight: 1 }}>{streakIcon}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,165,80,0.85)", fontFamily: "var(--font-sans)" }}>
                    {streak.count} Day Streak
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowSettings(s => !s)}
                aria-label="Settings"
                aria-expanded={showSettings}
                style={{
                  padding: 9, borderRadius: 10,
                  background: showSettings ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.035)",
                  border: `1px solid ${showSettings ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)"}`,
                  color: showSettings ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                }}
                onMouseLeave={e => {
                  if (!showSettings) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.035)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  }
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Settings panel */}
        {showSettings && (
          <div style={{
            padding: "20px 22px", borderRadius: 14, marginBottom: 24,
            background: "var(--cl-dark-card)", border: "1px solid rgba(255,255,255,0.07)",
            animation: "slideFadeUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            {/* Target control */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.62)", fontFamily: "var(--font-sans)" }}>
                  Daily Fulfillment Target
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 3, fontFamily: "var(--font-sans)" }}>
                  How many wins make a great day?
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button onClick={() => setTarget(t => Math.max(1, t - 1))} style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.78)", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)", transition: "all 0.15s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}>−</button>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, minWidth: 32, textAlign: "center", color: "rgba(255,255,255,0.90)" }}>
                  {target}
                </span>
                <button onClick={() => setTarget(t => Math.min(15, t + 1))} style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.78)", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)", transition: "all 0.15s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}>+</button>
              </div>
            </div>
            {/* Info + clear data */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-sans)", lineHeight: 1.6, maxWidth: 360 }}>
                Calculators personalize your habit targets. Visit the{" "}
                <a href="/protein-calculator/" style={{ color: "rgba(255,255,255,0.40)", textDecoration: "none" }}>protein</a>
                {" or "}
                <a href="/water-intake-calculator/" style={{ color: "rgba(255,255,255,0.40)", textDecoration: "none" }}>water intake</a>
                {" calculator to get your numbers."}
              </p>
              <button
                onClick={clearAllData}
                style={{
                  flexShrink: 0, fontSize: 12, padding: "6px 14px", borderRadius: 8,
                  background: "rgba(160,35,35,0.09)", border: "1px solid rgba(160,35,35,0.18)",
                  color: "rgba(190,80,80,0.72)", cursor: "pointer",
                  fontFamily: "var(--font-sans)", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(160,35,35,0.20)"; e.currentTarget.style.color = "rgba(210,90,90,0.92)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(160,35,35,0.09)"; e.currentTarget.style.color = "rgba(190,80,80,0.72)"; }}
              >
                Clear all my data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* ── Action view ── */}
        {view === "action" && (
          hasActivity ? (
            /* Two-column layout when there's activity */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Heart + crushed it + completed */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <LiquidHeart
                  fillPercent={fillPercent}
                  completedCount={completed.length}
                  targetCount={target}
                />

                {fillPercent >= 100 && (
                  <div style={{
                    width: "100%", padding: "18px 22px", borderRadius: 14,
                    background: "rgba(145,28,28,0.10)", border: "1px solid rgba(145,28,28,0.20)",
                    textAlign: "center",
                    animation: "slideFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1), gentlePulse 3s ease-in-out 0.6s infinite",
                  }}>
                    <p style={{
                      fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)",
                      color: "rgba(255,195,195,0.92)", letterSpacing: "-0.02em",
                    }}>
                      You crushed it today.
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(255,145,145,0.65)", marginTop: 6, fontFamily: "var(--font-sans)", lineHeight: 1.6 }}>
                      Want to dial in your targets?{" "}
                      <a href="/protein-calculator/" style={{ color: "rgba(255,195,195,0.92)", textDecoration: "none" }}>
                        Try a calculator ›
                      </a>
                    </p>
                  </div>
                )}

                <CompletedStack
                  completedHabits={completedHabits}
                  getLabel={getLabel}
                  pulseSpeed={pulseSpeed}
                  mountTime={mountTime.current}
                  onUndo={undo}
                />
              </div>

              {/* Right: Queue panel */}
              <div>
                <QueuePanel
                  queueHabits={queueHabits}
                  getLabel={getLabel}
                  onComplete={complete}
                  onRemove={removeFromQueue}
                  onStartOver={startOver}
                  onAddMore={() => setView("browse")}
                />
              </div>
            </div>
          ) : (
            /* Empty state — onboarding */
            <div style={{ paddingTop: 8 }}>

              {/* 3-step cards — main focus */}
              <div style={{ position: "relative", width: "100%", maxWidth: 780, margin: "0 auto" }}>
                {/* Ambient glow behind the row */}
                <div style={{
                  position: "absolute", inset: "-40px",
                  background: "linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(124,58,237,0.13) 50%, rgba(249,115,22,0.08) 100%)",
                  borderRadius: 40, filter: "blur(36px)", pointerEvents: "none",
                }} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ position: "relative" }}>
                  {ONBOARDING_STEPS.map(step => (
                    <div key={step.num} style={{
                      padding: "28px 22px 30px",
                      borderRadius: 18,
                      background: "rgba(255,255,255,0.032)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      textAlign: "center",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                      backdropFilter: "blur(8px)",
                    }}>
                      {/* Numbered badge */}
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: step.bg,
                        border: `1.5px solid ${step.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 0 24px ${step.glow}`,
                        flexShrink: 0,
                      }}>
                        <span style={{
                          fontSize: 18, fontWeight: 800, color: step.color,
                          fontFamily: "var(--font-display)", lineHeight: 1,
                        }}>
                          {step.num}
                        </span>
                      </div>
                      <h3 style={{
                        fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                        color: "rgba(255,255,255,0.90)", fontFamily: "var(--font-display)", margin: 0,
                      }}>
                        {step.title}
                      </h3>
                      <p style={{
                        fontSize: 13, color: "rgba(255,255,255,0.42)",
                        lineHeight: 1.7, fontFamily: "var(--font-sans)", margin: 0,
                      }}>
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA — full width of cards */}
              <div style={{ width: "100%", maxWidth: 780, margin: "16px auto 0", display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  onClick={() => setView("browse")}
                  style={{
                    width: "100%", padding: "16px 0", borderRadius: 14, fontSize: 15, fontWeight: 700,
                    fontFamily: "var(--font-sans)", cursor: "pointer",
                    background: "var(--cl-violet)", border: "none",
                    color: "#fff", transition: "all 0.2s",
                    boxShadow: "0 4px 28px rgba(124,58,237,0.35)",
                    letterSpacing: "-0.01em",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "var(--cl-violet-dark)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 8px 36px rgba(124,58,237,0.45)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--cl-violet)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 28px rgba(124,58,237,0.35)";
                  }}
                >
                  Build your daily queue
                </button>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-sans)", textAlign: "center" }}>
                  No account needed. Everything stays on your device.
                </p>
              </div>

            </div>
          )
        )}

        {/* ── Browse view ── */}
        {view === "browse" && (
          <HabitGrid
            allHabits={allHabits}
            queue={queue}
            completed={completed}
            customHabits={customHabits}
            onAddCustom={addCustomHabit}
            onAddToQueue={addToQueue}
            onBack={() => setView("action")}
            hasActivity={hasActivity}
            getLabel={getLabel}
          />
        )}

        {/* Divider */}
        <div style={{
          margin: "52px 0 44px",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }} />

        {/* Why This Works */}
        <WhyThisWorks />

        {/* SEO content */}
        <section style={{ marginTop: 52 }} aria-label="About daily habit tracking">
          <h2 style={{
            fontSize: "clamp(19px, 3vw, 22px)", fontWeight: 700,
            fontFamily: "var(--font-display)", letterSpacing: "-0.02em",
            color: "rgba(255,255,255,0.72)", marginBottom: 22, lineHeight: 1.2,
          }}>
            The Science Behind Daily Habit Tracking
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              "Consistency is the most powerful force in metabolic health. Research on habit formation consistently shows that daily repetition — not perfection — drives the behavioral changes that produce lasting results. The daily foundation method works because it reduces friction: instead of planning each day from scratch, you build a reliable queue of habits and execute.",
              "Tracking your habits creates what behavioral scientists call a commitment device — a visible record that creates a mild psychological pressure to maintain your streak. This isn't about guilt; it's about giving your future self a running start. Studies on habit-tracking apps show that users who maintain streaks of 21+ days are significantly more likely to sustain behavior changes at 6 months.",
              "The calculators on CaloricLab exist to turn vague intentions into specific targets. \"Eat more protein\" is hard to measure. \"Hit 142g protein\" is binary: you either did or you didn't. When your habit tracker connects to your calculator results, every habit becomes a concrete, achievable goal.",
              "Start with 3–5 habits per day — enough to feel meaningful, few enough to remain achievable on a hard day. As your habits solidify over 4–6 weeks of consistent execution, gradually increase your daily target. The heart fills a little more each day, and so do you.",
            ].map((text, i) => (
              <p key={i} style={{
                fontSize: 15, color: "rgba(255,255,255,0.38)", lineHeight: 1.85,
                fontFamily: "var(--font-sans)",
              }}>
                {text}
              </p>
            ))}
          </div>

          {/* Calculator cross-links */}
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CALC_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                  fontFamily: "var(--font-sans)", textDecoration: "none",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.38)", transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.target as HTMLElement;
                  el.style.color = "rgba(255,255,255,0.72)";
                  el.style.borderColor = "rgba(255,255,255,0.16)";
                  el.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={e => {
                  const el = e.target as HTMLElement;
                  el.style.color = "rgba(255,255,255,0.38)";
                  el.style.borderColor = "rgba(255,255,255,0.08)";
                  el.style.background = "rgba(255,255,255,0.03)";
                }}
              >
                {link.label} →
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
