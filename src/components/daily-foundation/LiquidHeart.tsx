import { useState, useEffect, useRef, useId } from "react";
import { CarbonationBurst } from "./CarbonationBurst";

const HEART_PATH = "M140 250 C140 250 15 175 15 85 C15 35 55 5 95 5 C115 5 132 18 140 32 C148 18 165 5 185 5 C225 5 265 35 265 85 C265 175 140 250 140 250Z";

interface LiquidHeartProps {
  fillPercent: number;
  completedCount: number;
  targetCount: number;
}

export function LiquidHeart({ fillPercent, completedCount, targetCount }: LiquidHeartProps) {
  const uid = useId().replace(/:/g, "x");
  const clipId = `lh-clip-${uid}`;
  const gradId = `lh-lq-${uid}`;
  const gradLightId = `lh-lqL-${uid}`;
  const gradDarkId = `lh-lqD-${uid}`;

  const intensity = fillPercent / 100;
  const isFull = fillPercent >= 100;
  const [showBurst, setShowBurst] = useState(false);
  const prevCompleted = useRef(completedCount);

  useEffect(() => {
    if (completedCount > prevCompleted.current && completedCount >= targetCount) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 3500);
    }
    prevCompleted.current = completedCount;
  }, [completedCount, targetCount]);

  const liquidTop = isFull ? -5 : 255 - (fillPercent / 100) * 255;
  const waveY = liquidTop;
  const ampBase = 4 + intensity * 10;
  const amp1 = ampBase;
  const amp2 = ampBase * 0.7;
  const amp3 = ampBase * 0.45;
  const speed1 = Math.max(1.5, 4 - intensity * 2);
  const speed2 = Math.max(1.5, 5 - intensity * 2.5);
  const speed3 = Math.max(1.5, 3.5 - intensity * 1.5);
  const bobSpeed = Math.max(2, 3.5 - intensity * 1.5);
  const bobAmp = (3 + intensity * 5).toFixed(1);
  const ringBase = 0.08 + intensity * 0.12;
  const glowR = isFull ? 36 : 8 + intensity * 28;
  const glowO = isFull ? 0.70 : 0.10 + intensity * 0.45;
  const pulseScale = isFull ? 1.03 : 1.015;
  const pulseSpeed = isFull ? 1.8 : Math.max(1.4, 2.6 - intensity * 1.2);
  const counterColor = fillPercent > 42 ? "rgba(255,255,255,0.88)" : "rgba(255,170,170,0.35)";

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 375, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes hbP {
          0%,100% { filter: drop-shadow(0 0 ${glowR}px rgba(170,35,35,${glowO.toFixed(2)})); transform: scale(1); }
          50% { filter: drop-shadow(0 0 ${(glowR * 1.5).toFixed(1)}px rgba(170,35,35,${(glowO * 1.25).toFixed(2)})); transform: scale(${pulseScale}); }
        }
        @keyframes hbF {
          0%,100% { filter: drop-shadow(0 0 36px rgba(170,35,35,0.70)) drop-shadow(0 0 72px rgba(150,25,25,0.30)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 52px rgba(180,40,40,0.80)) drop-shadow(0 0 96px rgba(155,30,30,0.40)); transform: scale(1.03); }
        }
        @keyframes lW1 { 0% { transform: translateX(0); } 100% { transform: translateX(-200px); } }
        @keyframes lW2 { 0% { transform: translateX(-200px); } 100% { transform: translateX(0); } }
        @keyframes lW3 { 0% { transform: translateX(-50px); } 100% { transform: translateX(-250px); } }
        @keyframes lBob {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(${bobAmp}px); }
        }
      `}</style>
      <CarbonationBurst active={showBurst} />
      <svg
        viewBox="-35 -35 350 330"
        style={{ width: "100%", animation: isFull ? `hbF ${pulseSpeed}s ease-in-out infinite` : `hbP ${pulseSpeed}s ease-in-out infinite` }}
        aria-label={`${completedCount} of ${targetCount} habits complete`}
        role="img"
      >
        <defs>
          <clipPath id={clipId}><path d={HEART_PATH} /></clipPath>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#7a1616" />
            <stop offset="45%" stopColor="#a82828" />
            <stop offset="100%" stopColor="#bf3030" />
          </linearGradient>
          <linearGradient id={gradLightId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#8a1e1e" />
            <stop offset="50%" stopColor="#c43535" />
            <stop offset="100%" stopColor="#d44040" />
          </linearGradient>
          <linearGradient id={gradDarkId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#5e1010" />
            <stop offset="50%" stopColor="#7a1a1a" />
            <stop offset="100%" stopColor="#922222" />
          </linearGradient>
        </defs>

        {/* Concentric rings — scale from heart center */}
        <path d={HEART_PATH} fill="none" stroke={`rgba(190,60,60,${(ringBase * 0.2).toFixed(3)})`} strokeWidth="3" transform="translate(-14,-12) scale(1.1)" />
        <path d={HEART_PATH} fill="none" stroke={`rgba(190,60,60,${(ringBase * 0.5).toFixed(3)})`} strokeWidth="3" transform="translate(-7,-6) scale(1.05)" />
        <path d={HEART_PATH} fill="none" stroke={`rgba(190,60,60,${ringBase.toFixed(3)})`} strokeWidth="3" />

        {/* Heart background */}
        <path d={HEART_PATH} fill="rgba(25,6,6,0.45)" />

        {/* Multi-wave liquid fill */}
        <g clipPath={`url(#${clipId})`}>
          {/* Base with vertical bob */}
          <g style={{ animation: `lBob ${bobSpeed}s ease-in-out infinite` }}>
            <rect
              x="-400"
              y={liquidTop}
              width="1200"
              height={290}
              fill={`url(#${gradId})`}
              style={{ transition: "y 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
          </g>

          {fillPercent > 0 && (
            <>
              {/* Wave 1 — primary surface, moves left */}
              <g style={{ animation: `lW1 ${speed1}s linear infinite` }}>
                <path
                  d={`M-400 ${waveY} Q-350 ${waveY - amp1} -300 ${waveY} Q-250 ${waveY + amp1} -200 ${waveY} Q-150 ${waveY - amp1} -100 ${waveY} Q-50 ${waveY + amp1} 0 ${waveY} Q50 ${waveY - amp1} 100 ${waveY} Q150 ${waveY + amp1} 200 ${waveY} Q250 ${waveY - amp1} 300 ${waveY} Q350 ${waveY + amp1} 400 ${waveY} Q450 ${waveY - amp1} 500 ${waveY} Q550 ${waveY + amp1} 600 ${waveY} Q650 ${waveY - amp1} 700 ${waveY} Q750 ${waveY + amp1} 800 ${waveY} Q850 ${waveY - amp1} 900 ${waveY} V280 H-400Z`}
                  fill={`url(#${gradLightId})`}
                  opacity={0.35 + intensity * 0.2}
                />
              </g>
              {/* Wave 2 — counter-direction, creates churn */}
              <g style={{ animation: `lW2 ${speed2}s linear infinite` }}>
                <path
                  d={`M-400 ${waveY + 6} Q-340 ${waveY + 6 - amp2} -280 ${waveY + 6} Q-220 ${waveY + 6 + amp2} -160 ${waveY + 6} Q-100 ${waveY + 6 - amp2} -40 ${waveY + 6} Q20 ${waveY + 6 + amp2} 80 ${waveY + 6} Q140 ${waveY + 6 - amp2} 200 ${waveY + 6} Q260 ${waveY + 6 + amp2} 320 ${waveY + 6} Q380 ${waveY + 6 - amp2} 440 ${waveY + 6} Q500 ${waveY + 6 + amp2} 560 ${waveY + 6} Q620 ${waveY + 6 - amp2} 680 ${waveY + 6} Q740 ${waveY + 6 + amp2} 800 ${waveY + 6} Q860 ${waveY + 6 - amp2} 920 ${waveY + 6} V280 H-400Z`}
                  fill={`url(#${gradDarkId})`}
                  opacity={0.3 + intensity * 0.25}
                />
              </g>
              {/* Wave 3 — deep interior movement (> 20%) */}
              {fillPercent > 20 && (
                <g style={{ animation: `lW3 ${speed3}s linear infinite` }}>
                  <path
                    d={`M-400 ${waveY + 30 + intensity * 20} Q-330 ${waveY + 30 + intensity * 20 - amp3} -260 ${waveY + 30 + intensity * 20} Q-190 ${waveY + 30 + intensity * 20 + amp3} -120 ${waveY + 30 + intensity * 20} Q-50 ${waveY + 30 + intensity * 20 - amp3} 20 ${waveY + 30 + intensity * 20} Q90 ${waveY + 30 + intensity * 20 + amp3} 160 ${waveY + 30 + intensity * 20} Q230 ${waveY + 30 + intensity * 20 - amp3} 300 ${waveY + 30 + intensity * 20} Q370 ${waveY + 30 + intensity * 20 + amp3} 440 ${waveY + 30 + intensity * 20} Q510 ${waveY + 30 + intensity * 20 - amp3} 580 ${waveY + 30 + intensity * 20} Q650 ${waveY + 30 + intensity * 20 + amp3} 720 ${waveY + 30 + intensity * 20} Q790 ${waveY + 30 + intensity * 20 - amp3} 860 ${waveY + 30 + intensity * 20} Q930 ${waveY + 30 + intensity * 20 + amp3} 1000 ${waveY + 30 + intensity * 20} V280 H-400Z`}
                    fill={`url(#${gradLightId})`}
                    opacity={0.12 + intensity * 0.15}
                  />
                </g>
              )}
              {/* Wave 4 — deep slow movement (> 50%) */}
              {fillPercent > 50 && (
                <g style={{ animation: `lW1 ${(speed1 * 1.3).toFixed(2)}s linear infinite` }}>
                  <path
                    d={`M-400 ${waveY + 60 + intensity * 30} Q-320 ${waveY + 60 + intensity * 30 - amp3 * 0.8} -240 ${waveY + 60 + intensity * 30} Q-160 ${waveY + 60 + intensity * 30 + amp3 * 0.8} -80 ${waveY + 60 + intensity * 30} Q0 ${waveY + 60 + intensity * 30 - amp3 * 0.8} 80 ${waveY + 60 + intensity * 30} Q160 ${waveY + 60 + intensity * 30 + amp3 * 0.8} 240 ${waveY + 60 + intensity * 30} Q320 ${waveY + 60 + intensity * 30 - amp3 * 0.8} 400 ${waveY + 60 + intensity * 30} Q480 ${waveY + 60 + intensity * 30 + amp3 * 0.8} 560 ${waveY + 60 + intensity * 30} Q640 ${waveY + 60 + intensity * 30 - amp3 * 0.8} 720 ${waveY + 60 + intensity * 30} Q800 ${waveY + 60 + intensity * 30 + amp3 * 0.8} 880 ${waveY + 60 + intensity * 30} V280 H-400Z`}
                    fill={`url(#${gradDarkId})`}
                    opacity={0.1 + intensity * 0.12}
                  />
                </g>
              )}
            </>
          )}
        </g>

        {/* Heart outline overlay */}
        <path d={HEART_PATH} fill="none" stroke="rgba(190,60,60,0.18)" strokeWidth="1.5" />

        {/* Counter — Cabinet Grotesk, color transitions at 42% fill */}
        <text
          x="140" y="125"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-display)"
          fontSize="18"
          fontWeight="700"
          fill={counterColor}
          style={{ transition: "fill 0.5s" }}
        >
          {completedCount} of {targetCount}
        </text>
      </svg>
    </div>
  );
}
