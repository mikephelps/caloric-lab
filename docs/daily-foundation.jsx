import { useState, useEffect, useCallback, useRef } from "react";

const HABITS = [
  { id: "n1", label: "Hit your protein target", category: "Nutrition", calcKey: "cl_calc_protein", dynamicLabel: (v) => `Hit ${v}g protein` },
  { id: "n2", label: "30g protein at breakfast", category: "Nutrition" },
  { id: "n3", label: "Hit your calorie target", category: "Nutrition", calcKey: "cl_calc_calories", dynamicLabel: (v) => `Stay within ${v} cal` },
  { id: "n4", label: "Eat enough fiber", category: "Nutrition" },
  { id: "n5", label: "No late-night snacking", category: "Nutrition" },
  { id: "n6", label: "Eat a vegetable every meal", category: "Nutrition" },
  { id: "n7", label: "Drink a protein shake", category: "Nutrition" },
  { id: "n8", label: "Meal prep today", category: "Nutrition" },
  { id: "h1", label: "Hit your water target", category: "Hydration", calcKey: "cl_calc_water", dynamicLabel: (v) => `Drink ${v}oz water` },
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

const CATEGORIES = ["All", "Nutrition", "Hydration", "Movement", "Recovery", "Metabolic"];
const CATEGORY_COLORS = { Nutrition: "#e07a5f", Hydration: "#81b29a", Movement: "#f2cc8f", Recovery: "#9a8ec4", Metabolic: "#e8a87c", Custom: "#c4737e" };

const WHY_SNIPPETS = [
  { title: "Protein & Muscle Synthesis", text: "Distributing protein across meals maximizes muscle protein synthesis. Research shows 25-40g per meal is the sweet spot for most adults.", linkText: "Find your target" },
  { title: "Morning Light & Circadian Rhythm", text: "Exposure to bright light within 30-60 minutes of waking anchors your circadian clock, improving sleep quality and daytime alertness.", linkText: null },
  { title: "Hydration & Cognition", text: "Even mild dehydration (1-2% body weight loss) impairs concentration, mood, and working memory. Most people underestimate their needs.", linkText: "Calculate yours" },
  { title: "Habit Stacking", text: "Linking new behaviors to existing routines dramatically increases adherence. Small wins compound over time into transformative change.", linkText: null },
];

const LS = {
  get: (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  remove: (key) => { try { localStorage.removeItem(key); } catch {} },
};
const todayStr = () => new Date().toISOString().slice(0, 10);

function MiniHeart({ size = 11, color = "rgba(190,50,50,0.6)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// Heart path: wide round lobes, deep center dip, full bottom — matches reference
const HEART_PATH = "M140 250 C140 250 15 175 15 85 C15 35 55 5 95 5 C115 5 132 18 140 32 C148 18 165 5 185 5 C225 5 265 35 265 85 C265 175 140 250 140 250Z";
// viewBox is 280x260, heart center mass is around y=115

function CarbonationBurst({ active }) {
  const canvasRef = useRef(null);
  const orbsRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = 360;
    const h = canvas.height = 360;

    const spawn = () => {
      for (let i = 0; i < 30; i++) {
        orbsRef.current.push({
          x: 120 + Math.random() * 120, y: 150 + Math.random() * 80,
          r: 1.5 + Math.random() * 4.5, vx: (Math.random() - 0.5) * 2.5, vy: -(2 + Math.random() * 5),
          opacity: 0.5 + Math.random() * 0.5, life: 1, decay: 0.005 + Math.random() * 0.007, hue: 348 + Math.random() * 16,
        });
      }
    };
    spawn(); setTimeout(spawn, 250); setTimeout(spawn, 550); setTimeout(spawn, 900);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      orbsRef.current = orbsRef.current.filter(o => o.life > 0);
      orbsRef.current.forEach(o => {
        o.x += o.vx + Math.sin(Date.now() * 0.004 + o.x) * 0.4;
        o.y += o.vy; o.vy *= 0.985; o.life -= o.decay; o.r *= 0.997;
        const a = o.life * o.opacity;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},65%,58%,${a})`); g.addColorStop(0.5, `hsla(${o.hue},55%,45%,${a*0.5})`); g.addColorStop(1, `hsla(${o.hue},50%,35%,0)`);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 3, 0, Math.PI * 2);
        const gl = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 3);
        gl.addColorStop(0, `hsla(${o.hue},65%,55%,${a*0.15})`); gl.addColorStop(1, `hsla(${o.hue},65%,55%,0)`);
        ctx.fillStyle = gl; ctx.fill();
      });
      if (orbsRef.current.length > 0) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); orbsRef.current = []; };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 360, height: 360, pointerEvents: "none", zIndex: 10 }} />;
}

function LiquidHeart({ fillPercent, completedCount, targetCount }) {
  const intensity = fillPercent / 100;
  const glowR = 6 + intensity * 28;
  const glowO = 0.1 + intensity * 0.45;
  const ps = 2.6 - intensity * 1.2;
  const isFull = fillPercent >= 100;
  const [showBurst, setShowBurst] = useState(false);
  const prev = useRef(fillPercent);

  useEffect(() => {
    if (fillPercent >= 100 && prev.current < 100) { setShowBurst(true); setTimeout(() => setShowBurst(false), 3500); }
    prev.current = fillPercent;
  }, [fillPercent]);

  const liquidTop = isFull ? -5 : (255 - (fillPercent / 100) * 255);
  const waveY = liquidTop;

  // Wave amplitude scales with fill — subtle at low fill, dramatic when full
  const ampBase = 4 + intensity * 10; // 4px at empty, 14px at full
  const amp1 = ampBase;
  const amp2 = ampBase * 0.7;
  const amp3 = ampBase * 0.45;

  // Wave speed also increases with fill
  const speed1 = 4 - intensity * 2; // 4s at empty, 2s at full
  const speed2 = 5 - intensity * 2.5; // opposite direction, slightly different speed
  const speed3 = 3.5 - intensity * 1.5;

  const ringBase = 0.08 + intensity * 0.12;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes hbP{0%,100%{filter:drop-shadow(0 0 ${glowR}px rgba(170,35,35,${glowO}));transform:scale(1)}50%{filter:drop-shadow(0 0 ${glowR*1.5}px rgba(170,35,35,${glowO*1.25}));transform:scale(1.015)}}
        @keyframes hbF{0%,100%{filter:drop-shadow(0 0 36px rgba(170,35,35,0.7)) drop-shadow(0 0 72px rgba(150,25,25,0.3));transform:scale(1)}50%{filter:drop-shadow(0 0 52px rgba(180,40,40,0.8)) drop-shadow(0 0 96px rgba(155,30,30,0.4));transform:scale(1.03)}}
        @keyframes lW1{0%{transform:translateX(0)}100%{transform:translateX(-200px)}}
        @keyframes lW2{0%{transform:translateX(-200px)}100%{transform:translateX(0)}}
        @keyframes lW3{0%{transform:translateX(-50px)}100%{transform:translateX(-250px)}}
        @keyframes lBob{0%,100%{transform:translateY(0)}50%{transform:translateY(${3 + intensity * 5}px)}}
      `}</style>
      <CarbonationBurst active={showBurst} />
      <svg viewBox="-35 -35 350 330" style={{ width: "100%", animation: isFull ? "hbF 1.8s ease-in-out infinite" : `hbP ${ps}s ease-in-out infinite` }}>
        <defs>
          <clipPath id="hc"><path d={HEART_PATH} /></clipPath>
          <linearGradient id="lq" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#7a1616" /><stop offset="45%" stopColor="#a82828" /><stop offset="100%" stopColor="#bf3030" />
          </linearGradient>
          <linearGradient id="lqLight" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#8a1e1e" /><stop offset="50%" stopColor="#c43535" /><stop offset="100%" stopColor="#d44040" />
          </linearGradient>
          <linearGradient id="lqDark" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#5e1010" /><stop offset="50%" stopColor="#7a1a1a" /><stop offset="100%" stopColor="#922222" />
          </linearGradient>
        </defs>

        {/* Ring 3 */}
        <path d={HEART_PATH} fill="none" stroke={`rgba(190,60,60,${ringBase * 0.2})`} strokeWidth="1" transform="translate(-14,-12) scale(1.1)" />
        {/* Ring 2 */}
        <path d={HEART_PATH} fill="none" stroke={`rgba(190,60,60,${ringBase * 0.5})`} strokeWidth="1" transform="translate(-7,-6) scale(1.05)" />
        {/* Ring 1 */}
        <path d={HEART_PATH} fill="none" stroke={`rgba(190,60,60,${ringBase})`} strokeWidth="1.5" />

        {/* Heart background */}
        <path d={HEART_PATH} fill="rgba(25,6,6,0.45)" />

        {/* Liquid fill — multi-layer wave system */}
        <g clipPath="url(#hc)">
          {/* Base liquid with gentle vertical bob */}
          <g style={{ animation: `lBob ${3.5 - intensity * 1.5}s ease-in-out infinite` }}>
            <rect x="-10" y={liquidTop} width="300" height={280} fill="url(#lq)" style={{ transition: "y 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
          </g>

          {fillPercent > 0 && (<>
            {/* Wave 1 — primary surface wave, moves right */}
            <g style={{ animation: `lW1 ${speed1}s linear infinite` }}>
              <path d={`M-200 ${waveY} Q-150 ${waveY-amp1} -100 ${waveY} Q-50 ${waveY+amp1} 0 ${waveY} Q50 ${waveY-amp1} 100 ${waveY} Q150 ${waveY+amp1} 200 ${waveY} Q250 ${waveY-amp1} 300 ${waveY} Q350 ${waveY+amp1} 400 ${waveY} Q450 ${waveY-amp1} 500 ${waveY} V280 H-200Z`} fill="url(#lqLight)" opacity={0.35 + intensity * 0.2} />
            </g>

            {/* Wave 2 — counter-direction, lighter color, creates churn */}
            <g style={{ animation: `lW2 ${speed2}s linear infinite` }}>
              <path d={`M-200 ${waveY + 6} Q-140 ${waveY + 6 - amp2} -80 ${waveY + 6} Q-20 ${waveY + 6 + amp2} 40 ${waveY + 6} Q100 ${waveY + 6 - amp2} 160 ${waveY + 6} Q220 ${waveY + 6 + amp2} 280 ${waveY + 6} Q340 ${waveY + 6 - amp2} 400 ${waveY + 6} Q460 ${waveY + 6 + amp2} 520 ${waveY + 6} V280 H-200Z`} fill="url(#lqDark)" opacity={0.3 + intensity * 0.25} />
            </g>

            {/* Wave 3 — deep interior movement, visible through the liquid body */}
            {fillPercent > 20 && (
              <g style={{ animation: `lW3 ${speed3}s linear infinite` }}>
                <path d={`M-200 ${waveY + 30 + intensity * 20} Q-130 ${waveY + 30 + intensity * 20 - amp3} -60 ${waveY + 30 + intensity * 20} Q10 ${waveY + 30 + intensity * 20 + amp3} 80 ${waveY + 30 + intensity * 20} Q150 ${waveY + 30 + intensity * 20 - amp3} 220 ${waveY + 30 + intensity * 20} Q290 ${waveY + 30 + intensity * 20 + amp3} 360 ${waveY + 30 + intensity * 20} Q430 ${waveY + 30 + intensity * 20 - amp3} 500 ${waveY + 30 + intensity * 20} V280 H-200Z`} fill="url(#lqLight)" opacity={0.12 + intensity * 0.15} />
              </g>
            )}

            {/* Wave 4 — very deep, only visible at higher fills, adds undersea movement feel */}
            {fillPercent > 50 && (
              <g style={{ animation: `lW1 ${speed1 * 1.3}s linear infinite` }}>
                <path d={`M-200 ${waveY + 60 + intensity * 30} Q-120 ${waveY + 60 + intensity * 30 - amp3 * 0.8} -40 ${waveY + 60 + intensity * 30} Q40 ${waveY + 60 + intensity * 30 + amp3 * 0.8} 120 ${waveY + 60 + intensity * 30} Q200 ${waveY + 60 + intensity * 30 - amp3 * 0.8} 280 ${waveY + 60 + intensity * 30} Q360 ${waveY + 60 + intensity * 30 + amp3 * 0.8} 440 ${waveY + 60 + intensity * 30} V280 H-200Z`} fill="url(#lqDark)" opacity={0.1 + intensity * 0.12} />
              </g>
            )}
          </>)}
        </g>

        {/* Heart outline on top */}
        <path d={HEART_PATH} fill="none" stroke="rgba(190,60,60,0.18)" strokeWidth="1.5" />

        {/* Counter */}
        <text x="140" y="115" textAnchor="middle" dominantBaseline="central" fontFamily="'Playfair Display',Georgia,serif" fontSize="26" fontWeight="700" fill={fillPercent > 42 ? "rgba(255,255,255,0.88)" : "rgba(255,170,170,0.35)"} style={{ transition: "fill 0.5s" }}>
          {completedCount} of {targetCount}
        </text>
      </svg>
    </div>
  );
}

function CompletedPill({ label, pulseSpeed, onUndo }) {
  return (
    <button onClick={onUndo}
      style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 14px", borderRadius: 10,
        background: "rgba(145,28,28,0.14)", border: "1px solid rgba(165,38,38,0.22)",
        color: "rgba(255,195,195,0.85)", cursor: "pointer", transition: "all 0.15s",
        animation: `plP ${pulseSpeed}s ease-in-out infinite`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, textAlign: "left",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(145,28,28,0.22)"; e.currentTarget.style.borderColor = "rgba(180,45,45,0.35)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(145,28,28,0.14)"; e.currentTarget.style.borderColor = "rgba(165,38,38,0.22)"; }}
    >
      <MiniHeart size={12} color="rgba(190,50,50,0.55)" />
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>undo</span>
    </button>
  );
}

function QueueItem({ habit, onComplete, label }) {
  const [press, setPress] = useState(false);
  return (
    <div onClick={() => { setPress(true); setTimeout(() => onComplete(habit.id), 350); }}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, cursor: "pointer",
        background: press ? "rgba(150,35,35,0.1)" : "rgba(255,255,255,0.035)",
        border: `1px solid ${press ? "rgba(150,35,35,0.22)" : "rgba(255,255,255,0.07)"}`, transition: "all 0.2s",
      }}
      onMouseEnter={e => { if (!press) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(150,35,35,0.18)"; } }}
      onMouseLeave={e => { if (!press) { e.currentTarget.style.background = "rgba(255,255,255,0.035)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; } }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${press ? "rgba(160,40,40,0.55)" : "rgba(255,255,255,0.13)"}`,
        background: press ? "rgba(160,40,40,0.18)" : "transparent", transition: "all 0.2s",
      }}>
        {press && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,180,180,0.9)" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
      </div>
      <span style={{ width: 4, height: 22, borderRadius: 2, background: CATEGORY_COLORS[habit.category] || "#c4737e", flexShrink: 0 }} />
      <span style={{
        flex: 1, fontSize: 14, color: "rgba(255,255,255,0.82)", fontFamily: "'DM Sans',sans-serif",
        opacity: press ? 0.35 : 1, transform: press ? "translateX(-6px)" : "none",
        transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {label}
        {habit.calcKey && (() => { try { return !localStorage.getItem(habit.calcKey); } catch { return false; } })() && (
          <span style={{ marginLeft: 8, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Personalize</span>
        )}
      </span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", opacity: press ? 0 : 1, transition: "opacity 0.2s" }}>
        tap to complete
      </span>
    </div>
  );
}

export default function DailyFoundation() {
  const [queue, setQueue] = useState(() => LS.get("cl_daily_queue", []));
  const [completed, setCompleted] = useState(() => { const d = LS.get("cl_daily_completed", { date: "", items: [] }); return d.date === todayStr() ? d.items : []; });
  const [target, setTarget] = useState(() => LS.get("cl_daily_target", 5));
  const [streak, setStreak] = useState(() => LS.get("cl_daily_streak", { count: 0, lastDate: "" }));
  const [customHabits, setCustomHabits] = useState(() => LS.get("cl_daily_custom", []));
  const [activeFilter, setActiveFilter] = useState("All");
  const [gridSelection, setGridSelection] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [snippetIdx] = useState(() => Math.floor(Math.random() * WHY_SNIPPETS.length));
  const [view, setView] = useState("action");

  const allHabits = [...HABITS, ...customHabits];
  const hasActivity = queue.length > 0 || completed.length > 0;

  useEffect(() => { LS.set("cl_daily_queue", queue); }, [queue]);
  useEffect(() => { LS.set("cl_daily_completed", { date: todayStr(), items: completed }); }, [completed]);
  useEffect(() => { LS.set("cl_daily_target", target); }, [target]);
  useEffect(() => { LS.set("cl_daily_streak", streak); }, [streak]);
  useEffect(() => { LS.set("cl_daily_custom", customHabits); }, [customHabits]);

  useEffect(() => {
    const d = LS.get("cl_daily_completed", { date: "", items: [] });
    if (d.date !== todayStr()) {
      const y = new Date(); y.setDate(y.getDate() - 1); const yS = y.toISOString().slice(0, 10);
      if (d.date === yS && d.items.length >= target) setStreak(s => ({ count: s.count + 1, lastDate: yS }));
      else if (d.date !== yS) setStreak({ count: 0, lastDate: "" });
    }
  }, []);

  const getLabel = h => {
    if (h.calcKey && h.dynamicLabel) { try { const v = localStorage.getItem(h.calcKey); if (v) return h.dynamicLabel(v); } catch {} }
    return h.label;
  };

  const handleComplete = useCallback(id => { setCompleted(p => [...p, id]); setQueue(p => p.filter(q => q !== id)); }, []);
  const handleUndo = useCallback(id => { setCompleted(p => p.filter(c => c !== id)); setQueue(p => [...p, id]); }, []);
  const resetDay = () => { setQueue([]); setCompleted([]); };

  const addToQueue = () => {
    setQueue(p => [...p, ...gridSelection.filter(id => !p.includes(id) && !completed.includes(id))]);
    setGridSelection([]);
    setView("action");
  };

  const addCustom = () => {
    if (!customInput.trim() || customHabits.length >= 10) return;
    setCustomHabits(p => [...p, { id: `c${Date.now()}`, label: customInput.trim(), category: "Custom" }]);
    setCustomInput("");
  };

  const fp = target > 0 ? Math.min(100, (completed.length / target) * 100) : 0;
  const ps = 2.6 - (fp / 100) * 1.2;
  const qH = queue.map(id => allHabits.find(h => h.id === id)).filter(Boolean);
  const cH = completed.map(id => allHabits.find(h => h.id === id)).filter(Boolean);
  const sn = WHY_SNIPPETS[snippetIdx];
  const cats = customHabits.length > 0 ? [...CATEGORIES, "Custom"] : CATEGORIES;
  const fH = activeFilter === "All" ? allHabits : allHabits.filter(h => h.category === activeFilter);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#0a0a0c 0%,#101016 50%,#0c0c11 100%)", color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes plP{0%,100%{box-shadow:0 0 6px rgba(160,35,35,0.1)}50%{box-shadow:0 0 14px rgba(160,35,35,0.25)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gentlePulse{0%,100%{opacity:0.85}50%{opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0}button{font-family:inherit}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Daily Foundation</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", marginTop: 4 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {streak.count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: "rgba(255,130,30,0.08)", border: "1px solid rgba(255,130,30,0.15)" }}>
              <span style={{ fontSize: 13 }}>{streak.count >= 7 ? String.fromCodePoint(0x1F525) : streak.count >= 3 ? String.fromCodePoint(0x2728) : String.fromCodePoint(0x26A1)}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,165,80,0.8)" }}>Day {streak.count}</span>
            </div>
          )}
          <button onClick={() => setShowSettings(!showSettings)} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)", cursor: "pointer", display: "flex" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </button>
        </div>
      </header>

      {showSettings && (
        <div style={{ maxWidth: 960, margin: "0 auto 12px", padding: "0 24px" }}>
          <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Daily Fulfillment Target</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", marginTop: 2 }}>How many wins make a great day?</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setTarget(t => Math.max(1, t - 1))} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600, minWidth: 28, textAlign: "center" }}>{target}</span>
                <button onClick={() => setTarget(t => Math.min(15, t + 1))} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <button onClick={() => { LS.remove("cl_daily_queue"); LS.remove("cl_daily_completed"); LS.remove("cl_daily_target"); LS.remove("cl_daily_streak"); LS.remove("cl_daily_custom"); window.location.reload(); }} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, background: "rgba(160,35,35,0.08)", border: "1px solid rgba(160,35,35,0.15)", color: "rgba(190,80,80,0.65)", cursor: "pointer" }}>Clear all my data</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>

        {view === "action" && (
          <div style={{ display: "grid", gap: 32, gridTemplateColumns: hasActivity ? "1fr 1fr" : "1fr" }}>
            {/* Left: Heart + Crushed It + Completed */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <LiquidHeart fillPercent={fp} completedCount={completed.length} targetCount={target} />

              {/* "You crushed it" — above completed list */}
              {fp >= 100 && (
                <div style={{ width: "100%", padding: 16, borderRadius: 12, background: "rgba(145,28,28,0.08)", border: "1px solid rgba(145,28,28,0.14)", textAlign: "center", animation: "fadeUp 0.6s ease-out, gentlePulse 3s ease-in-out infinite" }}>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,195,195,0.88)", fontFamily: "'Playfair Display',serif" }}>You crushed it today.</p>
                  <p style={{ fontSize: 12, color: "rgba(255,145,145,0.4)", marginTop: 4 }}>Want to dial in your targets? Try a calculator</p>
                </div>
              )}

              {cH.length > 0 && (
                <div style={{ width: "100%" }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.18)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Completed</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {cH.map(h => <CompletedPill key={h.id} label={getLabel(h)} pulseSpeed={ps} onUndo={() => handleUndo(h.id)} />)}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Queue */}
            {hasActivity && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.18)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{qH.length > 0 ? "Today's Queue" : "All Done"}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={resetDay} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.28)", cursor: "pointer" }}>Start over</button>
                    <button onClick={() => setView("browse")} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.28)", cursor: "pointer" }}>+ Add more</button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {qH.map(h => <QueueItem key={h.id} habit={h} label={getLabel(h)} onComplete={handleComplete} />)}
                </div>
                {qH.length === 0 && (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(255,255,255,0.15)" }}>
                    <p style={{ fontSize: 14, fontFamily: "'Playfair Display',serif" }}>Queue clear.</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Everything's in the heart.</p>
                  </div>
                )}
              </div>
            )}

            {!hasActivity && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                <button onClick={() => setView("browse")} style={{ marginTop: 16, padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 600, background: "rgba(145,28,28,0.14)", border: "1px solid rgba(145,28,28,0.22)", color: "rgba(255,180,180,0.88)", cursor: "pointer" }}>Build Your Daily Queue</button>
              </div>
            )}
          </div>
        )}

        {view === "browse" && (
          <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <p style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Playfair Display',serif" }}>Choose Your Habits</p>
              {hasActivity && (
                <button onClick={() => setView("action")} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>Back to queue</button>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
              {cats.map(c => (
                <button key={c} onClick={() => setActiveFilter(c)} style={{
                  padding: "5px 12px", borderRadius: 16, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                  background: activeFilter === c ? (c === "All" ? "rgba(255,255,255,0.09)" : `${CATEGORY_COLORS[c]}18`) : "rgba(255,255,255,0.025)",
                  border: `1px solid ${activeFilter === c ? (c === "All" ? "rgba(255,255,255,0.16)" : `${CATEGORY_COLORS[c]}38`) : "rgba(255,255,255,0.06)"}`,
                  color: activeFilter === c ? (c === "All" ? "rgba(255,255,255,0.7)" : CATEGORY_COLORS[c]) : "rgba(255,255,255,0.28)",
                }}>{c}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
              {fH.map(h => {
                const inQ = queue.includes(h.id), done = completed.includes(h.id), sel = gridSelection.includes(h.id), dis = inQ || done;
                return (
                  <button key={h.id} onClick={() => { if (dis) return; setGridSelection(p => sel ? p.filter(i => i !== h.id) : [...p, h.id]); }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 18, fontSize: 12, fontWeight: 500,
                      background: sel ? "rgba(145,28,28,0.14)" : dis ? "rgba(255,255,255,0.012)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${sel ? "rgba(145,28,28,0.35)" : dis ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.07)"}`,
                      color: dis ? "rgba(255,255,255,0.15)" : sel ? "rgba(255,175,175,0.88)" : "rgba(255,255,255,0.5)",
                      cursor: dis ? "default" : "pointer", transition: "all 0.2s", transform: sel ? "scale(1.03)" : "scale(1)",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: CATEGORY_COLORS[h.category], flexShrink: 0, opacity: dis ? 0.18 : 1 }} />
                    {getLabel(h)}
                    {sel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(190,50,50,0.75)" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    {dis && <span style={{ fontSize: 9, opacity: 0.3 }}>{done ? "done" : "queued"}</span>}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustom()}
                placeholder={customHabits.length >= 10 ? "Custom limit reached (10)" : "Add your own habit..."} disabled={customHabits.length >= 10}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#fff", outline: "none", fontFamily: "'DM Sans',sans-serif" }}
              />
              <button onClick={addCustom} disabled={!customInput.trim() || customHabits.length >= 10}
                style={{
                  padding: "10px 18px", borderRadius: 12, fontSize: 14, fontWeight: 600,
                  background: customInput.trim() ? "rgba(145,28,28,0.14)" : "rgba(255,255,255,0.025)",
                  border: `1px solid ${customInput.trim() ? "rgba(145,28,28,0.28)" : "rgba(255,255,255,0.05)"}`,
                  color: customInput.trim() ? "rgba(255,175,175,0.88)" : "rgba(255,255,255,0.12)",
                  cursor: customInput.trim() ? "pointer" : "default",
                }}>+</button>
            </div>

            {gridSelection.length > 0 && (
              <button onClick={addToQueue}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 12, fontSize: 14, fontWeight: 600,
                  background: "linear-gradient(135deg,rgba(145,28,28,0.22),rgba(120,20,20,0.18))",
                  border: "1px solid rgba(145,28,28,0.32)", color: "rgba(255,190,190,0.92)",
                  cursor: "pointer", animation: "fadeUp 0.3s ease-out",
                }}>Add {gridSelection.length} to today's queue</button>
            )}
          </div>
        )}

        <div style={{ margin: "40px 0", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.045),transparent)" }} />

        <div style={{ borderRadius: 14, padding: 22, marginBottom: 40, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.15)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Why This Works</p>
          <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Playfair Display',serif", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>{sn.title}</h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>{sn.text}</p>
          {sn.linkText && <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(160,40,40,0.5)", cursor: "pointer", marginTop: 10 }}>{sn.linkText}</p>}
        </div>
      </main>
    </div>
  );
}
