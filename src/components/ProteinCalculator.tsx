import { useState, useEffect, useRef } from "react";

type GoalKey     = "fat-loss" | "maintenance" | "muscle-gain";
type ActivityKey = "sedentary" | "moderate" | "very-active";

// Grams per pound of bodyweight
const MULTIPLIERS: Record<GoalKey, Record<ActivityKey, number>> = {
  "fat-loss":    { "sedentary": 0.8, "moderate": 0.9, "very-active": 1.0 },
  "maintenance": { "sedentary": 0.7, "moderate": 0.8, "very-active": 0.9 },
  "muscle-gain": { "sedentary": 0.8, "moderate": 1.0, "very-active": 1.2 },
};

// ISSN-backed context ranges (g/lb) shown in results
const CONTEXT: Record<GoalKey, { label: string; range: string }> = {
  "fat-loss":    { label: "fat loss",    range: "0.8–1.0" },
  "maintenance": { label: "maintenance", range: "0.7–0.9" },
  "muscle-gain": { label: "muscle gain", range: "0.8–1.2" },
};

const GOALS: { key: GoalKey; label: string; desc: string }[] = [
  { key: "fat-loss",    label: "Fat Loss",    desc: "Preserve muscle in a deficit" },
  { key: "maintenance", label: "Maintenance", desc: "Sustain current body composition" },
  { key: "muscle-gain", label: "Muscle Gain", desc: "Support muscle growth" },
];

const ACTIVITIES: { key: ActivityKey; label: string; desc: string }[] = [
  { key: "sedentary",   label: "Sedentary",    desc: "Little or no exercise" },
  { key: "moderate",    label: "Moderate",     desc: "Exercise 3–5 days/week" },
  { key: "very-active", label: "Very Active",  desc: "Daily or intense training" },
];

interface Results {
  dailyG:        number;
  perMealG:      number;
  multiplierUsed: number;
  weightLbs:     number;
  leanLbs:       number | null;
  usedLeanMass:  boolean;
  goal:          GoalKey;
  activity:      ActivityKey;
}

type Errors = Partial<Record<"weight" | "bodyFat", string>>;

// ─── shared primitives ──────────────────────────────────────────────────────

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5"
    >
      {children}
    </label>
  );
}

