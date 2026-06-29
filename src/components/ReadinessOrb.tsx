"use client";

/**
 * ReadinessOrb —— 官网版「身体准备度」展示（编辑式排版 + 横向「翻页」卡片）。
 *
 * 设计取向：不照搬 App 的「圆环 + emoji 状态徽章」（搬到网站显得突兀、廉价）。
 * 改为编辑式排版：大号衬线分数 + 纤细刻度条 + 排版化状态词，与左侧衬线大标题同语系，
 * 无卡片边框、与暖色背景融为一体。状态色（绿/黄/橙/红）只作为「克制信号」点缀。
 *
 * 交互（用户确认）：右侧是一个**固定高度的卡片框**，内容像幻灯片一样**横向翻页**——
 * 下一页从右滑入、当前页向左滑出。手动控制（左右箭头 + 底部小圆点），不自动轮播。
 * 共 5 页：① 分数+刻度条 ② 状态趋势 ③ 指标详情 ④ 为什么是这个分数 ⑤ 身体信号。
 * 不暴露算法（只给定性结论）。尊重 prefers-reduced-motion（翻页改为即时切换，无滑动）。
 */

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";

type Lang = "zh" | "en";
type Bi = { zh: string; en: string };
const pickText = (b: Bi, lang: Lang) => (lang === "en" ? b.en : b.zh);

type Level = "green" | "yellow" | "orange" | "red";
const STATES: Record<
  Level,
  { color: string; lite: string; label: Bi; note: Bi; trendNote: Bi }
> = {
  green: { color: "#2ECC71", lite: "#67E0A3", label: { zh: "状态极佳", en: "Peak" }, note: { zh: "今天状态可以冲刺", en: "Ready to push today" }, trendNote: { zh: "状态走高", en: "Trending up" } },
  yellow: { color: "#E0A92E", lite: "#F2C766", label: { zh: "状态不错", en: "Good" }, note: { zh: "适合按计划正常训练", en: "Train as planned" }, trendNote: { zh: "状态平稳", en: "Steady" } },
  orange: { color: "#E67E22", lite: "#F2A65A", label: { zh: "需要谨慎", en: "Caution" }, note: { zh: "建议适当降低强度", en: "Ease off the intensity" }, trendNote: { zh: "略有回落", en: "Slight dip" } },
  red: { color: "#E0533C", lite: "#F0806E", label: { zh: "优先恢复", en: "Recover" }, note: { zh: "今天以休息恢复为主", en: "Prioritize rest today" }, trendNote: { zh: "明显偏低", en: "Notably low" } },
};
const levelFor = (s: number): Level => (s >= 70 ? "green" : s >= 50 ? "yellow" : s >= 30 ? "orange" : "red");

