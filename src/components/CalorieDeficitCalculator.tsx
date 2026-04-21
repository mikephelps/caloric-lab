import { useState, useEffect, useRef } from "react";

const ACTIVITY_LEVELS = [
  { label: "Sedentary", desc: "Office job, little or no exercise", multiplier: 1.2 },
  { label: "Lightly Active", desc: "Exercise 1–2 days/week", multiplier: 1.375 },
  { label: "Moderately Active", desc: "Exercise 3–5 days/week", multiplier: 1.55 },
  { label: "Very Active", desc: "Exercise 6–7 days/week", multiplier: 1.725 },
  { label: "Extremely Active", desc: "Athlete or physical job", multiplier: 1.9 },
] as const;

const RATES = [
  { key: "conservative", label: "Conservative", detail: "0.5 lb / week", deficit: 250 },
  { key: "moderate",     label: "Moderate",     detail: "1 lb / week",   deficit: 500 },
  { key: "aggressive",   label: "Aggressive",   detail: "1.5 lb / week", deficit: 750 },
] as const;

type RateKey = "conservative" | "moderate" | "aggressive";

interface Results {
  tdee: number;
  bmr: number;
  targetCalories: number;
  rawTarget: number;
  deficit: number;
  weeklyDeficit: number;
  weeksToGoal: number | null;
  goalDate: string | null;
  clamped: boolean;
  formula: "mifflin" | "katch";
}

type Errors = Partial<Record<"age" | "weight" | "goalWeight" | "height" | "bodyFat", string>>;

// ─── shared primitives ──────────────────────────────────────────────────────

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

// ─── main component ─────────────────────────────────────────────────────────

