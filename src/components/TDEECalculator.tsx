import { useState, useEffect, useRef } from "react";

const ACTIVITY_LEVELS = [
  { label: "Sedentary", desc: "Office job, little or no exercise", multiplier: 1.2 },
  { label: "Lightly Active", desc: "Exercise 1–2 days/week", multiplier: 1.375 },
  { label: "Moderately Active", desc: "Exercise 3–5 days/week", multiplier: 1.55 },
  { label: "Very Active", desc: "Exercise 6–7 days/week", multiplier: 1.725 },
  { label: "Extremely Active", desc: "Athlete or physical job", multiplier: 1.9 },
] as const;

interface Results {
  bmr: number;
  tdee: number;
  multiplier: number;
  formula: "mifflin" | "katch";
}

type Errors = Partial<Record<"age" | "weight" | "height" | "bodyFat", string>>;

// ─── small shared primitives ───────────────────────────────────────────────

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

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5"
    >
      {children}
    </label>
  );
}

// ─── main component ────────────────────────────────────────────────────────

export default function TDEECalculator() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [weight, setWeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<"imperial" | "metric">("imperial");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState(1.55);
  const [bodyFat, setBodyFat] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [calcKey, setCalcKey] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const resultsRef = useRef<HTMLDivElement>(null);

  // Smooth-scroll to results on every calculation
  useEffect(() => {
    if (calcKey > 0 && resultsRef.current) {
      setTimeout(() => {
        const el = resultsRef.current!;
        const top = el.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }, 80);
    }
  }, [calcKey]);

  // ── unit conversion helpers ──

  function handleWeightUnitChange(newUnit: string) {
    const unit = newUnit as "lbs" | "kg";
    const val = parseFloat(weight);
    if (!isNaN(val) && val > 0) {
      if (unit === "kg" && weightUnit === "lbs") setWeight((val * 0.453592).toFixed(1));
      if (unit === "lbs" && weightUnit === "kg") setWeight((val * 2.20462).toFixed(1));
    }
    setWeightUnit(unit);
  }

  function handleHeightUnitChange(newUnit: string) {
    const unit = newUnit as "imperial" | "metric";
    if (unit === "metric" && heightUnit === "imperial") {
      const cm = ((parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)) * 2.54;
      if (cm > 0) setHeightCm(cm.toFixed(0));
    }
    if (unit === "imperial" && heightUnit === "metric") {
      const totalIn = (parseFloat(heightCm) || 0) / 2.54;
      if (totalIn > 0) {
        setHeightFt(Math.floor(totalIn / 12).toString());
        setHeightIn(Math.round(totalIn % 12).toString());
      }
    }
    setHeightUnit(unit);
  }

  // ── validation ──

  function validate(): boolean {
    const e: Errors = {};

    const ageN = parseInt(age);
    if (!age || isNaN(ageN) || ageN < 18 || ageN > 100)
      e.age = "Enter an age between 18 and 100.";

    const wtN = parseFloat(weight);
    if (!weight || isNaN(wtN) || wtN <= 0) e.weight = "Enter a valid weight.";

    if (heightUnit === "imperial") {
      const ft = parseFloat(heightFt);
      const inches = parseFloat(heightIn) || 0;
      if (!heightFt || isNaN(ft) || ft < 1 || ft > 9 || inches < 0 || inches >= 12)
        e.height = "Enter a valid height (e.g. 5 ft 10 in).";
    } else {
      const cm = parseFloat(heightCm);
      if (!heightCm || isNaN(cm) || cm < 50 || cm > 280)
        e.height = "Enter a valid height in cm (50–280).";
    }

    if (bodyFat) {
      const bf = parseFloat(bodyFat);
      if (isNaN(bf) || bf < 5 || bf > 50) e.bodyFat = "Enter a value between 5 and 50.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── calculate ──

  function calculate() {
    if (!validate()) return;

    const weightKg =
      weightUnit === "lbs" ? parseFloat(weight) * 0.453592 : parseFloat(weight);

    const heightCmVal =
      heightUnit === "imperial"
        ? ((parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)) * 2.54
        : parseFloat(heightCm);

    const ageN = parseInt(age);

    let bmr: number;
    let formula: Results["formula"] = "mifflin";

    if (bodyFat) {
      const leanMass = weightKg * (1 - parseFloat(bodyFat) / 100);
      bmr = 370 + 21.6 * leanMass;
      formula = "katch";
    } else {
      bmr =
        sex === "male"
          ? 10 * weightKg + 6.25 * heightCmVal - 5 * ageN + 5
          : 10 * weightKg + 6.25 * heightCmVal - 5 * ageN - 161;
    }

    setResults({ bmr: Math.round(bmr), tdee: Math.round(bmr * activity), multiplier: activity, formula });
    setCalcKey((k) => k + 1);
  }

  // ── style helpers ──

  const fieldCls = (field: keyof Errors) =>
    [
      "w-full px-4 py-3 rounded-xl border text-sm font-medium bg-white",
      "focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-400",
      "transition-colors placeholder:text-gray-300",
      errors[field]
        ? "border-red-300 bg-red-50/40"
        : "border-gray-200 hover:border-gray-300",
    ].join(" ");

  const unitSuffix = "absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none select-none";

  // ── render ──

  return (
    <div className="space-y-5">

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-900/[0.08] shadow-xl shadow-green-900/[0.08] overflow-hidden">
        <div className="px-6 py-4 bg-gray-950 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 2c-1 2-4 4.5-4 7a4 4 0 0 0 8 0C12 6.5 9 4 8 2z"/>
          </svg>
          <span className="text-sm font-bold text-white">TDEE Calculator</span>
          <span className="text-sm text-gray-500">— Enter Your Details</span>
        </div>

        <div className="p-6 sm:p-8 space-y-5">

          {/* Sex */}
          <div>
            <Label>Biological Sex</Label>
            <TogglePill
              options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }]}
              value={sex}
              onChange={(v) => setSex(v as "male" | "female")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Age */}
            <div>
              <Label htmlFor="tdee-age">Age</Label>
              <input
                id="tdee-age"
                type="number"
                inputMode="numeric"
                min={18}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="30"
                className={fieldCls("age")}
              />
              {errors.age && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.age}</p>}
            </div>

            {/* Weight */}
            <div>
              <Label htmlFor="tdee-weight">Weight</Label>
              <div className="flex gap-2">
                <input
                  id="tdee-weight"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={weightUnit === "lbs" ? "165" : "75"}
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
          </div>

          {/* Height */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <Label>Height</Label>
              <TogglePill
                options={[{ label: "ft / in", value: "imperial" }, { label: "cm", value: "metric" }]}
                value={heightUnit}
                onChange={handleHeightUnitChange}
                size="sm"
              />
            </div>

            {heightUnit === "imperial" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={9}
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="5"
                    className={`${fieldCls("height")} pr-10`}
                    aria-label="Height feet"
                  />
                  <span className={unitSuffix}>ft</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={11}
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="10"
                    className={`${fieldCls("height")} pr-10`}
                    aria-label="Height inches"
                  />
                  <span className={unitSuffix}>in</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={50}
                  max={280}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="178"
                  className={`${fieldCls("height")} pr-12`}
                  aria-label="Height in centimetres"
                />
                <span className={unitSuffix}>cm</span>
              </div>
            )}
            {errors.height && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.height}</p>}
          </div>

          {/* Activity Level */}
          <div>
            <Label htmlFor="tdee-activity">Activity Level</Label>
            <div className="relative">
              <select
                id="tdee-activity"
                value={activity}
                onChange={(e) => setActivity(parseFloat(e.target.value))}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-400 transition-colors appearance-none cursor-pointer"
              >
                {ACTIVITY_LEVELS.map((l) => (
                  <option key={l.multiplier} value={l.multiplier}>
                    {l.label} — {l.desc}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Body Fat % — optional */}
          <div>
            <Label htmlFor="tdee-bf">
              Body Fat %{" "}
              <span className="normal-case font-normal text-gray-400">— optional</span>
            </Label>
            <div className="flex items-start gap-3">
              <div className="relative w-32">
                <input
                  id="tdee-bf"
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
                Unlocks the more accurate Katch-McArdle formula.
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
              Calculate My TDEE
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

          {/* Hero TDEE number */}
          <div className="rounded-2xl bg-green-700 p-6 sm:p-8 text-white">
            <p className="text-sm font-medium text-green-200/75 mb-2 tracking-wide">
              Your estimated daily calorie burn
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums leading-none">
                {results.tdee.toLocaleString()}
              </span>
              <span className="text-xl font-semibold text-green-300">cal / day</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                BMR: {results.bmr.toLocaleString()} cal/day
              </span>
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                {results.formula === "katch" ? "Katch-McArdle formula" : "Mifflin-St Jeor formula"}
              </span>
            </div>
          </div>

          {/* Activity comparison table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700">TDEE at All Activity Levels</h3>
              <p className="text-xs text-gray-400 mt-0.5">Based on your BMR of {results.bmr.toLocaleString()} cal/day</p>
            </div>
            <div className="divide-y divide-gray-50">
              {ACTIVITY_LEVELS.map((level) => {
                const levelTDEE = Math.round(results.bmr * level.multiplier);
                const isSelected = level.multiplier === results.multiplier;
                return (
                  <div
                    key={level.multiplier}
                    className={`flex items-center gap-4 px-5 py-4 ${isSelected ? "bg-green-50" : ""}`}
                  >
                    {/* Accent bar */}
                    <div className={`flex-shrink-0 w-1 h-10 rounded-full ${isSelected ? "bg-green-500" : "bg-gray-100"}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${isSelected ? "text-green-700" : "text-gray-700"}`}>
                          {level.label}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            Your level
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{level.desc}</p>
                    </div>

                    <span className={`flex-shrink-0 text-base font-bold tabular-nums ${isSelected ? "text-green-700" : "text-gray-500"}`}>
                      {levelTDEE.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What does this mean */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 sm:p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-5">What does this mean for you?</h3>
            <div className="space-y-5">
              {(
                [
                  {
                    label: "Maintain weight",
                    value: `${results.tdee.toLocaleString()} cal/day`,
                    note: "Eat at your TDEE to keep your current weight stable over time.",
                    color: "bg-blue-400",
                  },
                  {
                    label: "Lose weight",
                    value: `${(results.tdee - 500).toLocaleString()} – ${(results.tdee - 250).toLocaleString()} cal/day`,
                    note: "A 250–500 calorie daily deficit = approx. 0.5–1 lb of fat loss per week.",
                    color: "bg-green-500",
                  },
                  {
                    label: "Build muscle",
                    value: `${(results.tdee + 250).toLocaleString()} – ${(results.tdee + 500).toLocaleString()} cal/day`,
                    note: "A modest 250–500 calorie surplus supports lean muscle gain with training.",
                    color: "bg-orange-400",
                  },
                ] as const
              ).map((row) => (
                <div key={row.label} className="flex gap-4">
                  <div className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${row.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold text-gray-700">{row.label}:</span>
                      <span className="text-sm font-bold text-gray-900 tabular-nums">{row.value}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{row.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/macro-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Calculate your macros
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8 8.22 4.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M2.75 8a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 2.75 8z" clipRule="evenodd"/>
              </svg>
            </a>
            <a
              href="/calorie-deficit-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 transition-colors"
            >
              Set a calorie deficit
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