const SCORE = 82;
const TREND = [61, 55, 70, 66, 74, 77, 82];
const DAYS: Record<Lang, string[]> = {
  zh: ["一", "二", "三", "四", "五", "六", "日"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
};
const METRICS: { label: Bi; value: string; unit: string; status: Bi; hint: Bi }[] = [
  { label: { zh: "恢复", en: "Recovery" }, value: "88", unit: "%", status: { zh: "优秀", en: "Excellent" }, hint: { zh: "身体已基本回满", en: "Nearly fully recovered" } },
  { label: { zh: "HRV", en: "HRV" }, value: "72", unit: "ms", status: { zh: "良好", en: "Good" }, hint: { zh: "心率变异度偏高，恢复好", en: "High HRV — well recovered" } },
  { label: { zh: "睡眠", en: "Sleep" }, value: "7.4", unit: "h", status: { zh: "良好", en: "Good" }, hint: { zh: "深睡充足", en: "Plenty of deep sleep" } },
  { label: { zh: "负荷", en: "Load" }, value: "610", unit: "", status: { zh: "适中", en: "Moderate" }, hint: { zh: "近 7 日训练量合理", en: "Balanced 7-day volume" } },
];
const FACTORS: { label: Bi; status: Bi; tone: "good" | "normal" | "caution" }[] = [
  { label: { zh: "睡眠恢复", en: "Sleep recovery" }, status: { zh: "良好", en: "Good" }, tone: "good" },
  { label: { zh: "身体压力", en: "Body stress" }, status: { zh: "正常", en: "Normal" }, tone: "normal" },
  { label: { zh: "训练负荷", en: "Training load" }, status: { zh: "正常", en: "Normal" }, tone: "normal" },
  { label: { zh: "训练连续性", en: "Consistency" }, status: { zh: "良好", en: "Good" }, tone: "good" },
];
const OBJECTIVE: { label: Bi; value: string; unit: string; delta: string; better: boolean }[] = [
  { label: { zh: "HRV", en: "HRV" }, value: "72", unit: "ms", delta: "+5", better: true },
  { label: { zh: "睡眠", en: "Sleep" }, value: "7.4", unit: "h", delta: "+0.6", better: true },
  { label: { zh: "静息心率", en: "Resting HR" }, value: "54", unit: "bpm", delta: "−2", better: true },
];

// 翻页内的描述性文案 + 各页标题 + 顶部 eyebrow
const COPY = {
  zh: {
    eyebrow: "身体准备度",
    scoreDesc1: "每天清晨，DAY 1 读取你身体一夜的恢复，给出一个能不能练、该练多重的判断——",
    scoreDescStrong: "不用你猜。",
    trendLabel: "状态趋势 · 近 7 日",
    trendDesc: "一周连续走高——身体正稳稳地往上走，训练吃得进、也恢复得回来。",
    metricsLabel: "关键指标",
    whyTitle: "为什么是这个分数",
    whyDesc: "今天各项都不错，没有明显拖后腿的。",
    signalsTitle: "身体信号",
    signalsDesc: "由 Apple Watch 自动采集，是评分的主要依据",
    vsYesterday: "vs 昨天",
    pageScore: "今日准备度",
    pageTrend: "状态趋势",
    pageMetrics: "关键指标",
    pageWhy: "为什么",
    pageSignals: "身体信号",
    prev: "上一页",
    next: "下一页",
    pageOf: (i: number, title: string) => `第 ${i} 页：${title}`,
  },
  en: {
    eyebrow: "Body Readiness",
    scoreDesc1: "Every morning, DAY 1 reads how your body recovered overnight and tells you whether to train and how hard — ",
    scoreDescStrong: "no guessing.",
    trendLabel: "Trend · Last 7 days",
    trendDesc: "Seven days trending up — your body is steadily climbing, taking the training and bouncing back.",
    metricsLabel: "Key metrics",
    whyTitle: "Why this score",
    whyDesc: "Everything looks solid today — nothing holding you back.",
    signalsTitle: "Body signals",
    signalsDesc: "Captured automatically by Apple Watch — the basis of your score",
    vsYesterday: "vs yesterday",
    pageScore: "Today's readiness",
    pageTrend: "Trend",
    pageMetrics: "Key metrics",
    pageWhy: "Why",
    pageSignals: "Body signals",
    prev: "Previous",
    next: "Next",
    pageOf: (i: number, title: string) => `Page ${i}: ${title}`,
  },
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function Meter({ score, level }: { score: number; level: Level }) {
  const s = STATES[level];
  return (
    <div className="relative h-[5px] w-full rounded-full overflow-hidden" style={{ background: `${s.color}1f` }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${s.color}, ${s.lite})`, boxShadow: `0 0 12px ${s.color}66` }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: EASE, delay: 0.15 }}
      />
    </div>
  );
}

function Trend({ data, level }: { data: number[]; level: Level }) {
  const W = 300;
  const H = 150;
  const padX = 6;
  const padY = 14;
  const color = STATES[level].color;
  const stepX = (W - padX * 2) / (data.length - 1);
  const yFor = (v: number) => padY + (1 - v / 100) * (H - padY * 2);
  const pts = data.map((v, i) => ({ x: padX + i * stepX, y: yFor(v) }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - padY} L ${pts[0].x.toFixed(1)} ${H - padY} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
      <defs>
        <linearGradient id={`tg-${level}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y={yFor(100)} width={W} height={yFor(70) - yFor(100)} fill={color} opacity="0.06" />
      <path d={area} fill={`url(#tg-${level})`} />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: EASE }}
      />
      <circle cx={last.x} cy={last.y} r="4.5" fill={color} />
      <text x={last.x} y={last.y - 11} textAnchor="end" className="fill-text" style={{ fontSize: 13, fontWeight: 700 }}>
        {data[data.length - 1]}
      </text>
    </svg>
  );
}

