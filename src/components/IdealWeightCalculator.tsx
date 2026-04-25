import { useState, useEffect, useRef } from "react";

// ─── types ───────────────────────────────────────────────────────────────────

type Sex        = "male" | "female";
type HeightUnit = "imperial" | "metric";

interface Results {
  devineKg:    number;
  robinsonKg:  number;
  millerKg:    number;
  devineLbs:   number;
  robinsonLbs: number;
  millerLbs:   number;
  bmiMinKg:    number;
  bmiMaxKg:    number;
  bmiMinLbs:   number;
  bmiMaxLbs:   number;
  heightM:     number;
  sex:         Sex;
  shortNote:   boolean;
}

type Errors = Partial<Record<"heightFt" | "heightIn" | "heightCm", string>>;

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

// ─── formula helpers ─────────────────────────────────────────────────────────

function clampIbw(kg: number): number {
  return Math.max(30, kg);
}

// ─── main component ──────────────────────────────────────────────────────────

export default function IdealWeightCalculator() {
  const [sex, setSex]               = useState<Sex>("male");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("imperial");
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
        const el  = resultsRef.current!;
        const top = el.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }, 80);
    }
  }, [calcKey]);

  function handleHeightUnitChange(newUnit: string) {
    const unit = newUnit as HeightUnit;
    if (unit === "metric" && heightUnit === "imperial") {
      const ft     = parseFloat(heightFt) || 0;
      const ins    = parseFloat(heightIn) || 0;
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
    if (heightUnit === "imperial") {
      const ft = parseFloat(heightFt);
      if (!heightFt || isNaN(ft) || ft < 1 || ft > 8) e.heightFt = "Enter feet (1–8).";
      const ins = parseFloat(heightIn) || 0;
      if (ins < 0 || ins >= 12) e.heightIn = "Enter inches (0–11).";
    } else {
      const cm = parseFloat(heightCm);
      if (!heightCm || isNaN(cm) || cm < 100 || cm > 250)
        e.heightCm = "Enter height in cm (100–250).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function calculate() {
    if (!validate()) return;

    // Resolve height in both inches and metres
    let totalInches: number;
    let heightM: number;
    if (heightUnit === "imperial") {
      const ft  = parseFloat(heightFt) || 0;
      const ins = parseFloat(heightIn) || 0;
      totalInches = ft * 12 + ins;
      heightM     = totalInches * 0.0254;
    } else {
      const cm = parseFloat(heightCm);
      totalInches = cm / 2.54;
      heightM     = cm / 100;
    }

    const inchesOver60 = totalInches - 60;

    // Devine (1974)
    const devineKgRaw  = sex === "male"
      ? 50   + 2.3  * inchesOver60
      : 45.5 + 2.3  * inchesOver60;

    // Robinson (1983)
    const robinsonKgRaw = sex === "male"
      ? 52   + 1.9  * inchesOver60
      : 49   + 1.7  * inchesOver60;

    // Miller (1983)
    const millerKgRaw = sex === "male"
      ? 56.2 + 1.41 * inchesOver60
      : 53.1 + 1.36 * inchesOver60;

    const round1 = (n: number) => Math.round(n * 10) / 10;

    const devineKg    = round1(clampIbw(devineKgRaw));
    const robinsonKg  = round1(clampIbw(robinsonKgRaw));
    const millerKg    = round1(clampIbw(millerKgRaw));
    const devineLbs   = round1(devineKg   * 2.20462);
    const robinsonLbs = round1(robinsonKg * 2.20462);
    const millerLbs   = round1(millerKg   * 2.20462);

    const bmiMinKg  = round1(heightM * heightM * 18.5);
    const bmiMaxKg  = round1(heightM * heightM * 24.9);
    const bmiMinLbs = round1(bmiMinKg * 2.20462);
    const bmiMaxLbs = round1(bmiMaxKg * 2.20462);

    // Flag when height is below 152 cm (5 ft exactly)
    const shortNote = heightM < 1.52;

    setResults({
      devineKg, robinsonKg, millerKg,
      devineLbs, robinsonLbs, millerLbs,
      bmiMinKg, bmiMaxKg, bmiMinLbs, bmiMaxLbs,
      heightM, sex, shortNote,
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

  const arrowIcon = (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8 8.22 4.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
      <path fillRule="evenodd" d="M2.75 8a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 2.75 8z" clipRule="evenodd"/>
    </svg>
  );

  return (
    <div className="space-y-5">

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-900/[0.08] shadow-xl shadow-green-900/[0.08] overflow-hidden">
        <div className="px-6 py-4 bg-gray-950 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <circle cx="8" cy="8" r="7" opacity="0.2"/>
            <circle cx="8" cy="8" r="4" opacity="0.5"/>
            <circle cx="8" cy="8" r="1.5"/>
          </svg>
          <span className="text-sm font-bold text-white">Ideal Weight Calculator</span>
          <span className="text-sm text-green-400">· Enter Your Details</span>
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
                </button>
              ))}
            </div>
          </div>

          {/* Height */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <Label>
                {heightUnit === "imperial" ? "Height (ft / in)" : "Height (cm)"}
              </Label>
              <TogglePill
                options={[
                  { label: "ft / in", value: "imperial" },
                  { label: "cm",      value: "metric"   },
                ]}
                value={heightUnit}
                onChange={handleHeightUnitChange}
                size="sm"
              />
            </div>

            {heightUnit === "imperial" ? (
              <div className="flex gap-2">
                <div className="relative w-24">
                  <input
                    id="iw-height-ft"
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
                    id="iw-height-in"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={11}
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="9"
                    className={`${fieldCls("heightIn")} pr-7`}
                  />
                  <span className={unitSuffix}>in</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  id="iw-height-cm"
                  type="number"
                  inputMode="numeric"
                  min={100}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="175"
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
              Calculate Ideal Weight
              {arrowIcon}
            </button>
          </div>

        </div>
      </div>

      {/* ── Results ── */}
      {results && (
        <div key={calcKey} ref={resultsRef} className="animate-fade-up space-y-4">

          {/* Hero — Devine primary result */}
          <div className="rounded-2xl bg-green-700 p-6 sm:p-8 text-white">
            <p className="text-sm font-medium text-green-200/75 mb-2 tracking-wide">
              Your ideal weight (Devine formula)
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums leading-none">
                {results.devineLbs}
              </span>
              <span className="text-xl font-semibold text-green-300">lbs</span>
            </div>
            <p className="mt-2 text-xs text-green-200/60">Devine formula (most widely used)</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                {results.devineLbs} lbs
              </span>
              <span className="text-xs font-medium text-green-100/60 bg-white/[0.1] px-3 py-1 rounded-full">
                {results.devineKg} kg
              </span>
            </div>
          </div>

          {/* Short-height note */}
          {results.shortNote && (
            <div className="flex gap-3 px-5 py-4 bg-amber-50 rounded-2xl border border-amber-100">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368zm-.53 3.996a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75zm0 6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd"/>
              </svg>
              <p className="text-xs text-amber-700 leading-relaxed">
                The Devine, Robinson, and Miller formulas were derived from adults at least 5 feet (152 cm) tall. Formula values for shorter heights are less reliable. Use the BMI healthy range below as your primary guide.
              </p>
            </div>
          )}

          {/* BMI healthy range */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-700" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm3.72 3.28a.75.75 0 0 1 0-1.06L6.44 7.5 3.72 4.78a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06L4.78 11.28a.75.75 0 0 1-1.06 0zm4.5 0a.75.75 0 0 1 0-1.06L10.94 7.5 8.22 4.78a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Healthy weight range for your height</p>
                <p className="text-2xl font-extrabold text-gray-900 tabular-nums mt-1.5">
                  {results.bmiMinLbs}
                  <span className="text-base font-semibold text-gray-500 mx-1">–</span>
                  {results.bmiMaxLbs}
                  <span className="text-base font-semibold text-gray-500 ml-1.5">lbs</span>
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {results.bmiMinKg} – {results.bmiMaxKg} kg
                </p>
                <p className="text-xs text-gray-500 mt-2">Based on BMI 18.5–24.9 (WHO Normal range)</p>
              </div>
            </div>
          </div>

          {/* Formula comparison table */}
          <div className="bg-[#F9FFFF] rounded-2xl border border-green-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-green-100">
              <p className="text-sm font-semibold text-gray-900">Formula comparison</p>
            </div>
            <div className="divide-y divide-green-50">
              {[
                { label: "Devine (1974)",   kg: results.devineKg,   lbs: results.devineLbs,   primary: true  },
                { label: "Robinson (1983)", kg: results.robinsonKg, lbs: results.robinsonLbs, primary: false },
                { label: "Miller (1983)",   kg: results.millerKg,   lbs: results.millerLbs,   primary: false },
              ].map((row) => (
                <div
                  key={row.label}
                  className={[
                    "flex items-center justify-between px-5 py-3.5",
                    row.primary ? "bg-green-50 ring-1 ring-inset ring-green-200/60" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${row.primary ? "text-green-800" : "text-gray-700"}`}>
                      {row.label}
                    </span>
                    {row.primary && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold tabular-nums ${row.primary ? "text-green-800" : "text-gray-700"}`}>
                      {row.lbs} lbs
                    </span>
                    <span className={`block text-xs tabular-nums ${row.primary ? "text-green-700" : "text-gray-500"}`}>
                      {row.kg} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Limitations note */}
          <div className="bg-[#F9FFFF] rounded-2xl border border-green-100 p-5">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-700" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-2.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75zm0-2.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">About these estimates</p>
                <p className="text-sm text-gray-600 leading-relaxed mt-1">
                  These formulas were developed for clinical drug dosing and give a single-point estimate. Your ideal weight depends on muscle mass, bone density, age, and personal health goals. Use the BMI range above as a more practical guide.
                </p>
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
              {arrowIcon}
            </a>
            <a
              href="/body-fat-calculator/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200 hover:border-green-300 transition-colors"
            >
              Calculate your body fat %
              {arrowIcon}
            </a>
          </div>

        </div>
      )}
    </div>
  );
}
