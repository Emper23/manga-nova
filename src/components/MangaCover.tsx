import { useId, useMemo, useState } from "react";
import type { Manga } from "../types";

/** Deterministic PRNG so every manga always gets the same art */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES = [
  ["#7c3aed", "#db2777", "#f59e0b"],
  ["#2563eb", "#06b6d4", "#a855f7"],
  ["#dc2626", "#f97316", "#facc15"],
  ["#0d9488", "#22c55e", "#84cc16"],
  ["#e11d48", "#8b5cf6", "#6366f1"],
  ["#0891b2", "#2563eb", "#7c3aed"],
];

const SHAPES = ["circle", "rings", "slash", "blob", "cross", "waves"] as const;

function wrapWords(text: string, max = 12): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

interface CoverProps {
  manga: Pick<Manga, "title" | "seed" | "status" | "coverUrl">;
  className?: string;
  priority?: boolean;
}

export function MangaCover({ manga, className, priority = false }: CoverProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const uid = useId().replace(/[:]/g, "");
  const rand = useMemo(() => mulberry32(manga.seed * 9301 + 49297), [manga.seed]);

  const palette = PALETTES[manga.seed % PALETTES.length];
  const shape = SHAPES[manga.seed % SHAPES.length];
  const [c1, c2, c3] = palette;

  const rx = () => Math.round(rand() * 100) / 100;
  const angle = Math.round(rx() * 360);
  const cx = 30 + rx() * 40;
  const cy = 22 + rx() * 30;

  const titleLines = wrapWords(manga.title);

  // Real cover image when available (fall back to procedural SVG on error)
  if (manga.coverUrl && !imgFailed) {
    return (
      <img
        src={manga.coverUrl}
        alt={`ปก ${manga.title}`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={className}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 300 420"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={`ปก ${manga.title}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="55%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
        <linearGradient id={`gs${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="62%" stopColor="#000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.82" />
        </linearGradient>
        <radialGradient id={`gl${uid}`} cx={cx} cy={cy} r="80%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`gr${uid}`} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#fff" opacity="0.14" />
        </pattern>
      </defs>

      <rect width="300" height="420" fill={`url(#g${uid})`} />
      <rect width="300" height="420" fill={`url(#gr${uid})`} />

      {shape === "circle" && (
        <>
          <circle cx={cx} cy={cy} r="120" fill="#fff" opacity="0.08" />
          <circle cx={cx} cy={cy} r="84" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="52" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1.5" />
        </>
      )}
      {shape === "rings" && (
        <>
          <circle cx={cx} cy={cy} r="140" fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="14" />
          <circle cx={cx} cy={cy} r="96" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="60" fill="none" stroke="#fff" strokeOpacity="0.32" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="26" fill="#fff" opacity="0.28" />
        </>
      )}
      {shape === "slash" && (
        <>
          <path d={`M${cx - 130} ${cy + 170} L${cx + 130} ${cy - 170}`} stroke="#fff" strokeOpacity="0.16" strokeWidth="70" />
          <path d={`M${cx - 130} ${cy + 170} L${cx + 130} ${cy - 170}`} stroke="#fff" strokeOpacity="0.34" strokeWidth="2.5" />
          <path d={`M${cx - 130} ${cy + 205} L${cx + 130} ${cy - 135}`} stroke="#fff" strokeOpacity="0.14" strokeWidth="1.5" />
        </>
      )}
      {shape === "blob" && (
        <>
          <path
            d={`M${cx} ${cy - 110}C${cx + 90} ${cy - 90}, ${cx + 110} ${cy + 40}, ${cx + 40} ${cy + 95}C${cx - 50} ${cy + 150}, ${cx - 120} ${cy + 40}, ${cx - 60} ${cy - 60}C${cx - 30} ${cy - 100}, ${cx - 30} ${cy - 120}, ${cx} ${cy - 110} Z`}
            fill="#fff"
            opacity="0.1"
          />
          <path
            d={`M${cx + 10} ${cy - 60}C${cx + 60} ${cy - 50}, ${cx + 70} ${cy + 20}, ${cx + 30} ${cy + 55}C${cx - 20} ${cy + 90}, ${cx - 70} ${cy + 20}, ${cx - 30} ${cy - 30}C${cx - 10} ${cy - 60}, ${cx - 20} ${cy - 65}, ${cx + 10} ${cy - 60} Z`}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.3"
            strokeWidth="2"
          />
        </>
      )}
      {shape === "cross" && (
        <>
          <path d={`M${cx} ${cy - 150} L${cx} ${cy + 150}`} stroke="#fff" strokeOpacity="0.22" strokeWidth="46" />
          <path d={`M${cx - 150} ${cy} L${cx + 150} ${cy}`} stroke="#fff" strokeOpacity="0.22" strokeWidth="46" />
          <circle cx={cx} cy={cy} r="34" fill={c1} stroke="#fff" strokeOpacity="0.4" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="16" fill="#fff" opacity="0.5" />
        </>
      )}
      {shape === "waves" && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M-40 ${cy - 60 + i * 60} Q${cx - 40} ${cy - 110 + i * 60} ${cx + 20} ${cy - 60 + i * 60} T${cx + 90} ${cy - 70 + i * 60} T${cx + 170} ${cy - 50 + i * 60} T${cx + 240} ${cy - 60 + i * 60}`}
              fill="none"
              stroke="#fff"
              strokeOpacity={0.28 - i * 0.05}
              strokeWidth="7"
            />
          ))}
        </>
      )}

      <rect width="300" height="420" fill={`url(#gl${uid})`} />
      <rect width="300" height="420" fill={`url(#gs${uid})`} />

      <g transform={`rotate(${angle} 228 46)`}>
        <rect x="196" y="32" width="64" height="27" rx="13.5" fill="#fff" opacity="0.92" />
        <text x="228" y="50.5" textAnchor="middle" fontSize="11.5" fontWeight="700" fontFamily="Prompt, sans-serif" fill="#101018" letterSpacing="1">
          {manga.status.toUpperCase()}
        </text>
      </g>

      <g transform={`rotate(-3 24 360)`}>
        {titleLines.map((line, i) => (
          <text
            key={i}
            x="22"
            y={368 + i * 21}
            fontSize={line.length > 10 ? 15 : 17}
            fontWeight="800"
            fontFamily="Prompt, sans-serif"
            fill="#fff"
          >
            {line}
          </text>
        ))}
      </g>
      <rect x="22" y="408" width="46" height="4" rx="2" fill="#fff" opacity="0.75" />
    </svg>
  );
}
