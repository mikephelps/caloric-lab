import { useState, useEffect, useRef } from "react";

type ActivityKey = "sedentary" | "lightly-active" | "moderately-active" | "very-active" | "extremely-active";
type ClimateKey  = "temperate" | "hot-humid" | "cold-dry";
type SpecialKey  = "none" | "pregnant" | "breastfeeding";

const ACTIVITY_MULTIPLIERS: Record<ActivityKey, number> = {
  "sedentary":         1.0,
  "lightly-active":    1.1,
  "moderately-active": 1.2,
  "very-active":       1.3,
  "extremely-active":  1.4,
};

const CLIMATE_MULTIPLIERS: Record<ClimateKey, number> = {
  "temperate": 1.0,
  "hot-humid": 1.2,
  "cold-dry":  1.1,
};

const ACTIVITIES: { key: ActivityKey; label: string; desc: string }[] = [
  { key: "sedentary",         label: "Sedentary",         desc: "Little or no exercise, desk job" },
  { key: "lightly-active",    label: "Lightly Active",    desc: "Light exercise 1–3 days/week" },
  { key: "moderately-active", label: "Moderately Active", desc: "Moderate exercise 3–5 days/week" },
  { key: "very-active",       label: "Very Active",       desc: "Hard exercise 6–7 days/week" },
  { key: "extremely-active",  label: "Extremely Active",  desc: "Physical job or twice-daily training" },
];

const CLIMATES: { key: ClimateKey; label: string; desc: string }[] = [
  { key: "temperate", label: "Temperate",  desc: "Mild, moderate temperatures" },
  { key: "hot-humid", label: "Hot / Humid", desc: "Hot weather or high humidity" },
  { key: "cold-dry",  label: "Cold / Dry",  desc: "Cold or low-humidity climate" },
];

const SPECIALS: { key: SpecialKey; label: string; note: string }[] = [
  { key: "none",          label: "None",          note: "No adjustment" },
  { key: "pregnant",      label: "Pregnant",      note: "+300 ml/day" },
  { key: "breastfeeding", label: "Breastfeeding", note: "+700 ml/day" },
];

interface Results {
  totalMl:       number;
  totalL:        number;
  totalOz:       number;
  glasses:       number;
  ozPerHour:     number;
  baseMl:        number;
  activityMl:    number;
  climateMl:     number;
  exerciseMl:    number;
  specialMl:     number;
}

type Errors = Partial<Record<"weight" | "exerciseMinutes", string>>;

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

