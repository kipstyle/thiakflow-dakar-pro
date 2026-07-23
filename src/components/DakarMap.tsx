import { stops, peninsulaPath } from "@/data/stops";

interface Props {
  interactive?: boolean;
  className?: string;
  activeIds?: string[];
}

export function DakarMap({ interactive = false, className = "", activeIds }: Props) {
  const active = activeIds ?? stops.map((s) => s.id);
  const activeStops = stops.filter((s) => active.includes(s.id));
  const routePath = activeStops
    .map((s, i) => `${i === 0 ? "M" : "L"}${s.x},${s.y}`)
    .join(" ");

  return (
    <div className={`glass-card relative overflow-hidden rounded-2xl ${className}`}>
      <svg viewBox="0 0 800 500" className="h-full w-full">
        <defs>
          <radialGradient id="glowBg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0b0b14" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="routeGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="500" fill="url(#glowBg)" />

        {/* grille */}
        <g stroke="#7c3aed" strokeOpacity="0.08" strokeWidth="1">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" />
          ))}
        </g>

        {/* Presqu'île */}
        <path
          d={peninsulaPath}
          fill="#14142b"
          fillOpacity="0.9"
          stroke="#7c3aed"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          filter="url(#glow)"
        />

        {/* Tracé néon */}
        {routePath && (
          <>
            <path
              d={routePath}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              opacity="0.9"
            />
            <path
              d={routePath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-dash"
            />
          </>
        )}

        {/* Points */}
        {stops.map((s) => (
          <g key={s.id} className={interactive ? "cursor-pointer" : ""}>
            <circle cx={s.x} cy={s.y} r="10" fill="#06b6d4" fillOpacity="0.2" />
            <circle
              cx={s.x}
              cy={s.y}
              r="5"
              fill="#06b6d4"
              filter="url(#glow)"
            />
            <text
              x={s.x + 12}
              y={s.y - 8}
              fill="#f5f5fa"
              fontSize="13"
              fontFamily="Space Grotesk, sans-serif"
              fontWeight="600"
            >
              {s.name}
            </text>
          </g>
        ))}

        <text
          x="20"
          y="30"
          fill="#06b6d4"
          fontSize="11"
          fontFamily="Space Grotesk"
          letterSpacing="2"
        >
          DAKAR · PRESQU'ÎLE
        </text>
      </svg>
    </div>
  );
}
