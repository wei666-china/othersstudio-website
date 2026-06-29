"use client";

/**
 * TrainingDataDemo —— 首页「训练数据可视化」功能展示（第 3 期，最后一个）。
 *
 * 深色版块，对齐 App 的 ProgressTrackingView：顶部一排「动作选择器」（总览/卧推/深蹲/硬拉/引体），
 * 点哪个看哪个动作的进步曲线——曲线描边生长（stroke-dashoffset 动画）+ 坐标轴刻度/网格 + 数据点
 * + PR/增长徽章 + 起始|当前 footer + 关键指标数字滚动 + 最近记录 + AI 一句洞察。
 * 网页端额外加 hover/触摸数据点弹出该周具体数值的 tooltip。全部为预设演示数据。
 *
 * 调性与食物 / 教练 demo 一致：只展示「进步多漂亮、AI 一眼看懂趋势」，绝不暴露怎么算——
 * 展示的是数据本身（重量/周次/PR），不是算法逻辑。中英双语、尊重 prefers-reduced-motion、移动端友好、无外部依赖。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import Reveal from "@/components/Reveal";

type Lang = "zh" | "en";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          ob.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    ob.observe(node);
    return () => ob.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── 文案（中英双语） ─────────────────────────────────────────────
const COPY = {
  zh: {
    eyebrow: "训练数据可视化",
    title: "你的进步，一眼看得见",
    desc: "点开任意动作，看 DAY 1 把零散的训练记录画成你的成长曲线，再用一句话告诉你——你正变得更强。",
    points: [
      "按动作追踪：卧推、深蹲、硬拉……各自的进步一目了然",
      "PR、增长幅度、起止对比，关键数字自动浮现",
      "悬停曲线即可查看每一周的具体数值",
    ],
    replay: "重新演示",
    cta: "在 App 里看见自己的完整成长轨迹",
    note: "示例为演示数据，非真实记录。",
    period: "近 12 周",
    start: "起始",
    current: "当前",
    recent: "最近记录",
    weekLabel: (n: number) => `第 ${n} 周`,
  },
  en: {
    eyebrow: "Training Analytics",
    title: "See your progress at a glance",
    desc: "Open any exercise and watch DAY 1 turn scattered logs into your growth curve — then tell you, in one line, that you're getting stronger.",
    points: [
      "Track by exercise: bench, squat, deadlift — progress at a glance",
      "PRs, growth and start-to-now deltas surface automatically",
      "Hover the curve to read each week's exact number",
    ],
    replay: "Replay",
    cta: "See your full growth trajectory in the app",
    note: "Demo data — not a real record.",
    period: "Last 12 weeks",
    start: "Start",
    current: "Now",
    recent: "Recent",
    weekLabel: (n: number) => `Week ${n}`,
  },
};

// ── 动作视图数据（预设演示，黑盒：只给数据本身，不暴露任何计算） ──
type Bi = { zh: string; en: string };
type Stat = { label: Bi; value: number; suffix: string | Bi };
type Rec = { date: string; detail: Bi; dir: "up" | "down" | "flat" };
type ExView = {
  id: string;
  name: Bi; // 选择器标签
  metric: Bi; // 图表标题，如「卧推 1RM」
  unit: Bi; // 数值单位，如「 kg」「 次」
  values: number[]; // 12 周真实数值
  pr: Bi; // PR 徽章文案
  delta: Bi; // 增长徽章文案（% 或定性词）
  stats: Stat[];
  insight: Bi;
  records: Rec[];
};

const KG: Bi = { zh: " kg", en: " kg" };
const REPS: Bi = { zh: " 次", en: " reps" };
const NONE: Bi = { zh: "", en: "" };

const EXERCISES: ExView[] = [
  {
    id: "overview",
    name: { zh: "总览", en: "Overview" },
    metric: { zh: "训练容量指数", en: "Volume index" },
    unit: NONE,
    values: [28, 33, 30, 42, 47, 44, 55, 60, 58, 70, 78, 86],
    pr: { zh: "本月 6 次 PR", en: "6 PRs this month" },
    delta: { zh: "稳步上升", en: "Steady climb" },
    stats: [
      { label: { zh: "本月总容量", en: "Monthly volume" }, value: 48200, suffix: KG },
      { label: { zh: "连续训练", en: "Streak" }, value: 23, suffix: { zh: " 天", en: " d" } },
      { label: { zh: "本月 PR", en: "PRs / mo" }, value: 6, suffix: NONE },
    ],
    insight: {
      zh: "过去 12 周训练容量稳步上扬，最近 3 周明显发力——你的恢复跟得上强度，可以再加点。",
      en: "Volume has climbed steadily over 12 weeks, with a clear push in the last 3 — your recovery is keeping up. Room to add a little more.",
    },
    records: [
      { date: "06-24", detail: { zh: "上肢推 · 62 分钟", en: "Upper push · 62 min" }, dir: "up" },
      { date: "06-22", detail: { zh: "下肢 · 58 分钟", en: "Lower body · 58 min" }, dir: "flat" },
      { date: "06-20", detail: { zh: "背 + 二头 · 55 分钟", en: "Back + biceps · 55 min" }, dir: "up" },
    ],
  },
  {
    id: "bench",
    name: { zh: "卧推", en: "Bench" },
    metric: { zh: "卧推 1RM", en: "Bench 1RM" },
    unit: KG,
    values: [70, 72, 72, 75, 76, 78, 80, 82, 84, 86, 88, 92],
    pr: { zh: "PR 92 kg", en: "PR 92 kg" },
    delta: { zh: "+31%", en: "+31%" },
    stats: [
      { label: { zh: "当前 1RM", en: "Current 1RM" }, value: 92, suffix: KG },
      { label: { zh: "12 周增长", en: "12-wk gain" }, value: 22, suffix: KG },
      { label: { zh: "本月 PR", en: "PRs / mo" }, value: 2, suffix: NONE },
    ],
    insight: {
      zh: "卧推是你进步最快的动作，12 周 +22kg 且没有平台期——编排很对路，继续保持。",
      en: "Bench is your fastest mover: +22kg in 12 weeks with no plateau — your programming is on point, keep it up.",
    },
    records: [
      { date: "06-24", detail: { zh: "90kg × 5 × 5", en: "90kg × 5 × 5" }, dir: "up" },
      { date: "06-20", detail: { zh: "88kg × 5 × 5", en: "88kg × 5 × 5" }, dir: "up" },
      { date: "06-16", detail: { zh: "86kg × 5 × 4", en: "86kg × 5 × 4" }, dir: "flat" },
    ],
  },
  {
    id: "squat",
    name: { zh: "深蹲", en: "Squat" },
    metric: { zh: "深蹲 1RM", en: "Squat 1RM" },
    unit: KG,
    values: [100, 105, 108, 110, 115, 118, 122, 128, 130, 134, 138, 140],
    pr: { zh: "PR 140 kg", en: "PR 140 kg" },
    delta: { zh: "+40%", en: "+40%" },
    stats: [
      { label: { zh: "当前 1RM", en: "Current 1RM" }, value: 140, suffix: KG },
      { label: { zh: "12 周增长", en: "12-wk gain" }, value: 40, suffix: KG },
      { label: { zh: "本月 PR", en: "PRs / mo" }, value: 1, suffix: NONE },
    ],
    insight: {
      zh: "深蹲稳步突破到 140kg，下肢力量增长扎实——建议保持当前频率，别急着冲极限。",
      en: "Squat has pushed steadily to 140kg with solid lower-body gains — hold the current frequency, no need to chase a max yet.",
    },
    records: [
      { date: "06-25", detail: { zh: "130kg × 5 × 5", en: "130kg × 5 × 5" }, dir: "up" },
      { date: "06-21", detail: { zh: "128kg × 5 × 5", en: "128kg × 5 × 5" }, dir: "up" },
      { date: "06-17", detail: { zh: "125kg × 5 × 5", en: "125kg × 5 × 5" }, dir: "flat" },
    ],
  },
  {
    id: "deadlift",
    name: { zh: "硬拉", en: "Deadlift" },
    metric: { zh: "硬拉 1RM", en: "Deadlift 1RM" },
    unit: KG,
    values: [120, 125, 128, 130, 135, 140, 145, 150, 155, 158, 162, 165],
    pr: { zh: "PR 165 kg", en: "PR 165 kg" },
    delta: { zh: "+38%", en: "+38%" },
    stats: [
      { label: { zh: "当前 1RM", en: "Current 1RM" }, value: 165, suffix: KG },
      { label: { zh: "12 周增长", en: "12-wk gain" }, value: 45, suffix: KG },
      { label: { zh: "本月 PR", en: "PRs / mo" }, value: 2, suffix: NONE },
    ],
    insight: {
      zh: "硬拉曲线持续上行至 165kg，后链很强——注意安排充分恢复，给神经系统留出时间。",
      en: "Deadlift keeps trending up to 165kg with a strong posterior chain — make sure to schedule full recovery for your nervous system.",
    },
    records: [
      { date: "06-23", detail: { zh: "155kg × 3 × 5", en: "155kg × 3 × 5" }, dir: "up" },
      { date: "06-19", detail: { zh: "150kg × 3 × 5", en: "150kg × 3 × 5" }, dir: "up" },
      { date: "06-15", detail: { zh: "150kg × 3 × 4", en: "150kg × 3 × 4" }, dir: "flat" },
    ],
  },
  {
    id: "pullup",
    name: { zh: "引体向上", en: "Pull-up" },
    metric: { zh: "引体 · 单组最多", en: "Pull-up · max set" },
    unit: REPS,
    values: [8, 9, 9, 10, 10, 11, 12, 12, 13, 14, 15, 16],
    pr: { zh: "PR 16 次", en: "PR 16 reps" },
    delta: { zh: "+100%", en: "+100%" },
    stats: [
      { label: { zh: "单组最多", en: "Best set" }, value: 16, suffix: REPS },
      { label: { zh: "12 周增长", en: "12-wk gain" }, value: 8, suffix: REPS },
      { label: { zh: "本月 PR", en: "PRs / mo" }, value: 1, suffix: NONE },
    ],
    insight: {
      zh: "引体从 8 次做到 16 次，相对力量翻倍——核心和背部控制明显提升，可以开始尝试负重。",
      en: "Pull-ups doubled from 8 to 16 reps — relative strength is way up. Your core and back control improved a lot; time to try weighted reps.",
    },
    records: [
      { date: "06-26", detail: { zh: "自重 × 16, 14, 12", en: "BW × 16, 14, 12" }, dir: "up" },
      { date: "06-22", detail: { zh: "自重 × 15, 13, 11", en: "BW × 15, 13, 11" }, dir: "up" },
      { date: "06-18", detail: { zh: "自重 × 14, 12, 10", en: "BW × 14, 12, 10" }, dir: "flat" },
    ],
  },
];

// ── SVG 进步曲线（带坐标轴 / 数据点 / 真实数值） ─────────────────
const W = 520;
const H = 220;
const PAD_L = 38; // 左侧留给 Y 轴刻度
const PAD_R = 16;
const PAD_T = 18;
const PAD_B = 26; // 底部留给 X 轴周标签

type Pt = { x: number; y: number; value: number; week: number };

function buildGeom(values: number[]) {
  const n = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const lo = min - range * 0.18;
  const hi = max + range * 0.18;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const bottom = PAD_T + plotH;
  const xOf = (i: number) => PAD_L + (plotW * i) / (n - 1);
  const yOf = (v: number) => PAD_T + plotH * (1 - (v - lo) / (hi - lo));
  const pts: Pt[] = values.map((v, i) => ({ x: xOf(i), y: yOf(v), value: v, week: i + 1 }));

  // 平滑曲线（Catmull-Rom → 三次贝塞尔）
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  const area = `${d} L ${pts[n - 1].x.toFixed(1)} ${bottom} L ${pts[0].x.toFixed(1)} ${bottom} Z`;

  // Y 轴 3 档刻度（取真实数值：最大 / 中位 / 最小）
  const ticks = [max, (max + min) / 2, min].map((v) => ({ y: yOf(v), label: Math.round(v) }));

  return { pts, d, area, ticks, bottom, last: pts[n - 1] };
}

function StatBox({ label, value, suffix, show, delay }: { label: string; value: number; suffix: string; show: boolean; delay: number }) {
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!show) {
      setN(0);
      return;
    }
    const reduced = prefersReducedMotion();
    if (reduced) {
      setN(value);
      return;
    }
    const dur = 1000;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      if (now < start) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [show, value, delay]);

  return (
    <div
      className="flex-1 min-w-0"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(8px)",
        transition: `opacity var(--dur-base) var(--ease-out-soft) ${delay}ms, transform var(--dur-base) var(--ease-out-soft) ${delay}ms`,
      }}
    >
      <div className="font-serif text-[1.55rem] leading-none text-on-ink tabular-nums whitespace-nowrap">
        {n.toLocaleString()}
        <span className="text-xs text-on-ink/50">{suffix}</span>
      </div>
      <div className="text-[0.6rem] text-on-ink/55 tracking-wide mt-1.5">{label}</div>
    </div>
  );
}

function DirArrow({ dir }: { dir: "up" | "down" | "flat" }) {
  if (dir === "flat") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-on-ink/35">
        <path d="M5 12h14" />
      </svg>
    );
  }
  const up = dir === "up";
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      className={up ? "text-emerald-400" : "text-red-400"}
    >
      {up ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
    </svg>
  );
}

export default function TrainingDataDemo() {
  const { locale } = useLocale();
  const lang: Lang = locale === "en" ? "en" : "zh";
  const c = COPY[lang];

  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const [viewIdx, setViewIdx] = useState(0);
  const [drawn, setDrawn] = useState(false); // 曲线已描完
  const [showInsight, setShowInsight] = useState(false);
  const [cycle, setCycle] = useState(0); // 重新演示 / 切动作重启
  const [hover, setHover] = useState<number | null>(null); // 悬停的数据点索引

  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const view = EXERCISES[viewIdx];
  const unit = view.unit[lang];
  const geom = useMemo(() => buildGeom(view.values), [view.values]);

  const first = view.values[0];
  const lastVal = view.values[view.values.length - 1];
  const diff = lastVal - first;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // 触发一轮动画：描边生长 → 指标滚动 → 洞察浮现
  useEffect(() => {
    if (!inView) return;
    clearTimers();
    setShowInsight(false);

    const reduced = prefersReducedMotion();
    const path = pathRef.current;

    if (reduced || !path) {
      setDrawn(true);
      setShowInsight(true);
      return;
    }

    const len = path.getTotalLength();
    // 初始：完全隐藏（dashoffset = 全长），关掉过渡
    path.style.transition = "none";
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    setDrawn(false);

    // 双 rAF 后开始描边
    const r1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.transition = "stroke-dashoffset 1500ms cubic-bezier(0.22, 1, 0.36, 1)";
        path.style.strokeDashoffset = "0";
      });
    });

    const tDraw = setTimeout(() => setDrawn(true), 1500);
    const tInsight = setTimeout(() => setShowInsight(true), 1900);
    timers.current.push(tDraw, tInsight);

    return () => {
      cancelAnimationFrame(r1);
      clearTimers();
    };
  }, [inView, viewIdx, cycle, clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const switchView = useCallback((i: number) => {
    setViewIdx(i);
    setHover(null);
    setCycle((n) => n + 1);
  }, []);

  const replay = useCallback(() => {
    setHover(null);
    setCycle((n) => n + 1);
  }, []);

  // 鼠标 / 触摸移动 → 找最近的数据点
  const handlePointer = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      if (!drawn) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0) return;
      const ratio = (e.clientX - rect.left) / rect.width;
      const dataX = ratio * W;
      const n = view.values.length;
      const plotW = W - PAD_L - PAD_R;
      let i = Math.round(((dataX - PAD_L) / plotW) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      setHover(i);
    },
    [drawn, view.values.length]
  );

  const active = hover ?? geom.pts.length - 1;
  const activePt = geom.pts[active];
  const xTicks = [0, 3, 7, 11].filter((i) => i < geom.pts.length);

  return (
    <section ref={ref} id="analytics" className="relative overflow-hidden bg-ink text-on-ink py-24 md:py-32 px-6 md:px-15">
      {/* 氛围光 */}
      <div className="absolute top-[-14%] left-[-8%] w-[44vw] max-w-[560px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.12)_0%,transparent_66%)] pointer-events-none" />

      <div className="relative max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
        {/* 左：文案 */}
        <Reveal direction="up">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            {c.eyebrow}
          </span>
          <h2 className="text-[clamp(1.9rem,4vw,3rem)] leading-[1.12] text-on-ink mb-5">{c.title}</h2>
          <p className="text-base text-on-ink/65 leading-relaxed mb-8 max-w-[42ch]">{c.desc}</p>

          <ul className="flex flex-col gap-3.5 mb-9">
            {c.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-on-ink/80 leading-relaxed">
                <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2.2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {pt}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-medium shadow-[0_8px_28px_rgba(255,107,53,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-[var(--dur-fast)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {c.replay}
          </button>
        </Reveal>

        {/* 右：数据卡 */}
        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-md shadow-[0_30px_80px_rgba(0,0,0,0.4)] p-6 md:p-7">
            {/* 动作选择器 */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 -mb-0">
              {EXERCISES.map((ex, i) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => switchView(i)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-[var(--dur-base)] ${
                    i === viewIdx
                      ? "bg-accent text-white shadow-[0_4px_14px_rgba(255,107,53,0.35)]"
                      : "bg-white/[0.06] text-on-ink/60 hover:text-on-ink/90"
                  }`}
                >
                  {ex.name[lang]}
                </button>
              ))}
            </div>

            {/* 卡头：动作名 + PR + 增长% */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-on-ink">{view.metric[lang]}</h3>
              <div
                className="flex items-center gap-2"
                style={{ opacity: drawn ? 1 : 0, transition: "opacity var(--dur-base) var(--ease-out-soft) 120ms" }}
              >
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.08] text-on-ink/80 text-[0.66rem] font-medium whitespace-nowrap">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFC971" strokeWidth="2">
                    <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0zM7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
                  </svg>
                  {view.pr[lang]}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[0.66rem] font-semibold whitespace-nowrap">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 17l6-6 4 4 8-8" />
                    <path d="M21 7v6h-6" />
                  </svg>
                  {view.delta[lang]}
                </span>
              </div>
            </div>

            {/* 进步曲线（坐标轴 + 数据点 + hover 数值） */}
            <div className="relative">
              <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
                <defs>
                  <linearGradient id="td-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Y 轴网格 + 刻度数值 */}
                {geom.ticks.map((t, i) => (
                  <g key={i}>
                    <line x1={PAD_L} x2={W - PAD_R} y1={t.y} y2={t.y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                    <text x={PAD_L - 7} y={t.y + 3} textAnchor="end" className="fill-white/35" fontSize="10" fontFamily="var(--font-mono)">
                      {t.label}
                    </text>
                  </g>
                ))}

                {/* X 轴周标签 */}
                {xTicks.map((i) => (
                  <text
                    key={i}
                    x={geom.pts[i].x}
                    y={H - 6}
                    textAnchor="middle"
                    className="fill-white/35"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                  >
                    W{i + 1}
                  </text>
                ))}

                {/* 面积：描完后淡入 */}
                <path
                  d={geom.area}
                  fill="url(#td-area)"
                  style={{ opacity: drawn ? 1 : 0, transition: "opacity var(--dur-slow) var(--ease-out-soft)" }}
                />

                {/* 曲线本体：描边生长 */}
                <path
                  ref={pathRef}
                  d={geom.d}
                  fill="none"
                  stroke="var(--c-accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* hover 竖直参考线 */}
                {drawn && hover !== null && (
                  <line x1={activePt.x} x2={activePt.x} y1={PAD_T} y2={geom.bottom} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 3" />
                )}

                {/* 数据点 */}
                {geom.pts.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={i === active ? 4.5 : 2.6}
                    fill={i === active ? "var(--c-accent)" : "rgba(255,255,255,0.55)"}
                    stroke="var(--c-ink)"
                    strokeWidth={i === active ? 2.5 : 1}
                    style={{
                      opacity: drawn ? 1 : 0,
                      transition: `opacity var(--dur-base) var(--ease-out-soft) ${Math.min(i * 60, 700)}ms, r var(--dur-fast) var(--ease-out-soft)`,
                    }}
                  />
                ))}

                {/* 透明捕获层：鼠标/触摸读数 */}
                <rect
                  x={PAD_L}
                  y={PAD_T}
                  width={W - PAD_L - PAD_R}
                  height={geom.bottom - PAD_T}
                  fill="transparent"
                  style={{ cursor: "crosshair", touchAction: "pan-y" }}
                  onPointerMove={handlePointer}
                  onPointerDown={handlePointer}
                  onPointerLeave={() => setHover(null)}
                />
              </svg>

              {/* hover 数值 tooltip */}
              {drawn && hover !== null && (
                <div
                  className="absolute pointer-events-none z-10"
                  style={{ left: `${(activePt.x / W) * 100}%`, top: `${(activePt.y / H) * 100}%`, transform: "translate(-50%,-145%)" }}
                >
                  <div className="px-2.5 py-1 rounded-lg bg-ink/95 border border-white/15 text-on-ink text-[0.66rem] whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                    <span className="text-on-ink/55">{c.weekLabel(activePt.week)} · </span>
                    <span className="font-semibold tabular-nums">
                      {activePt.value}
                      {unit}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 起始 | 当前 + 差值 */}
            <div
              className="flex items-end justify-between mt-3 pt-3 border-t border-white/10"
              style={{ opacity: drawn ? 1 : 0, transition: "opacity var(--dur-base) var(--ease-out-soft) 200ms" }}
            >
              <div>
                <div className="text-[0.58rem] text-on-ink/45 tracking-wide">{c.start}</div>
                <div className="font-serif text-base text-on-ink/80 tabular-nums">
                  {first}
                  {unit}
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className="text-right">
                  <div className="text-[0.58rem] text-on-ink/45 tracking-wide">{c.current}</div>
                  <div className="font-serif text-base text-on-ink tabular-nums">
                    {lastVal}
                    {unit}
                  </div>
                </div>
                <span className="mb-0.5 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-semibold tabular-nums whitespace-nowrap">
                  {diff >= 0 ? `+${diff}` : `${diff}`}
                  {unit}
                </span>
              </div>
            </div>

            {/* 关键指标 */}
            <div className="flex gap-3 mt-5 pt-5 border-t border-white/10">
              {view.stats.map((s, i) => (
                <StatBox
                  key={s.label.en}
                  label={s.label[lang]}
                  value={s.value}
                  suffix={typeof s.suffix === "string" ? s.suffix : s.suffix[lang]}
                  show={drawn}
                  delay={i * 120}
                />
              ))}
            </div>

            {/* 最近记录 */}
            <div
              className="mt-5 pt-4 border-t border-white/10"
              style={{ opacity: drawn ? 1 : 0, transition: "opacity var(--dur-base) var(--ease-out-soft) 320ms" }}
            >
              <div className="text-[0.62rem] text-on-ink/45 tracking-wide mb-2.5">{c.recent}</div>
              <div className="flex flex-col gap-2">
                {view.records.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-on-ink/45 flex-shrink-0">{r.date}</span>
                    <span className="text-on-ink/80 flex-1 truncate">{r.detail[lang]}</span>
                    <DirArrow dir={r.dir} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI 洞察气泡 */}
          <div
            className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md px-5 py-4"
            style={{
              opacity: showInsight ? 1 : 0,
              transform: showInsight ? "translateY(0)" : "translateY(12px)",
              transition: "opacity var(--dur-slow) var(--ease-out-soft), transform var(--dur-slow) var(--ease-out-soft)",
            }}
          >
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-deep flex items-center justify-center shadow-[0_5px_16px_rgba(255,107,53,0.35)]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 2c.4 2.6 1.4 4.4 3 5.6 1 .8 2.3 1.4 4 1.9-1.7.5-3 1.1-4 1.9-1.6 1.2-2.6 3-3 5.6-.4-2.6-1.4-4.4-3-5.6-1-.8-2.3-1.4-4-1.9 1.7-.5 3-1.1 4-1.9 1.6-1.2 2.6-3 3-5.6z" />
              </svg>
            </span>
            <p className="text-sm text-on-ink/85 leading-relaxed">{view.insight[lang]}</p>
          </div>

          <p className="text-[11px] text-on-ink/40 text-center mt-3">{c.note}</p>
        </div>
      </div>
    </section>
  );
}
