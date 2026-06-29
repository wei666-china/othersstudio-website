"use client";

/**
 * CoachTimingDemo —— 首页「AI 教练时机感」功能展示（第 3 期）。
 *
 * 浅色暖底版块：一张「训练时刻」卡片自动循环——一组动作进行中（次数律动）→
 * 进入组间休息的那一刻，AI 教练头像脉冲出现、气泡逐字打出一句恰到好处的提醒。
 * 底部一条训练时间线把「AI 只在组间开口」可视化（游标 + 休息点的 AI 火花）。
 *
 * 调性与食物 demo 一致：只展示「结果多懂你、时机多准」的体验，绝不暴露判断逻辑——
 * 黑盒魔法、视觉满足优先。中英双语、尊重 prefers-reduced-motion、移动端友好、无外部依赖。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import Reveal from "@/components/Reveal";

type Lang = "zh" | "en";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useInView<T extends HTMLElement>(threshold = 0.4) {
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
    eyebrow: "实时 AI 教练",
    title: "最好的教练，知道什么时候开口",
    desc: "训练时它安静待命，正好在你放下杠铃、组间喘息的那一刻开口——一句恰到好处的提醒，不打扰、也从不缺席。",
    points: [
      "读懂训练节奏，只在该说话的时候说话",
      "结合你当下的状态，给即时、个性化的指导",
      "解放双手，训练中也能用语音对话",
    ],
    exercise: "杠铃卧推",
    training: "训练中",
    resting: "组间休息",
    set: (n: number) => `第 ${n} 组`,
    reps: "目标 8 次",
    coachName: "DAY 1 教练",
    justNow: "刚刚",
    timelineNote: "AI 只在组间休息开口——不打断你的每一组。",
    replay: "重新演示",
    cta: "在 App 里体验训练中的实时教练",
  },
  en: {
    eyebrow: "Live AI Coach",
    title: "The best coach knows when to speak",
    desc: "It stays quiet while you lift, then speaks the moment you rack the bar and catch your breath — one well-timed cue, never nagging, never absent.",
    points: [
      "Reads your rhythm — speaks only when it should",
      "Instant, personalized cues based on how you feel right now",
      "Hands-free: talk to it mid-workout by voice",
    ],
    exercise: "Barbell Bench Press",
    training: "Training",
    resting: "Rest",
    set: (n: number) => `Set ${n}`,
    reps: "Target 8 reps",
    coachName: "DAY 1 Coach",
    justNow: "now",
    timelineNote: "The coach speaks only between sets — never mid-rep.",
    replay: "Replay",
    cta: "Experience the live coach inside the app",
  },
};

// ── 教练台词（预设演示，黑盒，不暴露判断逻辑） ───────────────────
const MESSAGES = [
  { zh: "这组节奏很稳，下一组加 2.5kg 试试。", en: "Solid tempo — try +2.5kg next set." },
  { zh: "心率还偏高，多歇 20 秒再上。", en: "Heart rate's still up — rest 20s more." },
  { zh: "核心收紧，今天状态很在线。", en: "Brace your core — you're on form today." },
];

// ── 训练流程（一组 → 组间休息，循环） ────────────────────────────
type FlowStep = { kind: "set"; setNo: number } | { kind: "rest"; msgIdx: number };
const FLOW: FlowStep[] = [
  { kind: "set", setNo: 1 },
  { kind: "rest", msgIdx: 0 },
  { kind: "set", setNo: 2 },
  { kind: "rest", msgIdx: 1 },
  { kind: "set", setNo: 3 },
  { kind: "rest", msgIdx: 2 },
];
const SET_MS = 2200;
const REST_MS = 3900;
const REPS = 8;

// ── AI 火花图标 ──────────────────────────────────────────────────
function Spark({ size = 18, className = "", color }: { size?: number; className?: string; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color ?? "currentColor"} className={className}>
      <path d="M12 2c.4 2.6 1.4 4.4 3 5.6 1 .8 2.3 1.4 4 1.9-1.7.5-3 1.1-4 1.9-1.6 1.2-2.6 3-3 5.6-.4-2.6-1.4-4.4-3-5.6-1-.8-2.3-1.4-4-1.9 1.7-.5 3-1.1 4-1.9 1.6-1.2 2.6-3 3-5.6z" />
    </svg>
  );
}

export default function CoachTimingDemo() {
  const { locale } = useLocale();
  const lang: Lang = locale === "en" ? "en" : "zh";
  const c = COPY[lang];

  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  // 初始停在第一个组间休息（idx=1）：静态/SSR 帧直接展示 AI 教练在说话——最能代表功能
  const [idx, setIdx] = useState(1);
  const [cycle, setCycle] = useState(0); // 用于「重新演示」时强制从第 1 组重启
  const [reps, setReps] = useState(0);
  const [typed, setTyped] = useState("");
  const [bubbleIn, setBubbleIn] = useState(false);
  const [barRun, setBarRun] = useState(false);

  const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const playing = inView && !reduced;

  const clearStep = useCallback(() => {
    if (stepTimer.current) clearTimeout(stepTimer.current);
    stepTimer.current = null;
  }, []);

  // 步骤推进：仅在可见且允许动效时循环
  useEffect(() => {
    if (!playing) return;
    const dur = FLOW[idx].kind === "set" ? SET_MS : REST_MS;
    stepTimer.current = setTimeout(() => {
      setIdx((i) => (i + 1) % FLOW.length);
    }, dur);
    return clearStep;
  }, [idx, playing, clearStep, cycle]);

  // 每步内容动效：set 次数律动 / rest 气泡滑入 + 打字机 + 休息进度
  useEffect(() => {
    const cur = FLOW[idx];

    if (repTimer.current) clearInterval(repTimer.current);
    if (typeTimer.current) clearInterval(typeTimer.current);

    if (cur.kind === "set") {
      setTyped("");
      setBubbleIn(false);
      setBarRun(false);
      if (!playing) {
        setReps(REPS);
        return;
      }
      setReps(0);
      let r = 0;
      repTimer.current = setInterval(() => {
        r += 1;
        setReps(r);
        if (r >= REPS && repTimer.current) clearInterval(repTimer.current);
      }, SET_MS / (REPS + 1));
      return () => {
        if (repTimer.current) clearInterval(repTimer.current);
      };
    }

    // rest
    setReps(0);
    const full = MESSAGES[cur.msgIdx][lang];

    if (!playing) {
      setBubbleIn(true);
      setBarRun(false);
      setTyped(full);
      return;
    }

    setBubbleIn(false);
    setBarRun(false);
    setTyped("");
    // 双 rAF：先渲染初始态，再触发滑入 + 休息进度条
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setBubbleIn(true);
        setBarRun(true);
      })
    );
    // 气泡滑入后再开始打字，强化「先出现、后开口」的时机感
    const startType = setTimeout(() => {
      let i = 0;
      typeTimer.current = setInterval(() => {
        i += 1;
        setTyped(full.slice(0, i));
        if (i >= full.length && typeTimer.current) clearInterval(typeTimer.current);
      }, 42);
    }, 280);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(startType);
      if (typeTimer.current) clearInterval(typeTimer.current);
    };
  }, [idx, lang, playing, cycle]);

  // 卸载清理
  useEffect(
    () => () => {
      if (stepTimer.current) clearTimeout(stepTimer.current);
      if (repTimer.current) clearInterval(repTimer.current);
      if (typeTimer.current) clearInterval(typeTimer.current);
    },
    []
  );

  const replay = useCallback(() => {
    clearStep();
    setIdx(0);
    setCycle((n) => n + 1);
  }, [clearStep]);

  const cur = FLOW[idx];
  const isRest = cur.kind === "rest";
  const restFull = cur.kind === "rest" ? MESSAGES[cur.msgIdx][lang] : "";
  const typing = isRest && playing && typed.length < restFull.length;

  return (
    <section ref={ref} id="coach" className="relative overflow-hidden bg-bg-alt py-24 md:py-32 px-6 md:px-15">
      {/* 氛围光 */}
      <div className="absolute bottom-[-14%] left-[-8%] w-[42vw] max-w-[520px] aspect-square rounded-full bg-[radial-gradient(circle,var(--c-accent-soft)_0%,transparent_66%)] pointer-events-none" />

      <div className="relative max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-12 lg:gap-16 items-center">
        {/* 左：文案 */}
        <Reveal direction="up">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent-deep mb-5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            {c.eyebrow}
          </span>
          <h2 className="text-[clamp(1.9rem,4vw,3rem)] leading-[1.12] text-text mb-5">{c.title}</h2>
          <p className="text-base text-text-muted leading-relaxed mb-8 max-w-[42ch]">{c.desc}</p>

          <ul className="flex flex-col gap-3.5 mb-9">
            {c.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text-mid leading-relaxed">
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

        {/* 右：训练时刻卡 */}
        <div className="relative">
          <div className="rounded-3xl bg-surface border border-border shadow-[0_24px_70px_var(--c-shadow)] p-6 md:p-7">
            {/* 卡头：动作名 + 状态徽章 */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-text">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-2 text-text-mid">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
                  </svg>
                </span>
                <span className="text-sm font-medium">{c.exercise}</span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] font-medium tracking-wide transition-colors duration-[var(--dur-base)] ${
                  isRest ? "bg-accent-soft text-accent-deep" : "bg-surface-2 text-text-mid"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isRest ? "bg-accent-deep" : "bg-text-mid"} ${!isRest && playing ? "motion-safe:animate-pulse" : ""}`} />
                {isRest ? c.resting : c.training}
              </span>
            </div>

            {/* 主舞台：set 次数律动 / rest AI 教练气泡 */}
            <div className="mt-6 min-h-[188px] flex items-center justify-center">
              {!isRest ? (
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="text-[0.68rem] tracking-[0.2em] uppercase text-text-soft">{c.training}</div>
                  <div className="font-serif text-[2.6rem] leading-none text-text">{c.set(cur.kind === "set" ? cur.setNo : 1)}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {Array.from({ length: REPS }).map((_, i) => (
                      <span
                        key={i}
                        className="w-2 h-5 rounded-full"
                        style={{
                          background: i < reps ? "var(--c-accent)" : "var(--c-border)",
                          transform: i < reps ? "scaleY(1)" : "scaleY(0.55)",
                          transition: "background var(--dur-fast) var(--ease-out-soft), transform var(--dur-fast) var(--ease-spring)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-text-muted tabular-nums mt-1">
                    {reps}/{REPS} · {c.reps}
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-4">
                  {/* 休息进度条 */}
                  <div>
                    <div className="flex items-center justify-between text-[0.7rem] text-text-muted mb-1.5">
                      <span>{c.resting}</span>
                      <span className="font-mono tracking-wide">1:30</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent/45"
                        style={{
                          width: barRun ? "0%" : "100%",
                          transition: barRun ? `width ${REST_MS}ms linear` : "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* AI 教练气泡 */}
                  <div
                    className="flex items-start gap-3"
                    style={{
                      opacity: bubbleIn ? 1 : 0,
                      transform: bubbleIn ? "translateY(0)" : "translateY(10px)",
                      transition: "opacity var(--dur-base) var(--ease-out-soft), transform var(--dur-base) var(--ease-out-soft)",
                    }}
                  >
                    <span className="relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-deep flex items-center justify-center shadow-[0_5px_16px_rgba(255,107,53,0.35)]">
                      {playing && <span className="absolute inset-0 rounded-full ring-2 ring-accent/40 motion-safe:animate-ping" />}
                      <Spark size={18} color="#fff" className="relative" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-text">{c.coachName}</span>
                        <span className="text-[0.62rem] text-text-soft">{c.justNow}</span>
                      </div>
                      <div className="inline-block bg-surface-2 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-text leading-relaxed">
                        {typed}
                        {typing && <span className="inline-block w-0.5 h-4 align-middle ml-0.5 bg-accent motion-safe:animate-pulse" />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 底部：训练时间线（AI 只在组间开口的可视化） */}
            <div className="mt-6 pt-5 border-t border-border">
              <div className="flex items-end gap-1.5">
                {FLOW.map((s, i) => {
                  const active = i === idx;
                  const seg = s.kind === "rest";
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1.5"
                      style={{ flexGrow: seg ? 1 : 1.5, flexBasis: 0 }}
                    >
                      <div className="h-4 flex items-center justify-center">
                        {seg && (
                          <Spark
                            size={13}
                            color={active ? "var(--c-accent)" : "var(--c-text-soft)"}
                            className="transition-transform duration-[var(--dur-base)]"
                          />
                        )}
                      </div>
                      <span
                        className="h-1.5 w-full rounded-full"
                        style={{
                          background: active ? "var(--c-accent)" : seg ? "var(--c-border-strong)" : "var(--c-border)",
                          transition: "background var(--dur-base) var(--ease-out-soft)",
                        }}
                      />
                      <span className="h-3 text-[0.58rem] font-mono text-text-soft leading-none">
                        {s.kind === "set" ? s.setNo : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[0.7rem] text-text-muted leading-relaxed mt-3">{c.timelineNote}</p>
            </div>
          </div>

          <p className="text-[11px] text-text-soft text-center mt-3">{c.cta}</p>
        </div>
      </div>
    </section>
  );
}
