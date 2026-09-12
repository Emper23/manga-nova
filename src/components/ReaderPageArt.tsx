import { useId, useMemo } from "react";

/** Deterministic PRNG (same seed + page => same art) */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INK = ["#1a1a24", "#23232f", "#181820", "#2a2a38"];
const PANEL_BG = ["#f4f1ea", "#ece8e0", "#f7f4ee", "#e9e5dc"];

interface Props {
  seed: number;
  page: number;
  width: number;
  height: number;
  dark: boolean;
}

export function ReaderPageArt({ seed, page, width, height, dark }: Props) {
  const uid = useId().replace(/[:]/g, "");
  const rand = useMemo(() => mulberry32(seed * 7919 + page * 104729), [seed, page]);

  const rows = 3 + Math.floor(rand() * 2);
  const paletteIdx = Math.floor(rand() * 4);
  const ink = INK[paletteIdx];
  const paper = PANEL_BG[paletteIdx];
  const accentHue = Math.floor(rand() * 360);

  const panels: {
    y: number;
    h: number;
    w: number;
    x: number;
    bubbles: { bx: number; by: number; bw: number; bh: number; text: string }[];
  }[] = [];
  let y = 6;
  for (let r = 0; r < rows; r++) {
    const h = (height - 12 - (rows - 1) * 6) / rows - rand() * 8;
    const half = rand() > 0.5;
    const w1 = half ? width * (0.52 + rand() * 0.06) : width - 8;
    const w2 = half ? width - 8 - w1 : 0;
    const bubbles: { bx: number; by: number; bw: number; bh: number; text: string }[] = [];
    if (rand() > 0.35) {
      bubbles.push({
        bx: 12 + rand() * (w1 - 90),
        by: y + 10 + rand() * (h - 60),
        bw: 60 + rand() * 40,
        bh: 26 + rand() * 16,
        text: "......",
      });
    }
    if (w2 > 0 && rand() > 0.4) {
      bubbles.push({
        bx: w1 + 14,
        by: y + 10 + rand() * (h - 60),
        bw: 56 + rand() * 34,
        bh: 24 + rand() * 14,
        text: "!!!",
      });
    }
    panels.push({ y, h, w: w1, x: 4, bubbles });
    if (w2 > 0) panels.push({ y, h, w: w2, x: w1 + 4, bubbles: [] });
    y += h + 6;
  }

  const sfx = ["ドン", "バン", "ズズン", "グオオ", "ピシッ", "ドゴン", "サッ", "ガキン"];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", background: dark ? "#101018" : "#e8e6e0" }}
      role="img"
      aria-label={`หน้าอ่านที่ ${page}`}
    >
      <defs>
        <linearGradient id={`pa${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${accentHue} 65% 52%)`} />
          <stop offset="100%" stopColor={`hsl(${(accentHue + 70) % 360} 70% 42%)`} />
        </linearGradient>
      </defs>

      {panels.map((p, i) => {
        const dirX = rand() > 0.5 ? 1 : -1;
        const dirY = rand() > 0.5 ? 1 : -1;
        return (
          <g key={i}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} fill={paper} rx="2" />
            {i % 2 === 0 && (
              <g stroke={ink} strokeOpacity="0.28">
                {Array.from({ length: 9 }).map((_, s) => (
                  <line
                    key={s}
                    x1={p.x + p.w / 2 + (s - 4) * 26 * dirX}
                    y1={p.y + (s % 3) * 40}
                    x2={p.x + p.w / 2 + (s - 4) * 26 * dirX + 90 * dirX}
                    y2={p.y + (s % 3) * 40 + 55 * dirY}
                  />
                ))}
              </g>
            )}
            <path
              d={`M${p.x + p.w * 0.3} ${p.y + p.h * 0.25}q${p.w * 0.25} ${-p.h * 0.18} ${p.w * 0.4} 0q${p.w * 0.12} ${p.h * 0.12} 0 ${p.h * 0.18}l${-p.w * 0.18} ${p.h * 0.16}q${-p.w * 0.1} ${-p.h * 0.08} ${-p.w * 0.22} 0z`}
              fill={`url(#pa${uid})`}
              opacity={0.85}
            />
            <circle cx={p.x + p.w * 0.6} cy={p.y + p.h * 0.55} r={p.w * 0.09} fill={ink} />
            <circle cx={p.x + p.w * 0.72} cy={p.y + p.h * 0.5} r={p.w * 0.05} fill={ink} />
            <path
              d={`M${p.x + p.w * 0.55} ${p.y + p.h * 0.42}l${p.w * 0.06} ${-p.h * 0.05}l${p.w * 0.05} ${p.h * 0.06}l${-p.w * 0.06} ${p.h * 0.05}z`}
              fill={paper}
            />
            {i % 3 === 0 && (
              <text
                x={p.x + p.w * 0.78}
                y={p.y + p.h * 0.32}
                fontSize={p.w * 0.07}
                fontFamily="Prompt, sans-serif"
                fontWeight="800"
                fill="white"
                stroke={ink}
                strokeWidth={p.w * 0.004}
                opacity="0.9"
                textAnchor="middle"
              >
                {sfx[Math.floor(rand() * sfx.length)]}
              </text>
            )}
            {p.bubbles.map((b, bi) => (
              <g key={bi}>
                <ellipse
                  cx={b.bx + b.bw / 2}
                  cy={b.by + b.bh / 2}
                  rx={b.bw / 2}
                  ry={b.bh / 2}
                  fill="#fff"
                  stroke={ink}
                  strokeWidth="1.6"
                />
                <path d={`M${b.bx + b.bw / 2} ${b.by + b.bh / 2 + 2}l-6 10l11 -1z`} fill="#fff" stroke="none" />
                <text
                  x={b.bx + b.bw / 2}
                  y={b.by + b.bh / 2 + 3.5}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="Prompt, sans-serif"
                  fill={ink}
                >
                  {b.text}
                </text>
              </g>
            ))}
            <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="none" stroke={ink} strokeWidth="1.2" />
            <text
              x={p.x + p.w / 2}
              y={p.y + p.h - 6}
              textAnchor="middle"
              fontSize="7"
              fontFamily="Inter, sans-serif"
              fill={ink}
              opacity="0.4"
            >
              {page}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