export default function CalorieDeficitCalculator() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [weight, setWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<"imperial" | "metric">("imperial");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState(1.55);
  const [bodyFat, setBodyFat] = useState("");
  const [rate, setRate] = useState<RateKey>("moderate");
  const [results, setResults] = useState<Results | null>(null);
  const [calcKey, setCalcKey] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
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

  // ── unit conversion ──

  function handleWeightUnitChange(newUnit: string) {
    const unit = newUnit as "lbs" | "kg";
    const val = parseFloat(weight);
    if (!isNaN(val) && val > 0) {
      if (unit === "kg" && weightUnit === "lbs") setWeight((val * 0.453592).toFixed(1));
      if (unit === "lbs" && weightUnit === "kg") setWeight((val * 2.20462).toFixed(1));
    }
    const gw = parseFloat(goalWeight);
    if (!isNaN(gw) && gw > 0) {
      if (unit === "kg" && weightUnit === "lbs") setGoalWeight((gw * 0.453592).toFixed(1));
      if (unit === "lbs" && weightUnit === "kg") setGoalWeight((gw * 2.20462).toFixed(1));
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
    if (!weight || isNaN(wtN) || wtN <= 0)
      e.weight = "Enter a valid current weight.";

    const gwN = parseFloat(goalWeight);
    if (!goalWeight || isNaN(gwN) || gwN <= 0) {
      e.goalWeight = "Enter a valid goal weight.";
    } else if (!isNaN(wtN) && wtN > 0 && gwN >= wtN) {
      e.goalWeight = "Goal weight must be less than your current weight.";
    }

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
      if (isNaN(bf) || bf < 5 || bf > 50)
        e.bodyFat = "Enter a value between 5 and 50.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── calculate ──

  function calculate() {
    if (!validate()) return;

    const weightKg = weightUnit === "lbs" ? parseFloat(weight) * 0.453592 : parseFloat(weight);
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

    const tdee = Math.round(bmr * activity);
    const selectedRate = RATES.find((r) => r.key === rate)!;
    const rawTarget = tdee - selectedRate.deficit;
    const minCalories = sex === "male" ? 1500 : 1200;
    const clamped = rawTarget < minCalories;
    const targetCalories = Math.max(rawTarget, minCalories);
    const dailyDeficit = tdee - targetCalories;
    const weeklyDeficit = dailyDeficit * 7;

    // Weeks to goal
    const currentWeightLbs =
      weightUnit === "lbs" ? parseFloat(weight) : parseFloat(weight) * 2.20462;
    const goalWeightLbs =
      weightUnit === "lbs" ? parseFloat(goalWeight) : parseFloat(goalWeight) * 2.20462;
    const totalCaloriesToLose = (currentWeightLbs - goalWeightLbs) * 3500;

    let weeksToGoal: number | null = null;
    let goalDate: string | null = null;

    if (dailyDeficit > 0) {
      const totalDays = totalCaloriesToLose / dailyDeficit;
      weeksToGoal = Math.ceil(totalDays / 7);
      const target = new Date();
      target.setDate(target.getDate() + Math.round(totalDays));
      goalDate = target.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    setResults({
      tdee,
      bmr: Math.round(bmr),
      targetCalories,
      rawTarget,
      deficit: dailyDeficit,
      weeklyDeficit,
      weeksToGoal,
      goalDate,
      clamped,
      formula,
    });
    setCalcKey((k) => k + 1);
  }

  // ── style helpers ──

  const fieldCls = (field: keyof Errors) =>
    [
      "w-full px-4 py-3 rounded-xl border text-sm font-medium bg-white",
      "focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-400",
      "transition-colors placeholder:text-gray-300",
      errors[field] ? "border-red-300 bg-red-50/40" : "border-gray-200 hover:border-gray-300",
    ].join(" ");

  const unitSuffix =
    "absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none select-none";

  // ── render ──

  return (
    <div className="space-y-5">

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-900/[0.08] shadow-xl shadow-green-900/[0.08] overflow-hidden">
        <div className="px-6 py-4 bg-gray-950 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="1.5" y="3" width="3" height="10" rx="1"/>
            <rect x="6.5" y="5.5" width="3" height="7.5" rx="1"/>
            <rect x="11.5" y="8" width="3" height="5" rx="1"/>
          </svg>
          <span className="text-sm font-bold text-white">Calorie Deficit Calculator</span>
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
              <Label htmlFor="cd-age">Age</Label>
              <input
                id="cd-age"
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

            {/* Activity */}
            <div>
              <Label htmlFor="cd-activity">Activity Level</Label>
              <div className="relative">
                <select
                  id="cd-activity"
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
          </div>

          {/* Weight + Goal Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="cd-weight">Current Weight</Label>
              <div className="flex gap-2">
                <input
                  id="cd-weight"
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

            <div>
              <Label htmlFor="cd-goalweight">Goal Weight ({weightUnit})</Label>
              <input
                id="cd-goalweight"
                type="number"
                inputMode="decimal"
                min={0}
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                placeholder={weightUnit === "lbs" ? "165" : "75"}
                className={fieldCls("goalWeight")}
              />
              {errors.goalWeight && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.goalWeight}</p>}
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

          {/* Rate of loss */}
          <div>
            <Label>Rate of Loss</Label>
            <div className="grid grid-cols-3 gap-2.5">
              {RATES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRate(r.key)}
                  className={[
                    "flex flex-col items-center gap-1 px-3 py-3.5 rounded-xl border text-center transition-all cursor-pointer",
                    rate === r.key
                      ? "border-green-400 bg-green-50 ring-1 ring-green-400/30"
                      : "border-gray-200 bg-white hover:border-gray-300",
                  ].join(" ")}
                >
                  <span className={`text-sm font-bold ${rate === r.key ? "text-green-700" : "text-gray-700"}`}>
                    {r.label}
                  </span>
                  <span className={`text-xs font-medium ${rate === r.key ? "text-green-600" : "text-gray-400"}`}>
                    {r.detail}
                  </span>
                  <span className={`text-xs ${rate === r.key ? "text-green-500" : "text-gray-300"}`}>
                    −{r.deficit} cal/day
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Body Fat % — optional */}
          <div>
            <Label htmlFor="cd-bf">
              Body Fat %{" "}
              <span className="normal-case font-normal text-gray-400">— optional</span>
            </Label>
            <div className="flex items-start gap-3">
              <div className="relative w-32">
                <input
                  id="cd-bf"
                  type="number"
                  inputMode="decimal"
                  min={5}
                  max={50}
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  placeholder="e.g. 22"
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
              Calculate My Deficit
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

          {/* Warning */}
          {results.clamped && (
            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <svg className="flex-shrink-0 w-5 h-5 text-amber-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Deficit adjusted for safety</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  This deficit may be too aggressive. Your target has been raised to the minimum safe intake
                  ({sex === "male" ? "1,500" : "1,200"} cal/day). Consider a slower rate of loss or consult a nutrition professional.
                </p>
              </div>
            </div>
          )}

          {/* Hero card */}
          <div className="rounded-2xl bg-green-700 p-6 sm:p-8 text-white">
            <p className="text-sm font-medium text-green-200/75 mb-2 tracking-wide">
              Your daily calorie target
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums leading-none">
                {results.targetCalories.toLocaleString()}
              </span>
              <span className="text-xl font-semibold text-green-300">cal / day</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                Maintenance (TDEE): {results.tdee.toLocaleString()} cal/day
              </span>
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                {results.formula === "katch" ? "Katch-McArdle formula" : "Mifflin-St Jeor formula"}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Daily deficit", value: `−${results.deficit.toLocaleString()}`, unit: "cal" },
              { label: "Weekly deficit", value: `−${results.weeklyDeficit.toLocaleString()}`, unit: "cal" },
              {
                label: "Weeks to goal",
                value: results.weeksToGoal ? results.weeksToGoal.toLocaleString() : "—",
                unit: results.weeksToGoal ? "wks" : "",
              },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
                <p className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">
                  {s.value}
                  {s.unit && <span className="text-sm font-semibold text-gray-400 ml-1">{s.unit}</span>}
                </p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Goal date + breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-[#F9FFFF] border-b border-green-50">
              <h3 className="text-sm font-bold text-gray-700">Your Plan at a Glance</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: "Maintenance calories (TDEE)", value: `${results.tdee.toLocaleString()} cal/day` },
                { label: "Daily deficit", value: `−${results.deficit.toLocaleString()} cal/day` },
                { label: "Daily calorie target", value: `${results.targetCalories.toLocaleString()} cal/day`, highlight: true },
                ...(results.goalDate
                  ? [{ label: "Estimated goal date", value: results.goalDate, highlight: false }]
                  : []),
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-5 py-3.5 ${row.highlight ? "bg-green-50" : ""}`}
                >
                  <span className={`text-sm ${row.highlight ? "font-semibold text-green-800" : "text-gray-500"}`}>
                    {row.label}
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${row.highlight ? "text-green-700" : "text-gray-800"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
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
              href="/macro-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200 hover:border-green-300 transition-colors"
            >
              Macro Calculator
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8 8.22 4.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M2.75 8a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 2.75 8z" clipRule="evenodd"/>
              </svg>
            </a>
            <a
              href="/protein-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200 hover:border-green-300 transition-colors"
            >
              Protein Calculator
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
