import { useEffect, useRef } from 'react';

/**
 * Non-sticky architectural hanging Sayapatri marigold toran & jhilimili fairy light festoon.
 * Placed cleanly beneath the header so mobile sticky chrome stays under 15%.
 */
export function FestiveGarlandStrip({ isMidnight = false }: { isMidnight?: boolean }) {
  const festoonCount = 7;
  const bulbs = Array.from({ length: 15 }, (_, idx) => ({
    x: 42 + idx * 94,
    y: 12 + Math.sin((idx / 14) * Math.PI * 5) * 10,
    delay: `${(idx % 5) * 0.45}s`,
  }));

  return (
    <div
      aria-hidden="true"
      className={`w-full overflow-hidden border-b pointer-events-none select-none transition-colors duration-300 ${
        isMidnight
          ? 'border-[#E89B1E]/25 bg-[#05030A]/95'
          : 'border-[#E89B1E]/10 bg-[#120D1A]/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <svg
          viewBox="0 0 1400 46"
          preserveAspectRatio="none"
          className="w-full h-7 sm:h-9 block"
        >
          {/* Subtle catenary fairy light wire */}
          <path
            d="M 0 6 Q 175 26 350 8 T 700 8 T 1050 8 T 1400 6"
            fill="none"
            stroke={isMidnight ? 'rgba(255, 190, 72, 0.55)' : 'rgba(232, 155, 30, 0.35)'}
            strokeWidth="1.4"
          />

          {/* Alternating Marigold & Makhamali hanging toran loops */}
          {Array.from({ length: festoonCount }, (_, loopIdx) => {
            const startX = loopIdx * 200;
            const midX = startX + 100;
            const endX = startX + 200;
            return (
              <g key={loopIdx} className="animate-toran-sway">
                {/* Garland loop arc */}
                <path
                  d={`M ${startX} 4 Q ${midX} 34 ${endX} 4`}
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  opacity={isMidnight ? '0.62' : '0.72'}
                />
                {/* Marigold blossoms along each loop */}
                {[0.2, 0.35, 0.5, 0.65, 0.8].map((t, bIdx) => {
                  const bx = startX + (endX - startX) * t;
                  const by = 4 + Math.sin(t * Math.PI) * 16;
                  const fill =
                    bIdx === 2 ? '#A63A79' : bIdx % 2 === 0 ? '#F59E0B' : '#EA580C';
                  return (
                    <circle
                      key={bIdx}
                      cx={bx}
                      cy={by}
                      r={bIdx === 2 ? 5.2 : 4.2}
                      fill={fill}
                      opacity={isMidnight ? '0.88' : '0.92'}
                    />
                  );
                })}
                {/* Center hanging Makhamali tassel */}
                <line
                  x1={midX}
                  y1={20}
                  x2={midX}
                  y2={34}
                  stroke="#E89B1E"
                  strokeWidth="1.2"
                  opacity="0.7"
                />
                <circle cx={midX} cy={36} r="3.4" fill="#C93B2B" />
              </g>
            );
          })}

          {/* Warm shimmering jhilimili bulbs */}
          {bulbs.map((b, idx) => (
            <g
              key={idx}
              className="animate-jhilimili"
              style={{ animationDelay: b.delay, transformOrigin: `${b.x}px ${b.y}px` }}
            >
              <circle
                cx={b.x}
                cy={b.y}
                r={isMidnight ? '11.5' : '6.5'}
                fill={isMidnight ? 'rgba(255, 188, 64, 0.34)' : 'rgba(255, 190, 64, 0.22)'}
              />
              <circle cx={b.x} cy={b.y} r={isMidnight ? '3.3' : '2.6'} fill="#FFE6A3" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

interface PetalParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  color: string;
  alpha: number;
  isSpark: boolean;
}

interface MarigoldShowerOverlayProps {
  burstNonce: number;
}

const PETAL_COLORS = ['#F59E0B', '#EA580C', '#FBBF24', '#A63A79', '#FFE082'];

/**
 * Hardware-friendly 2D canvas overlay that showers fluttering Sayapatri marigold petals
 * and golden embers whenever a lamp is kindled or a courtyard wish is lit.
 */
export function MarigoldShowerOverlay({ burstNonce }: MarigoldShowerOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<PetalParticle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (burstNonce <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Spawn 46 fluttering marigold petals & sparks across upper third of viewport
    const spawned: PetalParticle[] = Array.from({ length: 46 }, (_, i) => {
      const isSpark = i % 3 === 0;
      return {
        x: Math.random() * width,
        y: -15 - Math.random() * (height * 0.25),
        vx: (Math.random() - 0.5) * (isSpark ? 2.4 : 1.6),
        vy: (isSpark ? 2.1 : 1.45) + Math.random() * 2.1,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        size: isSpark ? 2.4 + Math.random() * 2.2 : 5 + Math.random() * 5,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
        alpha: 0.95,
        isSpark,
      };
    });

    particlesRef.current = [...particlesRef.current.slice(-60), ...spawned];

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = () => {
      const list = particlesRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx + Math.sin(p.y * 0.025) * 0.45;
        p.y += p.vy;
        p.rot += p.vRot;
        p.alpha -= 0.0048;

        if (p.alpha <= 0.02 || p.y > canvas.height + 24) {
          list.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        if (p.isSpark) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Organic marigold petal silhouette
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (list.length > 0) {
        rafRef.current = window.requestAnimationFrame(renderLoop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = 0;
      }
    };

    if (!rafRef.current) {
      rafRef.current = window.requestAnimationFrame(renderLoop);
    }
  }, [burstNonce]);

  useEffect(() => {
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}
