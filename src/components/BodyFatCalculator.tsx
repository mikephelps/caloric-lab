import { useState, useEffect, useRef } from "react";

type Sex = "male" | "female";
type MeasurementUnit = "imperial" | "metric"; // inches vs cm

const CATEGORIES_MALE = [
  { min: 0,   max: 6,   label: "Essential Fat", textColor: "text-blue-700",   bgColor: "bg-blue-50"   },
  { min: 6,   max: 14,  label: "Athletes",       textColor: "text-green-700",  bgColor: "bg-green-50"  },
  { min: 14,  max: 18,  label: "Fitness",         textColor: "text-teal-700",   bgColor: "bg-teal-50"   },
  { min: 18,  max: 25,  label: "Average",         textColor: "text-yellow-700", bgColor: "bg-yellow-50" },
  { min: 25,  max: 999, label: "Obese",           textColor: "text-red-600",    bgColor: "bg-red-50"    },
];

const CATEGORIES_FEMALE = [
  { min: 0,   max: 14,  label: "Essential Fat", textColor: "text-blue-700",   bgColor: "bg-blue-50"   },
  { min: 14,  max: 21,  label: "Athletes",       textColor: "text-green-700",  bgColor: "bg-green-50"  },
  { min: 21,  max: 25,  label: "Fitness",         textColor: "text-teal-700",   bgColor: "bg-teal-50"   },
  { min: 25,  max: 32,  label: "Average",         textColor: "text-yellow-700", bgColor: "bg-yellow-50" },
  { min: 32,  max: 999, label: "Obese",           textColor: "text-red-600",    bgColor: "bg-red-50"    },
];

interface Results {
  bodyFatPct: number;
  fatMassKg: number;
  leanMassKg: number;
  fatMassLbs: number;
  leanMassLbs: number;
  category: typeof CATEGORIES_MALE[number];
  weightUnit: "lbs" | "kg";
  sex: Sex;
}

type Errors = Partial<Record<"weight" | "height" | "waist" | "neck" | "hip", string>>;

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

