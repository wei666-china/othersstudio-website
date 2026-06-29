"use client";

/**
 * AdvisorDemo —— 首页「AI 训练顾问」交互 demo。
 *
 * 左侧 4 项选择 → 右侧先放 AI 思考动画，再逐行浮现一张训练计划卡。
 * 真 AI（/api/advisor 后端开关）接通时是实时生成；未接通时后端用预设规则兜底，
 * 前端无感知、体验一致。文案中英双语，尊重 prefers-reduced-motion。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import Button from "@/components/ui/Button";
import Reveal from "@/components/Reveal";
import {
  type Goal,
  type Equipment,
  type Experience,
  type PlanCard,
  MIN_DAYS,
  MAX_DAYS,
} from "@/lib/advisor";

type Phase = "idle" | "thinking" | "result" | "limited" | "error";

const COPY = {
  zh: {
    eyebrow: "AI 训练顾问",
    title: "30 秒，生成你的专属训练计划",
    desc: "告诉我们四件事，DAY 1 的 AI 会为你规划一周的训练。这只是它能力的一角。",
    goal: "训练目标",
    days: "每周训练",
    daysUnit: "天",
    equipment: "可用器械",
    experience: "训练经验",
    generate: "生成计划",
    regenerate: "重新生成",
    idleHint: "选择左侧条件，点击「生成计划」",
    thinking: [
      "解析你的训练目标…",
      "匹配合适的训练分化…",
      "挑选动作与组次…",
      "生成你的计划…",
    ],
    realtime: "实时生成",
    perWeekTpl: (n: number) => `每周 ${n} 天`,
    setsReps: (s: number, r: string) => `${s} 组 × ${r}`,
    cta: "在 App 里解锁完整计划与实时教练",
    limited: "今天的体验次数用完了 —— 下载 App 解锁无限次智能计划。",
    error: "生成失败，请稍后重试。",
    disclaimer: "示例计划，仅供参考。请结合自身情况调整。",
  },
  en: {
    eyebrow: "AI Training Advisor",
    title: "Your personal training plan in 30 seconds",
    desc: "Tell us four things and DAY 1's AI maps out your week. This is just a glimpse of what it does.",
    goal: "Goal",
    days: "Days / week",
    daysUnit: "",
    equipment: "Equipment",
    experience: "Experience",
    generate: "Generate plan",
    regenerate: "Regenerate",
    idleHint: "Pick your options, then hit “Generate plan”.",
    thinking: [
      "Reading your goal…",
      "Matching a training split…",
      "Selecting exercises & sets…",
      "Building your plan…",
    ],
    realtime: "Live",
    perWeekTpl: (n: number) => `${n} days / week`,
    setsReps: (s: number, r: string) => `${s} × ${r}`,
    cta: "Unlock the full plan & live coach in the app",
    limited: "You've used today's demo runs — download the app for unlimited AI plans.",
    error: "Something went wrong. Please try again.",
    disclaimer: "Sample plan for reference. Adjust to your own situation.",
  },
};

const GOALS: { value: Goal; zh: string; en: string }[] = [
  { value: "muscle", zh: "增肌", en: "Build muscle" },
  { value: "fatloss", zh: "减脂", en: "Lose fat" },
  { value: "shape", zh: "塑形", en: "Tone up" },
  { value: "strength", zh: "力量", en: "Get strong" },
];
const EQUIPMENTS: { value: Equipment; zh: string; en: string }[] = [
  { value: "gym", zh: "健身房", en: "Full gym" },
  { value: "dumbbell", zh: "家用哑铃", en: "Dumbbells" },
  { value: "bodyweight", zh: "纯徒手", en: "Bodyweight" },
];
const EXPERIENCES: { value: Experience; zh: string; en: string }[] = [
  { value: "beginner", zh: "新手", en: "Beginner" },
  { value: "intermediate", zh: "进阶", en: "Intermediate" },
];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function AdvisorDemo() {
  const { locale } = useLocale();
  const lang: "zh" | "en" = locale === "en" ? "en" : "zh";
  const c = COPY[lang];
  const pick = (o: { zh: string; en: string }) => (lang === "en" ? o.en : o.zh);

  const [goal, setGoal] = useState<Goal>("muscle");
  const [days, setDays] = useState(3);
  const [equipment, setEquipment] = useState<Equipment>("gym");
  const [experience, setExperience] = useState<Experience>("beginner");

  const [phase, setPhase] = useState<Phase>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [plan, setPlan] = useState<PlanCard | null>(null);
  const [revealed, setRevealed] = useState(0);

  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (stepTimer.current) clearInterval(stepTimer.current);
    if (revealTimer.current) clearInterval(revealTimer.current);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // 计划卡逐行浮现
  useEffect(() => {
    if (phase !== "result" || !plan) return;
    const total = plan.days.reduce((n, d) => n + 1 + d.exercises.length, 0) + 1;
    if (prefersReducedMotion()) {
      setRevealed(total);
      return;
    }
    setRevealed(0);
    let i = 0;
    revealTimer.current = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= total && revealTimer.current) clearInterval(revealTimer.current);
    }, 110);
    return () => {
      if (revealTimer.current) clearInterval(revealTimer.current);
    };
  }, [phase, plan]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const generate = useCallback(async () => {
    clearTimers();
    setPlan(null);
    setActiveStep(0);
    setPhase("thinking");

    const reduced = prefersReducedMotion();
    const steps = c.thinking.length;
    if (!reduced) {
      stepTimer.current = setInterval(() => {
        setActiveStep((s) => Math.min(s + 1, steps - 1));
      }, 550);
    } else {
      setActiveStep(steps - 1);
    }
    const minDelay = sleep(reduced ? 0 : 550 * steps + 300);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, daysPerWeek: days, equipment, experience, locale: lang }),
      });
      await minDelay;
      clearTimers();
      if (res.status === 429) {
        setPhase("limited");
        return;
      }
      const data = (await res.json()) as { plan?: PlanCard };
      if (!data.plan) {
        setPhase("error");
        return;
      }
      setPlan(data.plan);
      setPhase("result");
    } catch {
      await minDelay;
      clearTimers();
      setPhase("error");
    }
  }, [c.thinking.length, goal, days, equipment, experience, lang, clearTimers]);

  return (
    <section id="advisor" className="bg-bg-alt py-24 md:py-32 px-6 md:px-15">
      <div className="max-w-[1100px] mx-auto">
        {/* 标题区 */}
        <Reveal direction="up" className="max-w-[44ch] mb-12 md:mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent-deep mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            {c.eyebrow}
          </span>
          <h2 className="text-[clamp(1.9rem,4vw,3rem)] leading-[1.12] mb-4">{c.title}</h2>
          <p className="text-base text-text-muted leading-relaxed">{c.desc}</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 lg:gap-8 items-start">
          {/* 左：表单 */}
          <div className="bg-surface rounded-2xl border border-border p-6 md:p-7 flex flex-col gap-6">
            <Field label={c.goal}>
              <PillGroup
                options={GOALS.map((o) => ({ value: o.value, label: pick(o) }))}
                value={goal}
                onChange={(v) => setGoal(v as Goal)}
                cols={2}
              />
            </Field>

            <Field label={`${c.days}${lang === "zh" ? "" : ""}`}>
              <div className="flex gap-2">
                {Array.from({ length: MAX_DAYS - MIN_DAYS + 1 }, (_, i) => MIN_DAYS + i).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    aria-pressed={days === d}
                    className={`flex-1 h-11 rounded-xl border text-sm font-medium transition-all duration-[var(--dur-fast)] ease-[var(--ease-out-soft)] ${
                      days === d
                        ? "border-accent bg-accent-soft text-accent-deep"
                        : "border-border text-text-mid hover:border-border-strong"
                    }`}
                  >
                    {d}
                    {lang === "zh" ? <span className="text-xs ml-0.5">{c.daysUnit}</span> : null}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={c.equipment}>
              <PillGroup
                options={EQUIPMENTS.map((o) => ({ value: o.value, label: pick(o) }))}
                value={equipment}
                onChange={(v) => setEquipment(v as Equipment)}
                cols={3}
              />
            </Field>

            <Field label={c.experience}>
              <PillGroup
                options={EXPERIENCES.map((o) => ({ value: o.value, label: pick(o) }))}
                value={experience}
                onChange={(v) => setExperience(v as Experience)}
                cols={2}
              />
            </Field>

            <Button
              onClick={generate}
              disabled={phase === "thinking"}
              className="mt-1 w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {phase === "thinking" ? (
                <Spinner />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              )}
              {plan ? c.regenerate : c.generate}
            </Button>
          </div>

          {/* 右：结果区 */}
          <div className="min-h-[420px] rounded-2xl border border-border bg-surface-2 p-6 md:p-7 relative overflow-hidden">
            {phase === "idle" && <IdleState hint={c.idleHint} />}
            {phase === "thinking" && <ThinkingState steps={c.thinking} active={activeStep} />}
            {phase === "limited" && <NoticeState tone="warn" text={c.limited} />}
            {phase === "error" && <NoticeState tone="error" text={c.error} />}
            {phase === "result" && plan && (
              <PlanView plan={plan} revealed={revealed} c={c} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 子组件 ──────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold tracking-wide text-text-mid mb-2.5 uppercase">{label}</div>
      {children}
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
  cols,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  cols: 2 | 3;
}) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`h-11 px-3 rounded-xl border text-sm font-medium transition-all duration-[var(--dur-fast)] ease-[var(--ease-out-soft)] ${
            value === o.value
              ? "border-accent bg-accent-soft text-accent-deep"
              : "border-border text-text-mid hover:border-border-strong"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IdleState({ hint }: { hint: string }) {
  return (
    <div className="h-full min-h-[372px] flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-accent-soft border border-accent/20 flex items-center justify-center mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-deep)" strokeWidth="1.8">
          <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.5-6.5l-1.4 1.4M7.9 16.1l-1.4 1.4m12.6 0l-1.4-1.4M7.9 7.9L6.5 6.5" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      </div>
      <p className="text-sm text-text-soft max-w-[24ch] leading-relaxed">{hint}</p>
    </div>
  );
}

function ThinkingState({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="h-full min-h-[372px] flex flex-col justify-center gap-4 px-2">
      {steps.map((s, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <div
            key={i}
            className={`flex items-center gap-3 transition-all duration-[var(--dur-base)] ${
              i <= active ? "opacity-100" : "opacity-35"
            }`}
          >
            <span className="flex-shrink-0 w-5 h-5">
              {done ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-deep)" strokeWidth="2.4">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : current ? (
                <span className="block text-accent-deep">
                  <Spinner />
                </span>
              ) : (
                <span className="block w-2 h-2 rounded-full bg-border-strong mt-1.5 ml-1.5" />
              )}
            </span>
            <span className={`text-sm ${current ? "text-text font-medium" : "text-text-muted"}`}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

function NoticeState({ tone, text }: { tone: "warn" | "error"; text: string }) {
  return (
    <div className="h-full min-h-[372px] flex flex-col items-center justify-center text-center px-4">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          tone === "warn" ? "bg-accent-soft" : "bg-surface"
        } border border-border`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-deep)" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5m0 3h.01" />
        </svg>
      </div>
      <p className="text-sm text-text-mid max-w-[28ch] leading-relaxed">{text}</p>
    </div>
  );
}