// ============================ 翻页内容 ============================
function PageScore({ level, lang }: { level: Level; lang: Lang }) {
  const s = STATES[level];
  const c = COPY[lang];
  return (
    <div style={{ containerType: "inline-size" }}>
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-text tabular-nums leading-[0.86]" style={{ fontSize: "clamp(4rem, 30cqw, 7rem)" }}>
            {SCORE}
          </span>
          <span className="text-text-soft text-base font-medium mb-2">/100</span>
        </div>
        <div className="flex flex-col items-end gap-1 pb-2">
          <span className="text-xl font-semibold tracking-wide" style={{ color: s.color }}>
            {pickText(s.label, lang)}
          </span>
          <span className="text-[0.84rem] text-text-muted">{pickText(s.note, lang)}</span>
        </div>
      </div>
      <div className="mt-6">
        <Meter score={SCORE} level={level} />
      </div>
      <p className="mt-7 text-[0.92rem] text-text-mid leading-relaxed max-w-[34ch]">
        {c.scoreDesc1}
        <span className="text-text font-medium">{c.scoreDescStrong}</span>
      </p>
    </div>
  );
}

function PageTrend({ level, lang }: { level: Level; lang: Lang }) {
  const s = STATES[level];
  const c = COPY[lang];
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-text-muted">{c.trendLabel}</span>
        <span className="text-[0.78rem] font-medium tracking-wide" style={{ color: s.color }}>
          {pickText(s.trendNote, lang)}
        </span>
      </div>
      <Trend data={TREND} level={level} />
      <div className="flex justify-between mt-1.5">
        {DAYS[lang].map((d, i) => (
          <span key={i} className="font-mono text-[0.58rem] text-text-soft">
            {d}
          </span>
        ))}
      </div>
      <p className="mt-6 text-[0.9rem] text-text-mid leading-relaxed max-w-[36ch]">
        {c.trendDesc}
      </p>
    </div>
  );
}

