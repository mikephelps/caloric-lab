import { useState, useEffect, useRef } from "react";

// ─── types ───────────────────────────────────────────────────────────────────

type WeightUnit = "lbs" | "kg";
type HeightUnit = "imperial" | "metric";

// ─── constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { min: 0,    max: 18.5, label: "Underweight", textColor: "text-blue-600",   bgColor: "bg-blue-50",    borderColor: "border-blue-200"   },
  { min: 18.5, max: 25,   label: "Normal",       textColor: "text-green-700",  bgColor: "bg-green-50",   borderColor: "border-green-200"  },
  { min: 25,   max: 30,   label: "Overweight",   textColor: "text-yellow-700", bgColor: "bg-yellow-50",  borderColor: "border-yellow-200" },
  { min: 30,   max: 35,   label: "Obese I",      textColor: "text-orange-600", bgColor: "bg-orange-50",  borderColor: "border-orange-200" },
  { min: 35,   max: 40,   label: "Obese II",     textColor: "text-red-600",    bgColor: "bg-red-50",     borderColor: "border-red-200"    },
  { min: 40,   max: 999,  label: "Obese III",    textColor: "text-red-700",    bgColor: "bg-red-100",    borderColor: "border-red-300"    },
];

interface Results {
  bmi: number;
  category: typeof CATEGORIES[number];
  minHealthyLbs: number;
  maxHealthyLbs: number;
  minHealthyKg: number;
  maxHealthyKg: number;
  weightUnit: WeightUnit;
}

type Errors = Partial<Record<"weight" | "heightCm" | "heightFt" | "heightIn", string>>;

// ─── shared primitives ───────────────────────────────────────────────────────

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

// ─── main component ──────────────────────────────────────────────────────────