function PlanView({
  plan,
  revealed,
  c,
}: {
  plan: PlanCard;
  revealed: number;
  c: (typeof COPY)["zh"];
}) {
  let idx = 0;
  const row = () => idx++;
  const show = (i: number) => i < revealed;
  const riseCls = (i: number) =>
    `transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] ${
      show(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
    }`;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="text-lg md:text-xl font-semibold text-text leading-snug">{plan.name}</div>
          <div className="flex flex-wrap gap-2 mt-2.5">
            <Tag>{plan.goalLabel}</Tag>
            <Tag>{plan.splitLabel}</Tag>
            <Tag>{c.perWeekTpl(plan.perWeek)}</Tag>
          </div>
        </div>
        {plan.source === "ai" && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-soft text-accent-deep text-[11px] font-medium">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />
            </svg>
            {c.realtime}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 max-h-[340px] overflow-y-auto pr-1 -mr-1">
        {plan.days.map((day, di) => {
          const dayRow = row();
          return (
            <div key={di} className={riseCls(dayRow)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-ink text-on-ink text-[11px] font-semibold">
                  {di + 1}
                </span>
                <span className="text-sm font-medium text-text">{day.title}</span>
              </div>
              <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
                {day.exercises.map((ex, ei) => {
                  const exRow = row();
                  return (
                    <div
                      key={ei}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 bg-surface ${riseCls(exRow)}`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-text truncate">{ex.name}</div>
                        <div className="text-xs text-text-soft">{ex.muscle}</div>
                      </div>
                      <div className="flex-shrink-0 text-xs font-mono text-text-mid tabular-nums">
                        {c.setsReps(ex.sets, ex.reps)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* note */}
        <div className={riseCls(row())}>
          <div className="flex gap-2.5 p-3.5 rounded-xl bg-accent-soft border border-accent/20">
            <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-deep)" strokeWidth="1.8">
              <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.2 1 2.5h6c0-1.3.5-2 1-2.5A6 6 0 0 0 12 3z" />
            </svg>
            <p className="text-xs text-text-mid leading-relaxed">{plan.note}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-border">
        <Button href="#product" size="md" className="w-full">
          {c.cta}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
        <p className="text-[11px] text-text-soft text-center mt-3">{c.disclaimer}</p>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-border-strong text-text-mid text-xs">
      {children}
    </span>
  );
}