export default function BodyFatCalculator() {
  const [sex, setSex]                   = useState<Sex>("male");
  const [measureUnit, setMeasureUnit]   = useState<MeasurementUnit>("imperial");
  const [weightUnit, setWeightUnit]     = useState<"lbs" | "kg">("lbs");
  const [weight, setWeight]             = useState("");
  const [height, setHeight]             = useState(""); // inches or cm
  const [waist, setWaist]               = useState(""); // inches or cm
  const [neck, setNeck]                 = useState(""); // inches or cm
  const [hip, setHip]                   = useState(""); // women only, inches or cm
  const [results, setResults]           = useState<Results | null>(null);
  const [calcKey, setCalcKey]           = useState(0);
  const [errors, setErrors]             = useState<Errors>({});
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

  function toCm(value: number): number {
    return measureUnit === "imperial" ? value * 2.54 : value;
  }

  function validate(): boolean {
    const e: Errors = {};

    const wtN = parseFloat(weight);
    if (!weight || isNaN(wtN) || wtN <= 0)
      e.weight = "Enter a valid weight.";

    const htN = parseFloat(height);
    if (!height || isNaN(htN)) {
      e.height = "Enter a valid height.";
    } else {
      const htCm = toCm(htN);
      if (htCm <= 50 || htCm >= 300)
        e.height = measureUnit === "imperial"
          ? "Enter a height between 20 and 120 inches."
          : "Enter a height between 50 and 300 cm.";
    }

    const waistN = parseFloat(waist);
    if (!waist || isNaN(waistN) || waistN <= 0)
      e.waist = "Enter a valid waist measurement.";

    const neckN = parseFloat(neck);
    if (!neck || isNaN(neckN) || neckN <= 0)
      e.neck = "Enter a valid neck measurement.";

    if (sex === "male") {
      if (!e.waist && !e.neck) {
        if (waistN <= neckN)
          e.waist = "Waist must be larger than neck for this formula.";
      }
    } else {
      const hipN = parseFloat(hip);
      if (!hip || isNaN(hipN) || hipN <= 0) {
        e.hip = "Enter a valid hip measurement.";
      } else if (!e.waist && !e.neck) {
        if (waistN + hipN <= neckN)
          e.waist = "Waist must be larger than neck for this formula.";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function calculate() {
    if (!validate()) return;

    const waistCm  = toCm(parseFloat(waist));
    const neckCm   = toCm(parseFloat(neck));
    const heightCm = toCm(parseFloat(height));

    let bodyFatPct: number;

    if (sex === "male") {
      bodyFatPct =
        495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      const hipCm = toCm(parseFloat(hip));
      bodyFatPct =
        495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
    }

    // Clamp to 1–65 to avoid formula edge cases
    bodyFatPct = Math.min(65, Math.max(1, bodyFatPct));
    bodyFatPct = Math.round(bodyFatPct * 10) / 10;

    const weightKg = weightUnit === "lbs"
      ? parseFloat(weight) * 0.453592
      : parseFloat(weight);

    const fatMassKg  = (bodyFatPct / 100) * weightKg;
    const leanMassKg = weightKg - fatMassKg;

    const categories = sex === "male" ? CATEGORIES_MALE : CATEGORIES_FEMALE;
    const category = categories.find(
      (c) => bodyFatPct >= c.min && bodyFatPct < c.max
    ) ?? categories[categories.length - 1];

    setResults({
      bodyFatPct,
      fatMassKg:  Math.round(fatMassKg  * 10) / 10,
      leanMassKg: Math.round(leanMassKg * 10) / 10,
      fatMassLbs:  Math.round(fatMassKg  * 2.20462 * 10) / 10,
      leanMassLbs: Math.round(leanMassKg * 2.20462 * 10) / 10,
      category,
      weightUnit,
      sex,
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
    "absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 pointer-events-none select-none";

  const cardBtn = (active: boolean) =>
    [
      "flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer w-full",
      active
        ? "border-green-400 bg-green-50 ring-1 ring-green-400/30"
        : "border-gray-200 bg-white hover:border-gray-300",
    ].join(" ");

  const measureSuffix = measureUnit === "imperial" ? "in" : "cm";

  return (
    <div className="space-y-5">

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-900/[0.08] shadow-xl shadow-green-900/[0.08] overflow-hidden">
        <div className="px-6 py-4 bg-gray-950 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="1" y="7" width="14" height="2" rx="1"/>
            <rect x="2.5" y="5" width="1.5" height="2" rx="0.5"/>
            <rect x="5.5" y="5.5" width="1.5" height="1.5" rx="0.5"/>
            <rect x="8.5" y="5" width="1.5" height="2" rx="0.5"/>
            <rect x="11.5" y="5.5" width="1.5" height="1.5" rx="0.5"/>
          </svg>
          <span className="text-sm font-bold text-white">Body Fat Calculator</span>
          <span className="text-sm text-green-400">· Enter Your Measurements</span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">

          {/* Sex */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">Sex</p>
            <div className="grid grid-cols-2 gap-2.5">
              {(["male", "female"] as Sex[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className={cardBtn(sex === s)}
                >
                  <span className={`text-sm font-bold ${sex === s ? "text-green-700" : "text-gray-700"}`}>
                    {s === "male" ? "Male" : "Female"}
                  </span>
                  <span className={`text-xs ${sex === s ? "text-green-700" : "text-gray-500"}`}>
                    {s === "male" ? "Waist + neck" : "Waist + hip + neck"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Measurement units */}
          <div>
            <Label>Measurement Units</Label>
            <TogglePill
              options={[{ label: "in", value: "imperial" }, { label: "cm", value: "metric" }]}
              value={measureUnit}
              onChange={(v) => setMeasureUnit(v as MeasurementUnit)}
            />
          </div>

          {/* Body Weight */}
          <div>
            <Label htmlFor="bfc-weight">Body Weight</Label>
            <div className="flex gap-2">
              <input
                id="bfc-weight"
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
            <Label htmlFor="bfc-height">Height</Label>
            <div className="relative">
              <input
                id="bfc-height"
                type="number"
                inputMode="decimal"
                min={0}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={measureUnit === "imperial" ? "70" : "178"}
                className={`${fieldCls("height")} pr-10`}
              />
              <span className={unitSuffix}>{measureSuffix}</span>
            </div>
            {errors.height && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.height}</p>}
          </div>

          {/* Waist */}
          <div>
            <Label htmlFor="bfc-waist">Waist (at navel)</Label>
            <div className="relative">
              <input
                id="bfc-waist"
                type="number"
                inputMode="decimal"
                min={0}
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder={measureUnit === "imperial" ? "34" : "86"}
                className={`${fieldCls("waist")} pr-10`}
              />
              <span className={unitSuffix}>{measureSuffix}</span>
            </div>
            {errors.waist && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.waist}</p>}
          </div>

          {/* Neck */}
          <div>
            <Label htmlFor="bfc-neck">Neck (widest point)</Label>
            <div className="relative">
              <input
                id="bfc-neck"
                type="number"
                inputMode="decimal"
                min={0}
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
                placeholder={measureUnit === "imperial" ? "15" : "38"}
                className={`${fieldCls("neck")} pr-10`}
              />
              <span className={unitSuffix}>{measureSuffix}</span>
            </div>
            {errors.neck && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.neck}</p>}
          </div>

          {/* Hip — women only */}
          {sex === "female" && (
            <div>
              <Label htmlFor="bfc-hip">Hip (widest point)</Label>
              <div className="relative">
                <input
                  id="bfc-hip"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  placeholder={measureUnit === "imperial" ? "39" : "99"}
                  className={`${fieldCls("hip")} pr-10`}
                />
                <span className={unitSuffix}>{measureSuffix}</span>
              </div>
              {errors.hip && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.hip}</p>}
            </div>
          )}

          {/* Helper note */}
          <p className="text-xs text-gray-500 leading-relaxed -mt-2">
            Measure waist at the widest point, neck below the Adam's apple.
          </p>

          {/* Submit */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={calculate}
              className="btn-calc w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white text-sm font-bold rounded-xl shadow-md"
            >
              Calculate Body Fat %
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
              Your body fat percentage
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums leading-none">
                {results.bodyFatPct}
              </span>
              <span className="text-xl font-semibold text-green-300">% body fat</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                Fat mass:{" "}
                {results.weightUnit === "lbs"
                  ? `${results.fatMassLbs} lbs`
                  : `${results.fatMassKg} kg`}
              </span>
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                Lean mass:{" "}
                {results.weightUnit === "lbs"
                  ? `${results.leanMassLbs} lbs`
                  : `${results.leanMassKg} kg`}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">
                {results.weightUnit === "lbs" ? results.fatMassLbs : results.fatMassKg}
                <span className="text-sm font-semibold text-gray-500 ml-1">
                  {results.weightUnit === "lbs" ? "lbs" : "kg"}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">Fat mass</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">
                {results.weightUnit === "lbs" ? results.leanMassLbs : results.leanMassKg}
                <span className="text-sm font-semibold text-gray-500 ml-1">
                  {results.weightUnit === "lbs" ? "lbs" : "kg"}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">Lean mass</p>
            </div>
          </div>

          {/* Category card */}
          <div className="bg-[#F9FFFF] rounded-2xl border border-green-100 p-5">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-700" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-2.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75zm0-2.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Your category:{" "}
                  <span className={results.category.textColor}>{results.category.label}</span>
                </p>
                <div className="mt-3 space-y-1.5">
                  {(results.sex === "male" ? CATEGORIES_MALE : CATEGORIES_FEMALE).map((cat) => {
                    const isActive = cat.label === results.category.label;
                    const rangeLabel =
                      cat.max === 999
                        ? `${cat.min}%+`
                        : `${cat.min}–${cat.max}%`;
                    return (
                      <div
                        key={cat.label}
                        className={[
                          "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all",
                          isActive
                            ? `${cat.bgColor} ${cat.textColor} ring-1 ring-current/20`
                            : "text-gray-500",
                        ].join(" ")}
                      >
                        <span>{cat.label}</span>
                        <span className="tabular-nums">{rangeLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* CTA links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/bmi-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Calculate your BMI
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