function TogglePill({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex rounded-xl bg-gray-100 p-1 gap-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={[
            "rounded-lg font-semibold transition-all",
            size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm",
            value === o.value
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── main component ─────────────────────────────────────────────────────────

export default function ProteinCalculator() {
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [weight, setWeight]         = useState("");
  const [goal, setGoal]             = useState<GoalKey>("muscle-gain");
  const [activity, setActivity]     = useState<ActivityKey>("moderate");
  const [bodyFat, setBodyFat]       = useState("");
  const [results, setResults]       = useState<Results | null>(null);
  const [calcKey, setCalcKey]       = useState(0);
  const [errors, setErrors]         = useState<Errors>({});
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

  function handleWeightUnitChange(newUnit: string) {
    const unit = newUnit as "lbs" | "kg";
    const val = parseFloat(weight);
    if (!isNaN(val) && val > 0) {
      if (unit === "kg"  && weightUnit === "lbs") setWeight((val * 0.453592).toFixed(1));
      if (unit === "lbs" && weightUnit === "kg")  setWeight((val * 2.20462).toFixed(1));
    }
    setWeightUnit(unit);
  }

  function validate(): boolean {
    const e: Errors = {};
    const wtN = parseFloat(weight);
    if (!weight || isNaN(wtN) || wtN <= 0)
      e.weight = "Enter a valid weight.";

    if (bodyFat) {
      const bf = parseFloat(bodyFat);
      if (isNaN(bf) || bf < 5 || bf > 50)
        e.bodyFat = "Enter a value between 5 and 50.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function calculate() {
    if (!validate()) return;

    const weightLbs =
      weightUnit === "lbs" ? parseFloat(weight) : parseFloat(weight) * 2.20462;

    const base = MULTIPLIERS[goal][activity];
    let dailyG: number;
    let leanLbs: number | null = null;
    let usedLeanMass = false;
    let multiplierUsed = base;

    if (bodyFat) {
      const bf = parseFloat(bodyFat) / 100;
      leanLbs = weightLbs * (1 - bf);
      // Lean-mass multiplier is 1.1× the base (lean mass is smaller, so protein density goes up)
      multiplierUsed = parseFloat((base * 1.1).toFixed(2));
      dailyG = leanLbs * multiplierUsed;
      usedLeanMass = true;
    } else {
      dailyG = weightLbs * base;
    }

    setResults({
      dailyG:        Math.round(dailyG),
      perMealG:      Math.round(dailyG / 4),
      multiplierUsed,
      weightLbs:     Math.round(weightLbs * 10) / 10,
      leanLbs:       leanLbs !== null ? Math.round(leanLbs * 10) / 10 : null,
      usedLeanMass,
      goal,
      activity,
    });
    setCalcKey((k) => k + 1);
  }

  const fieldCls = (field: keyof Errors) =>
    [
      "w-full px-4 py-3 rounded-xl border text-sm font-medium bg-white",
      "focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-400",
      "transition-colors placeholder:text-gray-300",
      errors[field] ? "border-red-300 bg-red-50/40" : "border-gray-200 hover:border-gray-300",
    ].join(" ");

  const unitSuffix =
    "absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none select-none";

  const cardBtn = (active: boolean) =>
    [
      "flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer w-full",
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
            <rect x="1" y="5.5" width="3.5" height="5" rx="1"/>
            <rect x="11.5" y="5.5" width="3.5" height="5" rx="1"/>
            <rect x="4" y="7.25" width="8" height="1.5" rx="0.75"/>
          </svg>
          <span className="text-sm font-bold text-white">Protein Calculator</span>
          <span className="text-sm text-gray-500">· Enter Your Details</span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {/* Weight */}
          <div>
            <Label htmlFor="pc-weight">Body Weight</Label>
            <div className="flex gap-2">
              <input
                id="pc-weight"
                type="number"
                inputMode="decimal"
                min={0}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={weightUnit === "lbs" ? "185" : "84"}
                className={fieldCls("weight")}
              />
              <TogglePill
                options={[{ label: "lbs", value: "lbs" }, { label: "kg", value: "kg" }]}
                value={weightUnit}
                onChange={handleWeightUnitChange}
                size="sm"
              />
            </div>
            {errors.weight && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.weight}</p>}
          </div>

          {/* Goal */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">Goal</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {GOALS.map((g) => (
                <button key={g.key} type="button" onClick={() => setGoal(g.key)} className={cardBtn(goal === g.key)}>
                  <span className={`text-sm font-bold ${goal === g.key ? "text-green-700" : "text-gray-700"}`}>
                    {g.label}
                  </span>
                  <span className={`text-xs ${goal === g.key ? "text-green-500" : "text-gray-400"}`}>
                    {g.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">Activity Level</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {ACTIVITIES.map((a) => (
                <button key={a.key} type="button" onClick={() => setActivity(a.key)} className={cardBtn(activity === a.key)}>
                  <span className={`text-sm font-bold ${activity === a.key ? "text-green-700" : "text-gray-700"}`}>
                    {a.label}
                  </span>
                  <span className={`text-xs ${activity === a.key ? "text-green-500" : "text-gray-400"}`}>
                    {a.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Body Fat % — optional */}
          <div>
            <Label htmlFor="pc-bf">
              Body Fat %{" "}
              <span className="normal-case font-normal text-gray-400">(optional)</span>
            </Label>
            <div className="flex items-start gap-3">
              <div className="relative w-32">
                <input
                  id="pc-bf"
                  type="number"
                  inputMode="decimal"
                  min={5}
                  max={50}
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  placeholder="e.g. 18"
                  className={`${fieldCls("bodyFat")} pr-8`}
                />
                <span className={unitSuffix}>%</span>
              </div>
              <p className="flex-1 text-xs text-gray-400 leading-relaxed pt-3.5">
                Calculates protein based on lean body mass for greater precision.
              </p>
            </div>
            {errors.bodyFat && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.bodyFat}</p>}
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={calculate}
              className="btn-calc w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white text-sm font-bold rounded-xl shadow-md"
            >
              Calculate My Protein
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

          {/* Hero */}
          <div className="rounded-2xl bg-green-700 p-6 sm:p-8 text-white">
            <p className="text-sm font-medium text-green-200/75 mb-2 tracking-wide">
              Your daily protein target
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums leading-none">
                {results.dailyG}
              </span>
              <span className="text-xl font-semibold text-green-300">grams / day</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                {results.multiplierUsed}g per lb {results.usedLeanMass ? "lean mass" : "bodyweight"}
              </span>
              {results.usedLeanMass && results.leanLbs !== null && (
                <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                  Lean mass: {results.leanLbs} lbs
                </span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">
                {results.perMealG}
                <span className="text-sm font-semibold text-gray-400 ml-1">g</span>
              </p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">Per meal (4 meals)</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">
                {results.multiplierUsed}
                <span className="text-sm font-semibold text-gray-400 ml-1">g/lb</span>
              </p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">
                {results.usedLeanMass ? "Per lb lean mass" : "Per lb bodyweight"}
              </p>
            </div>
            {results.usedLeanMass && results.leanLbs !== null ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center col-span-2 sm:col-span-1">
                <p className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">
                  {parseFloat((results.dailyG / results.weightLbs).toFixed(2))}
                  <span className="text-sm font-semibold text-gray-400 ml-1">g/lb</span>
                </p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">Per lb total weight</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center hidden sm:block">
                <p className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">
                  {results.dailyG * 4}
                  <span className="text-sm font-semibold text-gray-400 ml-1">cal</span>
                </p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">From protein daily</p>
              </div>
            )}
          </div>

          {/* ISSN context */}
          <div className="bg-[#F9FFFF] rounded-2xl border border-green-100 p-5">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-700" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-2.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75zm0-2.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Research context</p>
                <p className="text-sm text-gray-600 leading-relaxed mt-1">
                  For your goal of <strong>{CONTEXT[results.goal].label}</strong>, research from the International Society
                  of Sports Nutrition recommends{" "}
                  <strong>{CONTEXT[results.goal].range}g of protein per pound of body weight</strong> per day.
                  Your target of <strong>{results.multiplierUsed}g/lb</strong> falls{" "}
                  {results.usedLeanMass ? "within this range when adjusted for lean mass." : "within this range."}
                </p>
              </div>
            </div>
          </div>

          {/* CTA links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/macro-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Set all your macros
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8 8.22 4.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M2.75 8a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 2.75 8z" clipRule="evenodd"/>
              </svg>
            </a>
            <a
              href="/tdee-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200 hover:border-green-300 transition-colors"
            >
              Calculate your TDEE
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
