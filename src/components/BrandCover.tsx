/**
 * BrandCover — 无封面图时的品牌化占位 / 可选的品牌封面图案。
 *
 * 设计意图：替代过去拉取的随机灰度网图（picsum）。呈现一块暖色渐变 +
 * 柔光 + 细网格的「有意设计的留白」，并叠一个低调的 DAY 1 字母标记，
 * 让缺图卡片看起来像产品自己的视觉语言，而非占位。
 *
 * 现在还作为「品牌图案封面」的渲染器：后台可选 brand:warm / brand:clay
 * 等配色变体（见 lib/cover.ts），前台用对应 palette 渲染，不占存储、不撞图。
 *
 * 用 seed 派生轻微的渐变角度/光晕位置，让多张相邻卡片不完全雷同。
 */

export type BrandPalette =
  | "warm"
  | "clay"
  | "slate"
  | "olive"
  | "sand"
  | "deep";

type PaletteDef = {
  gradient: [string, string, string];
  glow: string;
  mark: string;
  grid: string;
  label: { bg: string; text: string };
};

// 全部取自官网暖色体系，保持基调一致；deep 用于深色区块。
const PALETTES: Record<BrandPalette, PaletteDef> = {
  warm: {
    gradient: ["#F2EADE", "#E7D8C6", "#D8C2AC"],
    glow: "rgba(255,107,53,0.16)",
    mark: "rgba(41,32,26,0.10)",
    grid: "rgba(41,32,26,0.045)",
    label: { bg: "rgba(41,32,26,0.06)", text: "#5E4C3F" },
  },
  clay: {
    gradient: ["#EEDFD2", "#E0C7B2", "#C9A88C"],
    glow: "rgba(226,83,31,0.14)",
    mark: "rgba(61,43,31,0.12)",
    grid: "rgba(61,43,31,0.05)",
    label: { bg: "rgba(61,43,31,0.07)", text: "#5C3D2E" },
  },
  slate: {
    gradient: ["#E8E4DD", "#D5D0C7", "#BFB8AD"],
    glow: "rgba(120,110,98,0.16)",
    mark: "rgba(41,38,32,0.11)",
    grid: "rgba(41,38,32,0.05)",
    label: { bg: "rgba(41,38,32,0.06)", text: "#4A453D" },
  },
  olive: {
    gradient: ["#E9E6D6", "#D6D0BA", "#BEB897"],
    glow: "rgba(150,140,70,0.14)",
    mark: "rgba(48,44,28,0.11)",
    grid: "rgba(48,44,28,0.05)",
    label: { bg: "rgba(48,44,28,0.06)", text: "#4D4730" },
  },
  sand: {
    gradient: ["#FBF7F1", "#F2EADE", "#E7D8C6"],
    glow: "rgba(255,107,53,0.12)",
    mark: "rgba(41,32,26,0.08)",
    grid: "rgba(41,32,26,0.04)",
    label: { bg: "rgba(41,32,26,0.05)", text: "#8B7766" },
  },
  deep: {
    gradient: ["#211712", "#3D2B1F", "#5C3D2E"],
    glow: "rgba(255,107,53,0.18)",
    mark: "rgba(255,255,255,0.10)",
    grid: "rgba(255,255,255,0.05)",
    label: { bg: "rgba(255,255,255,0.12)", text: "#F0E8DF" },
  },
};

type BrandCoverProps = {
  seed?: string | number;
  label?: string | null;
  className?: string;
  /** 配色变体；兼容旧用法 "light"(=warm) / "deep" */
  variant?: BrandPalette | "light";
};

function hashSeed(seed: string | number): number {
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function BrandCover({
  seed = "day1",
  label,
  className = "",
  variant = "warm",
}: BrandCoverProps) {
  const key: BrandPalette = variant === "light" ? "warm" : variant;
  const p = PALETTES[key] ?? PALETTES.warm;

  const h = hashSeed(seed);
  const angle = 115 + (h % 90); // 115deg ~ 205deg
  const glowX = 18 + (h % 55); // 18% ~ 73%
  const glowY = 12 + ((h >> 3) % 40); // 12% ~ 52%

  const baseGradient = `linear-gradient(${angle}deg, ${p.gradient[0]} 0%, ${p.gradient[1]} 55%, ${p.gradient[2]} 100%)`;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: baseGradient }}
      aria-hidden="true"
    >
      {/* 柔光晕 */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${p.glow} 0%, transparent 55%)`,
          mixBlendMode: "screen",
        }}
      />
      {/* 细网格纹理 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${p.grid} 1px, transparent 1px), linear-gradient(90deg, ${p.grid} 1px, transparent 1px)`,
          backgroundSize: "34px 34px",
        }}
      />
      {/* DAY 1 标记 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-serif select-none leading-none"
          style={{
            fontSize: "clamp(3rem, 14vw, 7rem)",
            color: p.mark,
            letterSpacing: "-0.03em",
          }}
        >
          DAY<span style={{ fontWeight: 300 }}>1</span>
        </span>
      </div>
      {/* 可选标签（如文章 tag） */}
      {label ? (
        <div className="absolute bottom-4 left-4">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[0.7rem] font-medium tracking-wide backdrop-blur-sm"
            style={{ background: p.label.bg, color: p.label.text }}
          >
            {label}
          </span>
        </div>
      ) : null}
    </div>
  );
}
