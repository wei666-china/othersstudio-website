"use client";

/**
 * FoodScanDemo —— 首页「拍照识别食物」功能展示（第 3 期）。
 *
 * 深色科技版块：取景框里一张精致餐食照片，滚入视口自动「扫描识别」——
 * 橙色扫描线掠过 → 食物上浮现标识点 → 营养卡浮现、热量数字滚动。
 * 主打 AI 的「黑盒魔法感」：只展示识别结果有多准、多漂亮，不暴露任何识别逻辑。
 * 营养数据为预设演示。中英双语、尊重 prefers-reduced-motion、移动端友好、无外部依赖。
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import Reveal from "@/components/Reveal";

type Lang = "zh" | "en";
type Phase = "idle" | "scanning" | "result";

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
    eyebrow: "拍照识别",
    title: "拍一张，AI 就知道你吃了什么",
    desc: "不用查表、不用手输。对着餐盘拍一张，DAY 1 当场认出食物、算好热量与营养——记录一餐，只要一秒。",
    points: [
      "一拍即识别，多种食物同时认出",
      "热量、蛋白、碳水、脂肪自动拆解",
      "结果一键存进当天饮食记录",
    ],
    scan: "识别这一餐",
    again: "再试一次",
    scanning: "识别中…",
    kcalLabel: "总热量",
    items: "已识别",
    protein: "蛋白质",
    carbs: "碳水",
    fat: "脂肪",
    cta: "在 App 里拍照记录每一餐",
    note: "示例为演示，营养数据非真实测量。",
  },
  en: {
    eyebrow: "Snap & Recognize",
    title: "Snap a photo — AI knows what you ate",
    desc: "No lookup tables, no manual entry. Point at your plate and DAY 1 instantly recognizes the food and works out calories and macros — logging a meal takes a second.",
    points: [
      "One snap, multiple foods recognized at once",
      "Calories, protein, carbs and fat auto-broken down",
      "Save the result to today's food log in one tap",
    ],
    scan: "Scan this meal",
    again: "Try again",
    scanning: "Recognizing…",
    kcalLabel: "Total calories",
    items: "Detected",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    cta: "Log every meal by photo in the app",
    note: "Demo only — nutrition values are not real measurements.",
  },
};

// ── 识别数据（预设演示，黑盒，不暴露识别逻辑） ───────────────────
const FOOD = {
  img: "/food/food-demo-1.png",
  // 标识点：x/y 为容器百分比
  items: [
    { x: 38, y: 64, zh: "鸡胸肉", en: "Chicken" },
    { x: 33, y: 30, zh: "糙米饭", en: "Brown rice" },
    { x: 62, y: 24, zh: "西兰花", en: "Broccoli" },
    { x: 74, y: 72, zh: "牛油果", en: "Avocado" },
    { x: 76, y: 46, zh: "番茄", en: "Tomato" },
  ],
  kcal: 540,
  protein: 44,
  carbs: 46,
  fat: 18,
};

// ── 营养分项 ─────────────────────────────────────────────────────
function MacroStat({ label, grams, show, delay }: { label: string; grams: number; show: boolean; delay: number }) {
  return (
    <div
      className="flex-1 text-center"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(8px)",
        transition: `opacity var(--dur-base) var(--ease-out-soft) ${delay}ms, transform var(--dur-base) var(--ease-out-soft) ${delay}ms`,
      }}
    >
      <div className="font-serif text-xl text-on-ink leading-none">
        {grams}
        <span className="text-xs text-on-ink/50 ml-0.5">g</span>
      </div>
      <div className="text-[0.62rem] text-on-ink/55 tracking-wide mt-1.5 uppercase">{label}</div>
    </div>
  );
}

export default function FoodScanDemo() {
  const { locale } = useLocale();
  const lang: Lang = locale === "en" ? "en" : "zh";
  const c = COPY[lang];

  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const [phase, setPhase] = useState<Phase>("idle");
  const [scanTop, setScanTop] = useState(0);
  const [kcal, setKcal] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef<number | null>(null); // 扫描线双 rAF
  const countRaf = useRef<number | null>(null); // 热量数字滚动

  const cleanup = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (countRaf.current) cancelAnimationFrame(countRaf.current);
    rafRef.current = null;
    countRaf.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const countUp = useCallback((target: number) => {
    const dur = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setKcal(Math.round(target * eased));
      if (p < 1) countRaf.current = requestAnimationFrame(tick);
    };
    countRaf.current = requestAnimationFrame(tick);
  }, []);

  const run = useCallback(() => {
    cleanup();

    if (prefersReducedMotion()) {
      setScanTop(0);
      setKcal(FOOD.kcal);
      setPhase("result");
      return;
    }

    setPhase("scanning");
    setKcal(0);
    setScanTop(0);
    // 双 rAF：先让 top:0 渲染，再触发到 100% 的过渡（扫描线掠过）
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setScanTop(100));
    });
    const t = setTimeout(() => {
      setPhase("result");
      countUp(FOOD.kcal);
    }, 1450);
    timers.current.push(t);
  }, [cleanup, countUp]);

  useEffect(() => {
    if (inView && phase === "idle") run();
  }, [inView, phase, run]);

  const result = phase === "result";

  return (
    <section ref={ref} className="bg-ink text-on-ink py-24 md:py-32 px-6 md:px-15 relative overflow-hidden" id="food-scan">
      {/* 氛围光 */}
      <div className="absolute top-[-12%] right-[-8%] w-[44vw] max-w-[560px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.12)_0%,transparent_66%)] pointer-events-none" />

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
            onClick={run}
            disabled={phase === "scanning"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-medium shadow-[0_8px_28px_rgba(255,107,53,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-[var(--dur-fast)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {phase === "scanning" ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
            {phase === "scanning" ? c.scanning : result ? c.again : c.scan}
          </button>
        </Reveal>

        {/* 右：取景框 */}
        <div className="relative">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
            <Image
              src={FOOD.img}
              alt={lang === "en" ? "A healthy meal being recognized" : "正在识别的健康餐食"}
              fill
              sizes="(max-width: 1024px) 90vw, 620px"
              className="object-cover"
              priority={false}
            />

            {/* 取景框四角 */}
            {(["tl", "tr", "bl", "br"] as const).map((corner) => (
              <span
                key={corner}
                className={`absolute w-7 h-7 border-accent ${
                  corner === "tl" ? "top-4 left-4 border-t-2 border-l-2 rounded-tl-lg" :
                  corner === "tr" ? "top-4 right-4 border-t-2 border-r-2 rounded-tr-lg" :
                  corner === "bl" ? "bottom-4 left-4 border-b-2 border-l-2 rounded-bl-lg" :
                  "bottom-4 right-4 border-b-2 border-r-2 rounded-br-lg"
                }`}
                style={{ opacity: phase === "idle" ? 0.5 : 1, transition: "opacity var(--dur-base)" }}
              />
            ))}

            {/* 扫描线（包装层与容器同高，translateY 100% 即掠过全图——合成器动画，不触发布局） */}
            {phase === "scanning" && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ transform: `translateY(${scanTop}%)`, transition: "transform 1.4s linear" }}
              >
                <div className="h-[2px] w-full bg-accent shadow-[0_0_16px_4px_rgba(255,107,53,0.7)]" />
                <div className="h-16 w-full bg-gradient-to-b from-[rgba(255,107,53,0.25)] to-transparent" />
              </div>
            )}

            {/* 识别标识点 */}
            {FOOD.items.map((it, i) => (
              <div
                key={it.en}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none"
                style={{
                  left: `${it.x}%`,
                  top: `${it.y}%`,
                  opacity: result ? 1 : 0,
                  transform: result ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.6)",
                  transition: `opacity var(--dur-base) var(--ease-out-soft) ${i * 120}ms, transform var(--dur-base) var(--ease-spring) ${i * 120}ms`,
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-accent/25" />
                <span className="px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-sm text-white text-[0.66rem] font-medium whitespace-nowrap">
                  {lang === "en" ? it.en : it.zh}
                </span>
              </div>
            ))}
          </div>

          {/* 营养结果卡 */}
          <div
            className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md px-5 py-4"
            style={{
              opacity: result ? 1 : 0,
              transform: result ? "translateY(0)" : "translateY(12px)",
              transition: "opacity var(--dur-slow) var(--ease-out-soft) 120ms, transform var(--dur-slow) var(--ease-out-soft) 120ms",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[2.4rem] leading-none text-on-ink tabular-nums">{kcal}</span>
                <span className="text-xs text-on-ink/55 tracking-wide uppercase">kcal · {c.kcalLabel}</span>
              </div>
              <span className="text-[0.66rem] text-on-ink/45 tracking-wide">
                {c.items} {FOOD.items.length}
              </span>
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
              <MacroStat label={c.protein} grams={FOOD.protein} show={result} delay={200} />
              <span className="w-px bg-white/10" />
              <MacroStat label={c.carbs} grams={FOOD.carbs} show={result} delay={300} />
              <span className="w-px bg-white/10" />
              <MacroStat label={c.fat} grams={FOOD.fat} show={result} delay={400} />
            </div>
          </div>

          <p className="text-[11px] text-on-ink/40 text-center mt-3">{c.note}</p>
        </div>
      </div>
    </section>
  );
}
