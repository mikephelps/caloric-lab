import { useState } from "react";

const WHY_SNIPPETS = [
  {
    title: "Protein & Muscle Synthesis",
    text: "Distributing protein across meals maximizes muscle protein synthesis. Research shows 25–40g per meal is the sweet spot for most adults.",
    linkText: "Find your protein target",
    linkHref: "/protein-calculator/",
  },
  {
    title: "Morning Light & Circadian Rhythm",
    text: "Exposure to bright light within 30–60 minutes of waking anchors your circadian clock, improving sleep quality and daytime alertness.",
    linkText: null,
    linkHref: null,
  },
  {
    title: "Hydration & Cognition",
    text: "Even mild dehydration (1–2% body weight loss) impairs concentration, mood, and working memory. Most people underestimate their daily needs.",
    linkText: "Calculate your water intake",
    linkHref: "/water-intake-calculator/",
  },
  {
    title: "Habit Stacking",
    text: "Linking new behaviors to existing routines dramatically increases adherence. Small wins compound over time into transformative change.",
    linkText: null,
    linkHref: null,
  },
];

export function WhyThisWorks() {
  const [idx] = useState(() => Math.floor(Math.random() * WHY_SNIPPETS.length));
  const sn = WHY_SNIPPETS[idx];

  return (
    <div style={{
      borderRadius: 16, padding: "24px 28px",
      background: "var(--cl-dark-card)",
      border: "1px solid rgba(255,255,255,0.055)",
    }}>
      <p style={{
        fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.30)",
        letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 14,
        fontFamily: "var(--font-sans)",
      }}>
        Why This Works
      </p>
      <h3 style={{
        fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)",
        color: "rgba(255,255,255,0.78)", marginBottom: 10,
        letterSpacing: "-0.02em", lineHeight: 1.3,
      }}>
        {sn.title}
      </h3>
      <p style={{
        fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.8,
        fontFamily: "var(--font-sans)",
      }}>
        {sn.text}
      </p>
      {sn.linkText && sn.linkHref && (
        <a
          href={sn.linkHref}
          style={{
            display: "inline-block", marginTop: 14, fontSize: 12, fontWeight: 500,
            color: "rgba(160,40,40,0.65)", textDecoration: "none",
            fontFamily: "var(--font-sans)", transition: "color 0.2s",
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.color = "rgba(200,70,70,0.90)"; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(160,40,40,0.65)"; }}
        >
          {sn.linkText} →
        </a>
      )}
    </div>
  );
}
