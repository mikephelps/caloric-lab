import { useState, useEffect, useRef } from "react";

type GoalKey = "fat-loss" | "maintenance" | "muscle-gain";
type DietKey = "balanced" | "high-protein" | "low-carb" | "keto";

const PRESETS: Record<GoalKey, Record<DietKey, { p: number; c: number; f: number }>> = {
  "fat-loss": {
    "balanced":     { p: 35, c: 35, f: 30 },  // ~192g P at 2200 cal
    "high-protein": { p: 40, c: 30, f: 30 },  // ~220g P at 2200 cal
    "low-carb":     { p: 35, c: 20, f: 45 },
    "keto":         { p: 25, c:  5, f: 70 },
  },
  "maintenance": {
    "balanced":     { p: 25, c: 45, f: 30 },
    "high-protein": { p: 35, c: 35, f: 30 },
    "low-carb":     { p: 30, c: 25, f: 45 },
    "keto":         { p: 25, c:  5, f: 70 },
  },
  "muscle-gain": {
    "balanced":     { p: 25, c: 50, f: 25 },
    "high-protein": { p: 30, c: 45, f: 25 },
    "low-carb":     { p: 30, c: 25, f: 45 },
    "keto":         { p: 25, c: 10, f: 65 },
  },
};

const EXPLANATIONS: Record<GoalKey, Record<DietKey, string>> = {
  "fat-loss": {
    "balanced":     "Higher protein protects lean muscle during your deficit. Moderate carbs sustain training performance, and fat is kept reasonable to support hormones and satiety.",
    "high-protein": "Maximum protein intake drives muscle preservation and keeps hunger in check on fewer calories. Reduced carbs tighten the deficit without sacrificing training fuel entirely.",
    "low-carb":     "Lowering carbs reduces insulin and shifts your body toward fat oxidation. Higher fat and protein keep hunger in check and help sustain energy through the deficit.",
    "keto":         "Near-zero carbs push your body into ketosis, using fat as its primary fuel. Protein is kept moderate to prevent gluconeogenesis; dietary fat provides sustained energy.",
  },
  "maintenance": {
    "balanced":     "A well-rounded split that supports general health, training recovery, and metabolic stability. No macros are restricted — ideal for long-term sustainability.",
    "high-protein": "More protein than a standard maintenance split supports body recomposition — slowly building muscle while keeping body weight stable.",
    "low-carb":     "A moderate carb reduction with higher fat intake. Suitable for those who feel and perform better with fewer carbohydrates while staying at maintenance calories.",
    "keto":         "Ketogenic maintenance keeps carbs minimal to sustain fat-adapted metabolism. High dietary fat meets your daily energy needs without creating a calorie deficit.",
  },
  "muscle-gain": {
    "balanced":     "Carbohydrates are the primary driver of training intensity and glycogen replenishment. Ample carbs fuel your sessions and support muscle protein synthesis post-workout.",
    "high-protein": "Elevated protein accelerates muscle repair and growth. Carbs remain high to power hard training sessions — a combination that maximises hypertrophy.",
    "low-carb":     "A less common muscle gain approach where dietary fat provides energy in place of carbs. Protein stays elevated for muscle growth; training intensity may be slightly reduced.",
    "keto":         "A ketogenic bulk is uncommon but achievable. Dietary fat supplies the caloric surplus; protein drives muscle growth. Expect a longer metabolic adaptation period.",
  },
};

const GOALS = [
  { key: "fat-loss"     as GoalKey, label: "Fat Loss",    desc: "Eat below maintenance" },
  { key: "maintenance"  as GoalKey, label: "Maintenance", desc: "Sustain current weight" },
  { key: "muscle-gain"  as GoalKey, label: "Muscle Gain", desc: "Eat above maintenance" },
];

const DIETS = [
  { key: "balanced"     as DietKey, label: "Balanced",     desc: "Standard ratios" },
  { key: "high-protein" as DietKey, label: "High Protein", desc: "Prioritize protein" },
  { key: "low-carb"     as DietKey, label: "Low Carb",     desc: "Reduced carbs" },
  { key: "keto"         as DietKey, label: "Keto",         desc: "< 5–10% carbs" },
];

const MEALS = [
  { name: "Breakfast", pct: 0.25 },
  { name: "Lunch",     pct: 0.30 },
  { name: "Dinner",    pct: 0.35 },
  { name: "Snack",     pct: 0.10 },
];

interface Results {
  calories: number;
  proteinG: number;
  carbsG:   number;
  fatG:     number;
  ratios:   { p: number; c: number; f: number };
  goal:     GoalKey;
  diet:     DietKey;
}

// ─── Donut chart ─────────────────────────────────────────────────────────────

