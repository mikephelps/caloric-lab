import { useState, useEffect, useRef } from "react";

interface Results {
  mifflin:  number;
  harris:   number;
  katch:    number | null;
}

type Errors = Partial<Record<"age" | "weight" | "height" | "bodyFat", string>>;

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

export default function BMRCalculator() {
  const [sex, setSex]               = useState<"male" | "female">("male");
  const [age, setAge]               = useState("");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [weight, setWeight]         = useState("");
  const [heightUnit, setHeightUnit] = useState<"imperial" | "metric">("imperial");
  const [heightFt, setHeightFt]     = useState("");
  const [heightIn, setHeightIn]     = useState("");
  const [heightCm, setHeightCm]     = useState("");
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

  // ── unit conversion ──

  function handleWeightUnitChange(newUnit: string) {
    const unit = newUnit as "lbs" | "kg";
    const val = parseFloat(weight);
    if (!isNaN(val) && val > 0) {
      if (unit === "kg"  && weightUnit === "lbs") setWeight((val * 0.453592).toFixed(1));
      if (unit === "lbs" && weightUnit === "kg")  setWeight((val * 2.20462).toFixed(1));
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
      e.weight = "Enter a valid weight.";

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

    const weightKg =
      weightUnit === "lbs" ? parseFloat(weight) * 0.453592 : parseFloat(weight);

    const heightCmVal =
      heightUnit === "imperial"
        ? ((parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)) * 2.54
        : parseFloat(heightCm);

    const ageN = parseInt(age);

    // Mifflin-St Jeor
    const mifflin =
      sex === "male"
        ? 10 * weightKg + 6.25 * heightCmVal - 5 * ageN + 5
        : 10 * weightKg + 6.25 * heightCmVal - 5 * ageN - 161;

    // Harris-Benedict (revised)
    const harris =
      sex === "male"
        ? 13.397 * weightKg + 4.799 * heightCmVal - 5.677 * ageN + 88.362
        : 9.247  * weightKg + 3.098 * heightCmVal - 4.330 * ageN + 447.593;

    // Katch-McArdle (only if body fat provided)
    let katch: number | null = null;
    if (bodyFat) {
      const leanMass = weightKg * (1 - parseFloat(bodyFat) / 100);
      katch = 370 + 21.6 * leanMass;
    }

    setResults({
      mifflin: Math.round(mifflin),
      harris:  Math.round(harris),
      katch:   katch !== null ? Math.round(katch) : null,
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
            <path d="M8 12.5c-3.5-2.5-6.5-5-6.5-8a3.5 3.5 0 0 1 6.5-2 3.5 3.5 0 0 1 6.5 2c0 3-3 5.5-6.5 8z"/>
          </svg>
          <span className="text-sm font-bold text-white">BMR Calculator</span>
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
              <Label htmlFor="bmr-age">Age</Label>
              <input
                id="bmr-age"
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
              <Label htmlFor="bmr-weight">Weight</Label>
              <div className="flex gap-2">
                <input
                  id="bmr-weight"
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

          {/* Body Fat % — optional */}
          <div>
            <Label htmlFor="bmr-bf">
              Body Fat %{" "}
              <span className="normal-case font-normal text-gray-400">— optional, unlocks Katch-McArdle</span>
            </Label>
            <div className="flex items-start gap-3">
              <div className="relative w-32">
                <input
                  id="bmr-bf"
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
                Enables a third formula that accounts for your lean muscle mass directly.
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
              Calculate My BMR
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

          {/* Primary BMR hero */}
          <div className="rounded-2xl bg-green-700 p-6 sm:p-8 text-white">
            <p className="text-sm font-medium text-green-200/75 mb-2 tracking-wide">
              Your Basal Metabolic Rate
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums leading-none">
                {results.mifflin.toLocaleString()}
              </span>
              <span className="text-xl font-semibold text-green-300">cal / day</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                Mifflin-St Jeor formula
              </span>
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                At complete rest
              </span>
            </div>
          </div>

          {/* Formula comparison table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700">Formula Comparison</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Different equations, same person — see how they compare
              </p>
            </div>
            <div className="divide-y divide-gray-50">

              {/* Mifflin-St Jeor — primary */}
              <div className="flex items-center gap-4 px-5 py-4 bg-green-50">
                <div className="flex-shrink-0 w-1 h-12 rounded-full bg-green-500" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-green-700">Mifflin-St Jeor</span>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Most accurate for the general population
                  </p>
                </div>
                <span className="flex-shrink-0 text-lg font-bold tabular-nums text-green-700">
                  {results.mifflin.toLocaleString()}
                </span>
              </div>

              {/* Harris-Benedict */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex-shrink-0 w-1 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-700">Harris-Benedict</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Revised 1984 equation — tends to run slightly higher
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-lg font-bold tabular-nums text-gray-600">
                    {results.harris.toLocaleString()}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {results.harris > results.mifflin ? "+" : ""}
                    {(results.harris - results.mifflin).toLocaleString()} vs Mifflin
                  </p>
                </div>
              </div>

              {/* Katch-McArdle — conditional */}
              {results.katch !== null ? (
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-shrink-0 w-1 h-12 rounded-full bg-teal-400" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-700">Katch-McArdle</span>
                      <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        Body fat adjusted
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Based on lean mass — most accurate when body fat is known
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-lg font-bold tabular-nums text-gray-600">
                      {results.katch.toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {results.katch > results.mifflin ? "+" : ""}
                      {(results.katch - results.mifflin).toLocaleString()} vs Mifflin
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 px-5 py-4 opacity-40">
                  <div className="flex-shrink-0 w-1 h-12 rounded-full bg-gray-100" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-500">Katch-McArdle</span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Enter body fat % above to unlock this formula
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-300">—</span>
                </div>
              )}
            </div>
          </div>

          {/* Warning / explanation */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <svg className="flex-shrink-0 w-5 h-5 text-amber-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Important</p>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                  This is the minimum calories your body needs at complete rest. Never eat below this
                  number without medical supervision — doing so can impair organ function and metabolism.
                </p>
              </div>
            </div>
          </div>

          {/* TDEE CTA */}
          <a
            href="/tdee-calculator/"
            className="group flex items-center justify-between gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 hover:border-green-300 hover:shadow-md transition-all"
          >
            <div>
              <p className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                Calculate your full daily calorie needs (TDEE)
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Add your activity level to BMR to get your total daily energy expenditure
              </p>
            </div>
            <svg className="flex-shrink-0 w-5 h-5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10z" clipRule="evenodd"/>
            </svg>
          </a>

        </div>
      )}
    </div>
  );
}