export default function BMICalculator() {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lbs");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("imperial");
  const [weight, setWeight]         = useState("");
  const [heightFt, setHeightFt]     = useState("");
  const [heightIn, setHeightIn]     = useState("");
  const [heightCm, setHeightCm]     = useState("");
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
    const unit = newUnit as WeightUnit;
    const val = parseFloat(weight);
    if (!isNaN(val) && val > 0) {
      if (unit === "kg"  && weightUnit === "lbs") setWeight((val * 0.453592).toFixed(1));
      if (unit === "lbs" && weightUnit === "kg")  setWeight((val * 2.20462).toFixed(1));
    }
    setWeightUnit(unit);
  }

  function handleHeightUnitChange(newUnit: string) {
    const unit = newUnit as HeightUnit;
    if (unit === "metric" && heightUnit === "imperial") {
      const ft = parseFloat(heightFt) || 0;
      const ins = parseFloat(heightIn) || 0;
      const totalIn = ft * 12 + ins;
      if (totalIn > 0) setHeightCm(Math.round(totalIn * 2.54).toString());
    }
    if (unit === "imperial" && heightUnit === "metric") {
      const cm = parseFloat(heightCm);
      if (!isNaN(cm) && cm > 0) {
        const totalIn = cm / 2.54;
        setHeightFt(Math.floor(totalIn / 12).toString());
        setHeightIn(Math.round(totalIn % 12).toString());
      }
    }
    setHeightUnit(unit);
  }

  function validate(): boolean {
    const e: Errors = {};
    const wt = parseFloat(weight);
    if (!weight || isNaN(wt) || wt <= 0) e.weight = "Enter a valid weight.";
    if (heightUnit === "imperial") {
      const ft = parseFloat(heightFt);
      if (!heightFt || isNaN(ft) || ft < 1) e.heightFt = "Enter feet.";
      const ins = parseFloat(heightIn) || 0;
      if (ins < 0 || ins >= 12) e.heightIn = "Enter 0–11 inches.";
    } else {
      const cm = parseFloat(heightCm);
      if (!heightCm || isNaN(cm) || cm < 50 || cm > 300) e.heightCm = "Enter height in cm (50–300).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function calculate() {
    if (!validate()) return;
    const weightKg = weightUnit === "kg" ? parseFloat(weight) : parseFloat(weight) * 0.453592;
    let heightM: number;
    if (heightUnit === "imperial") {
      const totalIn = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      heightM = totalIn * 0.0254;
    } else {
      heightM = parseFloat(heightCm) / 100;
    }
    const bmi = weightKg / (heightM * heightM);
    const cat = CATEGORIES.find(c => bmi >= c.min && bmi < c.max) ?? CATEGORIES[CATEGORIES.length - 1];
    const minHealthyKg = Math.round(18.5 * heightM * heightM * 10) / 10;
    const maxHealthyKg = Math.round(24.9 * heightM * heightM * 10) / 10;
    setResults({
      bmi: Math.round(bmi * 10) / 10,
      category: cat,
      minHealthyKg,
      maxHealthyKg,
      minHealthyLbs: Math.round(minHealthyKg * 2.20462 * 10) / 10,
      maxHealthyLbs: Math.round(maxHealthyKg * 2.20462 * 10) / 10,
      weightUnit,
    });
    setCalcKey(k => k + 1);
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

  return (
    <div className="space-y-5">

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-900/[0.08] shadow-xl shadow-green-900/[0.08] overflow-hidden">
        <div className="px-6 py-4 bg-gray-950 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <circle cx="8" cy="4" r="2.5"/>
            <path d="M4 14.5v-3a4 4 0 0 1 8 0v3z"/>
          </svg>
          <span className="text-sm font-bold text-white">BMI Calculator</span>
          <span className="text-sm text-gray-500">· Enter Your Details</span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {/* Weight */}
          <div>
            <Label htmlFor="bmi-weight">Body Weight</Label>
            <div className="flex gap-2">
              <input
                id="bmi-weight"
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

          {/* Height */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <Label>
                {heightUnit === "imperial" ? "Height (ft / in)" : "Height (cm)"}
              </Label>
              <TogglePill
                options={[{ label: "ft / in", value: "imperial" }, { label: "cm", value: "metric" }]}
                value={heightUnit}
                onChange={handleHeightUnitChange}
                size="sm"
              />
            </div>
            {heightUnit === "imperial" ? (
              <div className="flex gap-2">
                <div className="relative w-24">
                  <input
                    id="bmi-height-ft"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={8}
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="5"
                    className={`${fieldCls("heightFt")} pr-8`}
                  />
                  <span className={unitSuffix}>ft</span>
                </div>
                <div className="relative w-24">
                  <input
                    id="bmi-height-in"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={11}
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="10"
                    className={`${fieldCls("heightIn")} pr-7`}
                  />
                  <span className={unitSuffix}>in</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  id="bmi-height-cm"
                  type="number"
                  inputMode="numeric"
                  min={50}
                  max={300}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="178"
                  className={`${fieldCls("heightCm")} pr-12`}
                />
                <span className={unitSuffix}>cm</span>
              </div>
            )}
            {heightUnit === "imperial" && errors.heightFt && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.heightFt}</p>
            )}
            {heightUnit === "imperial" && errors.heightIn && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.heightIn}</p>
            )}
            {heightUnit === "metric" && errors.heightCm && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.heightCm}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={calculate}
              className="btn-calc w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white text-sm font-bold rounded-xl shadow-md"
            >
              Calculate My BMI
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
              Your BMI is
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums leading-none">
                {results.bmi}
              </span>
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full self-center">
                {results.category.label}
              </span>
            </div>
          </div>

          {/* Category badge + table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className={`px-5 py-3.5 border-b ${results.category.borderColor} ${results.category.bgColor} flex items-center gap-2`}>
              <span className={`text-sm font-bold ${results.category.textColor}`}>
                {results.category.label}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                — Your current BMI classification
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {CATEGORIES.map((cat) => {
                const isActive = cat.label === results.category.label;
                const rangeLabel =
                  cat.max === 999
                    ? `${cat.min}+`
                    : `${cat.min}–${cat.max}`;
                return (
                  <div
                    key={cat.label}
                    className={[
                      "flex items-center justify-between px-5 py-3 text-sm",
                      isActive
                        ? `${cat.bgColor} ring-1 ring-inset ${cat.borderColor}`
                        : "bg-gray-50",
                    ].join(" ")}
                  >
                    <span className={`font-semibold ${isActive ? cat.textColor : "text-gray-500"}`}>
                      {cat.label}
                    </span>
                    <span className={`tabular-nums font-medium ${isActive ? cat.textColor : "text-gray-400"}`}>
                      {rangeLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Healthy weight range */}
          <div className="bg-[#F9FFFF] rounded-2xl border border-green-100 p-5">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-700" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm3.72 3.28a.75.75 0 0 1 0-1.06L6.44 7.5 3.72 4.78a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06L4.78 11.28a.75.75 0 0 1-1.06 0zm4.5 0a.75.75 0 0 1 0-1.06L10.94 7.5 8.22 4.78a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Healthy weight range for your height</p>
                <p className="text-sm text-gray-600 leading-relaxed mt-1">
                  Based on a BMI of 18.5–24.9, a healthy weight for your height is{" "}
                  <strong>
                    {results.minHealthyLbs}–{results.maxHealthyLbs} lbs
                  </strong>{" "}
                  ({results.minHealthyKg}–{results.maxHealthyKg} kg).
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer note */}
          <div className="flex gap-3 px-5 py-4 bg-amber-50 rounded-2xl border border-amber-100">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368zm-.53 3.996a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75zm0 6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs text-amber-700 leading-relaxed">
              BMI is a screening tool, not a diagnostic measure. It may overestimate body fat in athletes or underestimate it in older adults.
            </p>
          </div>

          {/* CTA links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/body-fat-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Calculate your body fat %
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8 8.22 4.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M2.75 8a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 2.75 8z" clipRule="evenodd"/>
              </svg>
            </a>
            <a
              href="/ideal-weight-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200 hover:border-green-300 transition-colors"
            >
              Find your ideal weight
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