function DonutChart({ proteinG, carbsG, fatG, calories }: { proteinG: number; carbsG: number; fatG: number; calories: number }) {
  const r = 56;
  const circumference = 2 * Math.PI * r;
  const GAP = 3;

  // Proportions based on grams so the arc sizes match the gram amounts shown
  const totalG = proteinG + carbsG + fatG;
  const pPct = totalG > 0 ? (proteinG / totalG) * 100 : 33.3;
  const cPct = totalG > 0 ? (carbsG   / totalG) * 100 : 33.3;
  const fPct = totalG > 0 ? (fatG     / totalG) * 100 : 33.4;

  const segments = [
    { pct: pPct, color: "#16a34a", label: "Protein" },
    { pct: cPct, color: "#0ea5e9", label: "Carbs"   },
    { pct: fPct, color: "#f97316", label: "Fat"     },
  ];

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const fullLen = (seg.pct / 100) * circumference;
    const dashLen = Math.max(0, fullLen - GAP);
    const arc = {
      ...seg,
      dashArray:  `${dashLen} ${circumference - dashLen}`,
      dashOffset: -cumulative,
    };
    cumulative += fullLen;
    return arc;
  });

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true">
      {/* Track */}
      <circle cx="80" cy="80" r={r} fill="none" stroke="#f3f4f6" strokeWidth="22" />
      <g transform="rotate(-90 80 80)">
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="22"
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="butt"
          />
        ))}
      </g>
      {/* Two-line label: block spans y=64.5→95.5, center=80 (matches hole center) */}
      <text x="80" y="74" textAnchor="middle" dominantBaseline="central" fontSize="19" fontWeight="800" fill="#111827">
        {calories.toLocaleString()}
      </text>
      <text x="80" y="90" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="500" fill="#9ca3af">
        cal / day
      </text>
    </svg>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function MacroCalculator() {
  const [calories, setCalories] = useState("");
  const [goal, setGoal]         = useState<GoalKey>("fat-loss");
  const [diet, setDiet]         = useState<DietKey>("balanced");
  const [results, setResults]   = useState<Results | null>(null);
  const [calcKey, setCalcKey]   = useState(0);
  const [error, setError]       = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calcKey > 0 && resultsRef.current) {
      setTimeout(() => {
        const el = resultsRef.current!;
        const top = el.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }, 80);
    }
  }, [calcKey]);

  function calculate() {
    const cal = parseInt(calories);
    if (!calories || isNaN(cal) || cal < 800 || cal > 10000) {
      setError("Enter a daily calorie target between 800 and 10,000.");
      return;
    }
    setError("");

    const ratios = PRESETS[goal][diet];
    const proteinG = Math.round((cal * ratios.p) / 100 / 4);
    const carbsG   = Math.round((cal * ratios.c) / 100 / 4);
    const fatG     = Math.round((cal * ratios.f) / 100 / 9);

    setResults({ calories: cal, proteinG, carbsG, fatG, ratios, goal, diet });
    setCalcKey((k) => k + 1);
  }

  const cardBtn = (active: boolean) =>
    [
      "flex flex-col items-center gap-0.5 px-3 py-3 rounded-xl border text-center transition-all cursor-pointer",
      active
        ? "border-green-400 bg-green-50 ring-1 ring-green-400/30"
        : "border-gray-200 bg-white hover:border-gray-300",
    ].join(" ");

  return (
    <div className="space-y-5">

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-900/[0.08] shadow-xl shadow-green-900/[0.08] overflow-hidden">
        <div className="px-6 py-4 bg-gray-950 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 8L8 2A6 6 0 0 1 11.53 12.85Z"/>
            <path d="M8 8L11.53 12.85A6 6 0 0 1 2 8Z" opacity="0.65"/>
            <path d="M8 8L2 8A6 6 0 0 1 8 2Z" opacity="0.4"/>
          </svg>
          <span className="text-sm font-bold text-white">Macro Calculator</span>
          <span className="text-sm text-gray-500">— Enter Your Details</span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {/* Calorie target */}
          <div>
            <label
              htmlFor="mc-calories"
              className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5"
            >
              Daily Calorie Target
            </label>
            <div className="flex gap-3 items-start">
              <div className="relative w-44">
                <input
                  id="mc-calories"
                  type="number"
                  inputMode="numeric"
                  min={800}
                  max={10000}
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="2,200"
                  className={[
                    "w-full px-4 py-3 pr-14 rounded-xl border text-sm font-medium bg-white",
                    "focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-400",
                    "transition-colors placeholder:text-gray-300",
                    error ? "border-red-300 bg-red-50/40" : "border-gray-200 hover:border-gray-300",
                  ].join(" ")}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                  cal
                </span>
              </div>
              <p className="flex-1 text-xs text-gray-400 leading-relaxed pt-3.5">
                Don't know your calories?{" "}
                <a href="/tdee-calculator/" className="text-green-600 hover:underline font-medium">
                  Calculate your TDEE →
                </a>
              </p>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
          </div>

          {/* Goal */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">Goal</p>
            <div className="grid grid-cols-3 gap-2.5">
              {GOALS.map((g) => (
                <button key={g.key} type="button" onClick={() => setGoal(g.key)} className={cardBtn(goal === g.key)}>
                  <span className={`text-sm font-bold ${goal === g.key ? "text-green-700" : "text-gray-700"}`}>
                    {g.label}
                  </span>
                  <span className={`text-xs font-medium ${goal === g.key ? "text-green-500" : "text-gray-400"}`}>
                    {g.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Diet style */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">Diet Style</p>
            <div className="grid grid-cols-2 gap-2.5">
              {DIETS.map((d) => (
                <button key={d.key} type="button" onClick={() => setDiet(d.key)} className={cardBtn(diet === d.key)}>
                  <span className={`text-sm font-bold ${diet === d.key ? "text-green-700" : "text-gray-700"}`}>
                    {d.label}
                  </span>
                  <span className={`text-xs font-medium ${diet === d.key ? "text-green-500" : "text-gray-400"}`}>
                    {d.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ratio preview */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium">Macro split:</span>
            {(["p", "c", "f"] as const).map((key, i) => {
              const preset = PRESETS[goal][diet];
              const val = key === "p" ? preset.p : key === "c" ? preset.c : preset.f;
              const colors = ["text-green-600", "text-sky-500", "text-orange-500"];
              const labels = ["Protein", "Carbs", "Fat"];
              return (
                <span key={key} className={`text-xs font-bold ${colors[i]}`}>
                  {labels[i]} {val}%
                </span>
              );
            })}
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={calculate}
              className="btn-calc w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white text-sm font-bold rounded-xl shadow-md"
            >
              Calculate My Macros
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8 8.22 4.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M2.75 8a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 2.75 8z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* ── Results ── */}
      {results && (
        <div key={calcKey} ref={resultsRef} className="animate-fade-up space-y-4">

          {/* Donut + macros */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">

              {/* Chart */}
              <div className="flex-shrink-0">
                <DonutChart
                  proteinG={results.proteinG}
                  carbsG={results.carbsG}
                  fatG={results.fatG}
                  calories={results.calories}
                />
              </div>

              {/* Macro grams */}
              <div className="flex-1 w-full space-y-3">
                {[
                  { label: "Protein", grams: results.proteinG, pct: results.ratios.p, color: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50",  border: "border-green-100" },
                  { label: "Carbs",   grams: results.carbsG,   pct: results.ratios.c, color: "bg-sky-500",    text: "text-sky-700",    bg: "bg-sky-50",    border: "border-sky-100"   },
                  { label: "Fat",     grams: results.fatG,     pct: results.ratios.f, color: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100" },
                ].map((m) => (
                  <div key={m.label} className={`flex items-center gap-3 rounded-xl border ${m.border} ${m.bg} px-4 py-3`}>
                    <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${m.color}`} />
                    <span className={`text-sm font-semibold ${m.text} w-16`}>{m.label}</span>
                    <span className="text-xl font-extrabold text-gray-900 tabular-nums">{m.grams}g</span>
                    <span className="ml-auto text-xs font-semibold text-gray-400">{m.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Per-meal breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700">Per-Meal Breakdown</h3>
              <p className="text-xs text-gray-400 mt-0.5">3 meals + 1 snack (25 / 30 / 35 / 10%)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Meal</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cal</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-green-600 uppercase tracking-wider">Protein</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-sky-500 uppercase tracking-wider">Carbs</th>
                    <th className="text-right px-5 py-2.5 text-xs font-semibold text-orange-500 uppercase tracking-wider">Fat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MEALS.map((meal) => {
                    const mCal  = Math.round(results.calories  * meal.pct);
                    const mProt = Math.round(results.proteinG  * meal.pct);
                    const mCarb = Math.round(results.carbsG    * meal.pct);
                    const mFat  = Math.round(results.fatG      * meal.pct);
                    return (
                      <tr key={meal.name} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 font-semibold text-gray-700">{meal.name}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-500 tabular-nums">{mCal}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600 tabular-nums">{mProt}g</td>
                        <td className="px-4 py-3 text-right font-bold text-sky-500 tabular-nums">{mCarb}g</td>
                        <td className="px-5 py-3 text-right font-bold text-orange-500 tabular-nums">{mFat}g</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Why this split */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              Why this split?
              <span className="ml-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                {GOALS.find((g) => g.key === results.goal)?.label} · {DIETS.find((d) => d.key === results.diet)?.label}
              </span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {EXPLANATIONS[results.goal][results.diet]}
            </p>
          </div>

          {/* CTA links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="/tdee-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              TDEE Calculator
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8 8.22 4.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M2.75 8a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 2.75 8z" clipRule="evenodd"/>
              </svg>
            </a>
            <a
              href="/protein-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 transition-colors"
            >
              Protein Calculator
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8 8.22 4.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M2.75 8a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 2.75 8z" clipRule="evenodd"/>
              </svg>
            </a>
            <a
              href="/calorie-deficit-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 transition-colors"
            >
              Calorie Deficit
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8 8.22 4.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M2.75 8a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 2.75 8z" clipRule="evenodd"/>
              </svg>
            </a>
          </div>

        </div>
      )}
    </div>
  );
}