function PageMetrics({ level, lang }: { level: Level; lang: Lang }) {
  const s = STATES[level];
  const c = COPY[lang];
  return (
    <div>
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-text-muted">{c.metricsLabel}</span>
      <div className="mt-5 flex flex-col divide-y divide-border">
        {METRICS.map((m) => (
          <div key={m.label.en} className="flex items-center justify-between py-3">
            <div>
              <div className="text-[0.92rem] text-text font-medium">{pickText(m.label, lang)}</div>
              <div className="text-[0.72rem] text-text-soft mt-0.5">{pickText(m.hint, lang)}</div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-[0.66rem] tracking-wide" style={{ color: s.color }}>
                {pickText(m.status, lang)}
              </span>
              <span className="font-serif text-text text-[1.5rem] leading-none w-[3.2ch] text-right">
                {m.value}
                <span className="font-sans text-[0.6rem] text-text-soft ml-0.5">{m.unit}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageWhy({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const toneColor = (t: "good" | "normal" | "caution") =>
    t === "good" ? "#2EA86A" : t === "caution" ? "#E67E22" : "var(--c-text-muted)";
  return (
    <div>
      <div className="text-base font-semibold text-text mb-1">{c.whyTitle}</div>
      <p className="text-[0.86rem] text-text-muted mb-4 leading-relaxed">{c.whyDesc}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {FACTORS.map((f) => (
          <div key={f.label.en} className="flex items-center justify-between rounded-xl bg-surface/55 border border-border px-3.5 py-3">
            <span className="text-[0.8rem] text-text-mid">{pickText(f.label, lang)}</span>
            <span className="inline-flex items-center gap-1.5 text-[0.74rem] font-medium" style={{ color: toneColor(f.tone) }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: toneColor(f.tone) }} />
              {pickText(f.status, lang)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageSignals({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  return (
    <div>
      <div className="text-base font-semibold text-text mb-1">{c.signalsTitle}</div>
      <p className="text-[0.78rem] text-text-soft mb-4">{c.signalsDesc}</p>
      <div className="flex flex-col gap-2.5">
        {OBJECTIVE.map((o) => (
          <div key={o.label.en} className="flex items-center justify-between rounded-xl bg-surface/55 border border-border px-4 py-3">
            <span className="text-[0.86rem] text-text-mid">{pickText(o.label, lang)}</span>
            <span className="flex items-baseline gap-2.5">
              <span className="text-[0.74rem] font-medium" style={{ color: o.better ? "#2EA86A" : "#E67E22" }}>
                {o.delta} {c.vsYesterday}
              </span>
              <span className="font-serif text-xl text-text leading-none">
                {o.value}
                <span className="font-sans text-[0.62rem] text-text-soft ml-0.5">{o.unit}</span>
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================ 主组件（翻页容器）============================
export default function ReadinessOrb({ initialPage = 0 }: { initialPage?: number }) {
  const { locale } = useLocale();
  const lang: Lang = locale === "en" ? "en" : "zh";
  const c = COPY[lang];
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.3 });
  const level = levelFor(SCORE);

  // 避免 hydration mismatch：SSR / 首帧不带动画，挂载后再启用。
  // anim = 已挂载 && 未开启 reduce-motion → 才走滑入/淡入动画。
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const anim = mounted && !reduced;

  const PAGES = [
    { key: "score", title: c.pageScore, node: <PageScore level={level} lang={lang} /> },
    { key: "trend", title: c.pageTrend, node: <PageTrend level={level} lang={lang} /> },
    { key: "metrics", title: c.pageMetrics, node: <PageMetrics level={level} lang={lang} /> },
    { key: "why", title: c.pageWhy, node: <PageWhy lang={lang} /> },
    { key: "signals", title: c.pageSignals, node: <PageSignals lang={lang} /> },
  ];
  const total = PAGES.length;
  const [{ page, dir }, setPage] = useState({ page: Math.min(Math.max(initialPage, 0), 4), dir: 0 });

  const go = useCallback(
    (target: number, d: number) => {
      const p = (target + total) % total;
      setPage({ page: p, dir: d });
    },
    [total]
  );
  const prev = useCallback(() => go(page - 1, -1), [go, page]);
  const next = useCallback(() => go(page + 1, 1), [go, page]);

  // 键盘左右翻页（当卡片在视口内时）
  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, prev, next]);

  const slideVariants = {
    enter: (d: number) => (anim ? { x: d > 0 ? "100%" : "-100%", opacity: 0 } : { opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => (anim ? { x: d > 0 ? "-100%" : "100%", opacity: 0 } : { opacity: 0 }),
  };

  return (
    <motion.div
      ref={rootRef}
      className="relative w-full max-w-[440px]"
      initial={false}
      animate={{ opacity: anim && !inView ? 0 : 1, y: anim && !inView ? 16 : 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{ containerType: "inline-size" }}
    >
      {/* 顶部：eyebrow + 当前页标题 + 翻页箭头 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-mono text-[0.64rem] uppercase tracking-[0.2em] text-text-muted whitespace-nowrap">
            {c.eyebrow}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={PAGES[page].key}
              className="text-[0.92rem] font-medium text-text truncate"
              initial={anim ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={anim ? { opacity: 0, y: -6 } : { opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {PAGES[page].title}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={prev}
            aria-label={c.prev}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:border-border-strong transition-colors cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={c.next}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:border-border-strong transition-colors cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* 卡片框（固定高度，内容横向翻页滑入/滑出） */}
      <div className="relative h-[330px] overflow-hidden rounded-2xl">
        <AnimatePresence custom={dir} mode="popLayout" initial={false}>
          <motion.div
            key={PAGES[page].key}
            custom={dir}
            variants={slideVariants}
            initial={anim ? "enter" : false}
            animate="center"
            exit="exit"
            transition={anim ? { x: { type: "spring", stiffness: 320, damping: 34 }, opacity: { duration: 0.2 } } : { duration: 0.18 }}
            className="absolute inset-0 flex flex-col justify-center"
          >
            {PAGES[page].node}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部小圆点 */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {PAGES.map((p, i) => (
          <button
            key={p.key}
            type="button"
            onClick={() => go(i, i > page ? 1 : -1)}
            aria-label={c.pageOf(i + 1, p.title)}
            aria-current={i === page}
            className="group p-1.5 cursor-pointer"
          >
            <span
              className="block h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === page ? 22 : 7,
                background: i === page ? STATES[level].color : "var(--c-border-strong)",
              }}
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
