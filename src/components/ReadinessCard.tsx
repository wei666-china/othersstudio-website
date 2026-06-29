/**
 * ReadinessCard — 首屏"身体准备度"数据卡（第 1 期：静态精致版）。
 *
 * 用纯 SVG 绘制：环形准备度评分 + 7 天趋势曲线 + 四项指标（恢复/HRV/睡眠/张力）。
 * 目的：让首屏一眼是"AI 健身科技公司"。第 3 期会把它升级成可拖动滑块实时变化的
 * 可玩 demo——届时把这里的静态数据换成受控 state 即可，结构刻意预留。
 *
 * 全程暖色调 + 品牌橙点缀，无外部依赖、无图片、SSR 安全（无随机/无 Date 运行时差异）。
 */

const SCORE = 82;
const TREND = [34, 41, 75, 58, 53, 68, 82]; // 7 日准备度
const DAYS = ["一", "二", "三", "四", "五", "六", "日"];

const METRICS = [
  { label: "恢复", value: "88", unit: "%", status: "优秀" },
  { label: "HRV", value: "72", unit: "ms", status: "良好" },
  { label: "睡眠", value: "7.4", unit: "h", status: "良好" },
  { label: "负荷", value: "610", unit: "", status: "适中" },
];

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="relative w-[132px] h-[132px] flex-shrink-0">
      <svg viewBox="0 0 132 132" className="w-full h-full -rotate-90">
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--c-border)" strokeWidth="8" />
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          stroke="var(--c-accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-[2.6rem] leading-none text-text">{score}</span>
        <span className="font-mono text-[0.65rem] text-text-soft mt-1 tracking-wide">/100</span>
      </div>
    </div>
  );
}

function TrendChart({ data }: { data: number[] }) {
  const W = 240;
  const H = 96;
  const pad = 8;
  const max = 100;
  const stepX = (W - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = H - pad - (v / max) * (H - pad * 2);
    return { x, y };
  });
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x.toFixed(1)} ${H - pad} L ${points[0].x.toFixed(1)} ${H - pad} Z`;
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="rc-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#rc-area)" />
      <path d={line} fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="3.5" fill="var(--c-accent)" stroke="var(--c-surface)" strokeWidth="2" />
    </svg>
  );
}

export default function ReadinessCard() {
  return (
    <div className="relative w-full max-w-[440px] rounded-[28px] bg-surface border border-border shadow-[0_30px_80px_var(--c-shadow)] p-6 md:p-7">
      {/* 顶部状态条 */}
      <div className="flex items-center justify-between mb-6">
        <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.16em] uppercase text-accent-deep">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          身体准备度
        </span>
        <span className="font-mono text-[0.62rem] text-text-soft tracking-wide">AI 模型已更新</span>
      </div>

      {/* 评分 + 趋势 */}
      <div className="flex items-center gap-5 mb-6">
        <ScoreRing score={SCORE} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-medium text-text">7 日趋势</span>
            <span className="text-[0.7rem] font-semibold text-accent-deep tracking-wide">状态良好</span>
          </div>
          <TrendChart data={TREND} />
          <div className="flex justify-between mt-1 px-1">
            {DAYS.map((d) => (
              <span key={d} className="font-mono text-[0.58rem] text-text-soft">{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 四指标 */}
      <div className="grid grid-cols-4 gap-2 pt-5 border-t border-border">
        {METRICS.map((m) => (
          <div key={m.label} className="text-center">
            <div className="text-[0.62rem] text-text-soft tracking-wide mb-1">{m.label}</div>
            <div className="font-serif text-base text-text leading-none">
              {m.value}
              <span className="font-sans text-[0.6rem] text-text-soft ml-0.5">{m.unit}</span>
            </div>
            <div className="text-[0.56rem] text-accent-deep mt-1 tracking-wide">{m.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