export default function WaterIntakeCalculator() {
  const [weightUnit, setWeightUnit]   = useState<"lbs" | "kg">("lbs");
  const [weight, setWeight]           = useState("");
  const [activity, setActivity]       = useState<ActivityKey>("moderately-active");
  const [climate, setClimate]         = useState<ClimateKey>("temperate");
  const [exerciseMinutes, setExerciseMin] = useState("");
  const [special, setSpecial]         = useState<SpecialKey>("none");
  const [results, setResults]         = useState<Results | null>(null);
  const [calcKey, setCalcKey]         = useState(0);
  const [errors, setErrors]           = useState<Errors>({});
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

    if (exerciseMinutes) {
      const mins = parseFloat(exerciseMinutes);
      if (isNaN(mins) || mins < 0 || mins > 600)
        e.exerciseMinutes = "Enter a value between 0 and 600.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function calculate() {
    if (!validate()) return;

    const weightKg = weightUnit === "kg"
      ? parseFloat(weight)
      : parseFloat(weight) * 0.453592;

    // Base: 33 ml per kg of body weight
    const baseMl = weightKg * 33;

    const actMult  = ACTIVITY_MULTIPLIERS[activity];
    const climMult = CLIMATE_MULTIPLIERS[climate];

    // Additive breakdown (mathematically equivalent to baseMl * actMult * climMult)
    const activityMl = baseMl * (actMult - 1);
    const climateMl  = baseMl * actMult * (climMult - 1);

    // Exercise: +350 ml per 30 minutes
    const mins = exerciseMinutes ? parseFloat(exerciseMinutes) : 0;
    const exerciseMl = (mins / 30) * 350;

    // Special conditions
    let specialMl = 0;
    if (special === "pregnant")      specialMl = 300;
    if (special === "breastfeeding") specialMl = 700;

    const totalMl  = Math.round(baseMl + activityMl + climateMl + exerciseMl + specialMl);
    const totalL   = Math.round(totalMl / 100) / 10;
    const totalOz  = Math.round(totalMl * 0.033814);
    const glasses  = Math.round(totalMl / 250);
    const ozPerHour = Math.round((totalOz / 16) * 10) / 10;

    setResults({
      totalMl,
      totalL,
      totalOz,
      glasses,
      ozPerHour,
      baseMl:      Math.round(baseMl),
      activityMl:  Math.round(activityMl),
      climateMl:   Math.round(climateMl),
      exerciseMl:  Math.round(exerciseMl),
      specialMl,
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
            <path d="M8 2C6 5 3 7.5 3 10a5 5 0 0 0 10 0C13 7.5 10 5 8 2z"/>
          </svg>
          <span className="text-sm font-bold text-white">Water Intake Calculator</span>
          <span className="text-sm text-gray-500">· Enter Your Details</span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {/* Weight */}
          <div>
            <Label htmlFor="wic-weight">Body Weight</Label>
            <div className="flex gap-2">
              <input
                id="wic-weight"
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

          {/* Activity Level */}
          <div>
            <Label htmlFor="wic-activity">Activity Level</Label>
            <select
              id="wic-activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityKey)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-400 transition-colors"
            >
              {ACTIVITIES.map((a) => (
                <option key={a.key} value={a.key}>{a.label}: {a.desc}</option>
              ))}
            </select>
          </div>

          {/* Climate */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">Climate</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CLIMATES.map((c) => (
                <button key={c.key} type="button" onClick={() => setClimate(c.key)} className={cardBtn(climate === c.key)}>
                  <span className={`text-sm font-bold ${climate === c.key ? "text-green-700" : "text-gray-700"}`}>
                    {c.label}
                  </span>
                  <span className={`text-xs ${climate === c.key ? "text-green-500" : "text-gray-400"}`}>
                    {c.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Minutes */}
          <div>
            <Label htmlFor="wic-exercise">
              Daily Exercise{" "}
              <span className="normal-case font-normal text-gray-400">(optional)</span>
            </Label>
            <div className="flex items-start gap-3">
              <div className="relative w-32">
                <input
                  id="wic-exercise"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={600}
                  value={exerciseMinutes}
                  onChange={(e) => setExerciseMin(e.target.value)}
                  placeholder="e.g. 45"
                  className={`${fieldCls("exerciseMinutes")} pr-12`}
                />
                <span className={unitSuffix}>min</span>
              </div>
              <p className="flex-1 text-xs text-gray-400 leading-relaxed pt-3.5">
                Adds 350 ml per 30 minutes of exercise to account for sweat loss.
              </p>
            </div>
            {errors.exerciseMinutes && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.exerciseMinutes}</p>
            )}
          </div>

          {/* Special Conditions */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
              Special Conditions{" "}
              <span className="normal-case font-normal text-gray-400">(optional)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SPECIALS.map((s) => (
                <button key={s.key} type="button" onClick={() => setSpecial(s.key)} className={cardBtn(special === s.key)}>
                  <span className={`text-sm font-bold ${special === s.key ? "text-green-700" : "text-gray-700"}`}>
                    {s.label}
                  </span>
                  <span className={`text-xs ${special === s.key ? "text-green-500" : "text-gray-400"}`}>
                    {s.note}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={calculate}
              className="btn-calc w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white text-sm font-bold rounded-xl shadow-md"
            >
              Calculate My Water Intake
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
              Your daily water target
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums leading-none">
                {results.totalL}
              </span>
              <span className="text-xl font-semibold text-green-300">liters / day</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                {results.totalOz} fl oz / day
              </span>
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                {results.glasses} glasses (250 ml each)
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">
                {results.totalOz}
                <span className="text-sm font-semibold text-gray-400 ml-1">fl oz</span>
              </p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">Total per day</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">
                {results.ozPerHour}
                <span className="text-sm font-semibold text-gray-400 ml-1">fl oz</span>
              </p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">Per waking hour</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-[#F9FFFF] rounded-2xl border border-green-100 p-5">
            <p className="text-sm font-semibold text-gray-900 mb-3">How we calculated this</p>
            <div className="space-y-2">
              {[
                { label: "Base (weight × 33 ml/kg)",     ml: results.baseMl,      always: true  },
                { label: "Activity level adjustment",     ml: results.activityMl,  always: false },
                { label: "Climate adjustment",            ml: results.climateMl,   always: false },
                { label: "Exercise",                      ml: results.exerciseMl,  always: false },
                { label: "Special conditions",            ml: results.specialMl,   always: false },
              ]
                .filter((row) => row.always || row.ml > 0)
                .map((row, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{row.label}</span>
                    <span className="font-semibold text-gray-900 tabular-nums">
                      {i === 0 ? "" : "+"}{row.ml} ml
                    </span>
                  </div>
                ))}
              <div className="border-t border-green-200 pt-2 mt-2 flex items-center justify-between text-sm font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-green-700 tabular-nums">{results.totalMl} ml</span>
              </div>
            </div>
          </div>

          {/* Hydration tips */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-700" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-2.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75zm0-2.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Hydration tips</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    "Start each morning with a full glass of water before coffee.",
                    "Carry a reusable bottle and refill it consistently throughout the day.",
                    `Aim for roughly ${results.ozPerHour} fl oz per waking hour to spread intake evenly.`,
                    "Thirst is a late signal — sip consistently rather than waiting until you feel thirsty.",
                    "Coffee, tea, and water-rich foods all count toward your total daily fluid intake.",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207z" clipRule="evenodd"/>
                      </svg>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/tdee-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Calculate your TDEE
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8 8.22 4.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M2.75 8a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 2.75 8z" clipRule="evenodd"/>
              </svg>
            </a>
            <a
              href="/protein-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200 hover:border-green-300 transition-colors"
            >
              Calculate your protein
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
