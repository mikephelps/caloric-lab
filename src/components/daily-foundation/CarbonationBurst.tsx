import { useEffect, useRef } from "react";

interface Orb {
  x: number; y: number; r: number;
  vx: number; vy: number;
  opacity: number; life: number; decay: number; hue: number;
}

export function CarbonationBurst({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Orb[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 360;
    canvas.height = 360;

    const spawn = () => {
      for (let i = 0; i < 30; i++) {
        orbsRef.current.push({
          x: 120 + Math.random() * 120,
          y: 150 + Math.random() * 80,
          r: 1.5 + Math.random() * 4.5,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -(2 + Math.random() * 5),
          opacity: 0.5 + Math.random() * 0.5,
          life: 1,
          decay: 0.005 + Math.random() * 0.007,
          hue: 348 + Math.random() * 16,
        });
      }
    };

    spawn();
    const t1 = setTimeout(spawn, 250);
    const t2 = setTimeout(spawn, 550);
    const t3 = setTimeout(spawn, 900);

    const animate = () => {
      ctx.clearRect(0, 0, 360, 360);
      orbsRef.current = orbsRef.current.filter(o => o.life > 0);
      orbsRef.current.forEach(o => {
        o.x += o.vx + Math.sin(Date.now() * 0.004 + o.x) * 0.4;
        o.y += o.vy;
        o.vy *= 0.985;
        o.life -= o.decay;
        o.r *= 0.997;
        const a = o.life * o.opacity;

        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},65%,58%,${a})`);
        g.addColorStop(0.5, `hsla(${o.hue},55%,45%,${a * 0.5})`);
        g.addColorStop(1, `hsla(${o.hue},50%,35%,0)`);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r * 3, 0, Math.PI * 2);
        const gl = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 3);
        gl.addColorStop(0, `hsla(${o.hue},65%,55%,${a * 0.15})`);
        gl.addColorStop(1, `hsla(${o.hue},65%,55%,0)`);
        ctx.fillStyle = gl;
        ctx.fill();
      });
      if (orbsRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      cancelAnimationFrame(rafRef.current);
      orbsRef.current = [];
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 360, height: 360,
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}
