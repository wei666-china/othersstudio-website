"use client";

/**
 * FeatureShowcase —— 首页「核心功能展示」版块。
 *
 * 「交互式肌肉展示」章节（阶段 1 · 第一批）：
 * 正 / 背面发光人体图可 3D 翻转；点击肌群后镜头推近对焦、该肌群高亮、其余淡出，
 * 并浮现标注卡（肌群名 / 训练器械 / 代表动作）。
 * 沿用左文右图骨架、设计 token、IntersectionObserver 滚入触发、双语与 prefers-reduced-motion。
 * 纯 CSS / SVG、零新依赖。点肌群后的「动作动画」留作第二批。
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";

type Lang = "zh" | "en";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 元素滚入视口时触发一次（reduced-motion 时立即触发）。 */
function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion()) {
      setInView(true);
      return;
    }
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          ob.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );
    ob.observe(node);
    return () => ob.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/** 是否窄屏（移动端对焦放大需收敛，避免怼太近）。 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

// ── 版块文案（中英双语） ─────────────────────────────────────────

const SECTION = {
  zh: {
    eyebrow: "核心能力",
    title: "不只是记录，是读懂你的身体",
    desc: "每一块肌肉怎么练、用什么器械、做什么动作——DAY 1 把专业训练知识写进产品，这也是它能为你智能规划的底气。",
  },
  en: {
    eyebrow: "Core Capabilities",
    title: "More than tracking — understanding your body",
    desc: "How each muscle is trained, with which equipment and movements — DAY 1 builds pro training knowledge in, the foundation of its smart planning.",
  },
};

const FEATURE = {
  eyebrow: { zh: "专业训练知识", en: "Training Intelligence" },
  title: { zh: "懂每一块肌肉，才能科学地练", en: "Know every muscle, train with intent" },
  desc: {
    zh: "DAY 1 识别主流肌群，并清楚每个肌群对应的训练器械与代表动作——专业，写进了每一处细节。",
    en: "DAY 1 maps the major muscle groups, each with its equipment and signature movements — expertise built into every detail.",
  },
  points: [
    { zh: "目标肌群 · 训练器械 · 代表动作，一目了然", en: "Target muscle · equipment · key movement, at a glance" },
    { zh: "AI 据此为你匹配最合适的训练", en: "AI matches the right training accordingly" },
  ],
};

// 交互文案（翻转 / 复位 / 提示）
const TEXT = {
  zh: { viewBack: "翻转看背面", viewFront: "翻转看正面", reset: "返回", hint: "点击发光肌群查看" },
  en: { viewBack: "Flip to back", viewFront: "Flip to front", reset: "Back", hint: "Tap a glowing muscle" },
};

// ── 肌群数据（坐标为容器百分比；pos 同时作热区中心与对焦原点） ──────────
type MuscleFace = "front" | "back";
// 单束信息（用于三角肌前/中/后束这类「一个点、多束分行」展示）
type MusclePart = {
  label: { zh: string; en: string };
  equip: { zh: string; en: string };
  move: { zh: string; en: string };
};
type Muscle = {
  id: string;
  face: MuscleFace;
  pos: { x: number; y: number };
  scale: number; // 对焦放大倍数（桌面基准，移动端会收敛）
  name: { zh: string; en: string };
  equip: { zh: string; en: string };
  move: { zh: string; en: string };
  parts?: MusclePart[]; // 可选：有则卡片按束分行展示（如三角肌前/中/后束）
  glow?: { w: number; h: number }; // 可选：高亮光晕尺寸(容器百分比)，不填用默认 40×30；小肌群用更小值更聚焦
};

const MUSCLES: Muscle[] = [
  // 正面（坐标按真人发光图实测校准）
  { id: "chest", face: "front", pos: { x: 49, y: 32 }, scale: 1.5, name: { zh: "胸大肌", en: "Pectorals" }, equip: { zh: "杠铃 / 哑铃", en: "Barbell / Dumbbell" }, move: { zh: "卧推", en: "Bench Press" } },
  {
    id: "deltoid",
    face: "front",
    pos: { x: 33, y: 30 },
    scale: 1.7,
    name: { zh: "三角肌", en: "Deltoids" },
    glow: { w: 30, h: 22 },
    // 概览（窄场景/无 parts 渲染时的兜底）
    equip: { zh: "哑铃 / 杠铃", en: "Dumbbell / Barbell" },
    move: { zh: "前束 · 中束 · 后束", en: "Front · Side · Rear" },
    parts: [
      { label: { zh: "前束", en: "Front" }, equip: { zh: "哑铃 / 杠铃", en: "Dumbbell / Barbell" }, move: { zh: "肩上推举", en: "Overhead Press" } },
      { label: { zh: "中束", en: "Side" }, equip: { zh: "哑铃", en: "Dumbbell" }, move: { zh: "侧平举", en: "Lateral Raise" } },
      { label: { zh: "后束", en: "Rear" }, equip: { zh: "哑铃 / 绳索", en: "Dumbbell / Cable" }, move: { zh: "俯身飞鸟", en: "Reverse Fly" } },
    ],
  },
  { id: "biceps", face: "front", pos: { x: 30, y: 44 }, scale: 1.8, glow: { w: 24, h: 20 }, name: { zh: "肱二头肌", en: "Biceps" }, equip: { zh: "哑铃 / 杠铃", en: "Dumbbell / Barbell" }, move: { zh: "弯举", en: "Curls" } },
  { id: "forearm", face: "front", pos: { x: 22, y: 62 }, scale: 1.9, glow: { w: 22, h: 18 }, name: { zh: "前臂", en: "Forearms" }, equip: { zh: "哑铃 / 杠铃", en: "Dumbbell / Barbell" }, move: { zh: "腕弯举", en: "Wrist Curls" } },
  { id: "abs", face: "front", pos: { x: 49, y: 48 }, scale: 1.5, glow: { w: 34, h: 26 }, name: { zh: "腹直肌", en: "Rectus Abdominis" }, equip: { zh: "自重", en: "Bodyweight" }, move: { zh: "卷腹", en: "Crunches" } },
  { id: "obliques", face: "front", pos: { x: 38, y: 52 }, scale: 1.7, glow: { w: 24, h: 22 }, name: { zh: "腹斜肌", en: "Obliques" }, equip: { zh: "自重 / 绳索", en: "Bodyweight / Cable" }, move: { zh: "俄罗斯转体", en: "Russian Twist" } },
  { id: "quads", face: "front", pos: { x: 41, y: 73 }, scale: 1.5, name: { zh: "股四头肌", en: "Quadriceps" }, equip: { zh: "杠铃 / 史密斯", en: "Barbell / Smith" }, move: { zh: "深蹲", en: "Squat" } },
  // 背面（坐标按真人发光图实测校准）
  { id: "trap", face: "back", pos: { x: 49, y: 30 }, scale: 1.6, name: { zh: "斜方肌", en: "Trapezius" }, equip: { zh: "杠铃 / 哑铃", en: "Barbell / Dumbbell" }, move: { zh: "耸肩 · 划船", en: "Shrugs · Rows" } },
  { id: "lat", face: "back", pos: { x: 35, y: 50 }, scale: 1.6, name: { zh: "背阔肌", en: "Latissimus Dorsi" }, equip: { zh: "高位下拉器", en: "Lat Pulldown" }, move: { zh: "引体向上 · 下拉", en: "Pull-ups · Pulldown" } },
  { id: "triceps", face: "back", pos: { x: 26, y: 43 }, scale: 1.8, glow: { w: 24, h: 20 }, name: { zh: "肱三头肌", en: "Triceps" }, equip: { zh: "绳索 / 哑铃", en: "Cable / Dumbbell" }, move: { zh: "臂屈伸", en: "Pushdowns" } },
  { id: "lowerback", face: "back", pos: { x: 47, y: 60 }, scale: 1.6, name: { zh: "下背 / 竖脊肌", en: "Lower Back" }, equip: { zh: "杠铃 / 自重", en: "Barbell / Bodyweight" }, move: { zh: "硬拉 · 山羊挺身", en: "Deadlift · Back Ext." } },
  { id: "glute", face: "back", pos: { x: 49, y: 72 }, scale: 1.5, name: { zh: "臀大肌", en: "Gluteus Maximus" }, equip: { zh: "杠铃 / 史密斯", en: "Barbell / Smith" }, move: { zh: "深蹲 · 臀推", en: "Squat · Hip Thrust" } },
  { id: "ham", face: "back", pos: { x: 43, y: 90 }, scale: 1.6, name: { zh: "腘绳肌", en: "Hamstrings" }, equip: { zh: "腿弯举机", en: "Leg Curl" }, move: { zh: "罗马尼亚硬拉", en: "Romanian Deadlift" } },
  { id: "calf", face: "back", pos: { x: 37, y: 97 }, scale: 1.35, glow: { w: 22, h: 18 }, name: { zh: "小腿 / 腓肠肌", en: "Calves" }, equip: { zh: "史密斯 / 自重", en: "Smith / Bodyweight" }, move: { zh: "提踵", en: "Calf Raise" } },
];

// ── 图标 ──────────────────────────────────────────────────────────

function EquipIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
    </svg>
  );
}

// ── 单个面（正面 / 背面） ─────────────────────────────────────────

function BodyFace({
  face,
  src,
  flipped,
  inView,
  lang,
  reduced,
  selected,
  onSelect,
  isMobile,
}: {
  face: MuscleFace;
  src: string;
  flipped: boolean;
  inView: boolean;
  lang: Lang;
  reduced: boolean;
  selected: Muscle | null;
  onSelect: (id: string) => void;
  isMobile: boolean;
}) {
  const isBack = face === "back";
  const faceShown = isBack ? flipped : !flipped;
  const selectedHere = selected && selected.face === face ? selected : null;
  const focusScale = selectedHere ? selectedHere.scale * (isMobile ? 0.78 : 1) : 1;
  const muscles = MUSCLES.filter((m) => m.face === face);
  const alt = isBack
    ? lang === "en"
      ? "Muscle map, back view"
      : "肌肉示意图，背面"
    : lang === "en"
      ? "Muscle map, front view"
      : "肌肉示意图，正面";

  return (
    <div
      className="absolute inset-0"
      style={{
        opacity: faceShown ? 1 : 0,
        pointerEvents: faceShown ? "auto" : "none",
        transition: reduced ? "none" : `opacity var(--dur-base) var(--ease-out-soft)`,
      }}
      aria-hidden={!faceShown}
    >
      {/* 内容层：图 + 压暗 + 高亮，统一应用对焦放大 */}
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: selectedHere ? `${selectedHere.pos.x}% ${selectedHere.pos.y}%` : "center center",
          transform: `scale(${focusScale})`,
          transition: reduced ? "none" : `transform var(--dur-base) var(--ease-out-soft)`,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 90vw, 560px"
          className="object-contain"
          style={{
            opacity: inView ? 1 : 0,
            transition: reduced ? "none" : `opacity var(--dur-slow) var(--ease-out-soft)`,
          }}
          priority={false}
        />

        {selectedHere && (
          <>
            {/* 其余压暗 */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--c-bg)", opacity: 0.5 }} />
            {/* 选中高亮光晕 */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${selectedHere.pos.x}%`,
                top: `${selectedHere.pos.y}%`,
                width: `${selectedHere.glow?.w ?? 40}%`,
                height: `${selectedHere.glow?.h ?? 30}%`,
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(ellipse at center, rgba(255,107,53,0.85) 0%, rgba(255,107,53,0.35) 38%, rgba(255,107,53,0) 70%)",
                filter: "blur(4px)",
                mixBlendMode: "screen",
              }}
            />
          </>
        )}
      </div>

      {/* 选中肌群标注：指示点 + 引线 + 名称（在缩放层之外，对焦放大后仍精准指向） */}
      {selectedHere && faceShown && (
        <div className="absolute z-30 pointer-events-none" style={{ left: `${selectedHere.pos.x}%`, top: `${selectedHere.pos.y}%` }}>
          {/* 引线 */}
          <span className="absolute bg-accent" style={{ left: 0, top: 0, width: 2, height: 16, transform: "translate(-50%, -100%)" }} />
          {/* 指示点 */}
          <span
            className="absolute block w-3 h-3 rounded-full bg-accent"
            style={{ left: 0, top: 0, transform: "translate(-50%, -50%)", boxShadow: "0 0 0 5px rgba(255,107,53,0.30)" }}
          />
          {/* 名称标签 */}
          <span
            className="absolute whitespace-nowrap rounded-md bg-ink text-on-ink text-xs font-medium px-2.5 py-1 shadow-[0_4px_14px_var(--c-shadow)]"
            style={{ left: 0, top: 0, transform: "translate(-50%, calc(-100% - 16px))" }}
          >
            {selectedHere.name[lang]}
          </span>
        </div>
      )}

      {/* 肌群热区：未选中且本面朝前时可点 */}
      {!selected &&
        faceShown &&
        muscles.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-label={m.name[lang]}
            onClick={() => onSelect(m.id)}
            className="absolute z-10 grid place-items-center rounded-full"
            style={{ left: `${m.pos.x}%`, top: `${m.pos.y}%`, width: 46, height: 46, transform: "translate(-50%, -50%)" }}
          >
            <span className="block w-3 h-3 rounded-full bg-accent ring-4 ring-bg animate-pulse motion-reduce:animate-none" />
          </button>
        ))}
    </div>
  );
}

// ── 标注卡 ────────────────────────────────────────────────────────

function MuscleCard({ muscle, lang, reduced }: { muscle: Muscle; lang: Lang; reduced: boolean }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  return (
    <div
      className="mx-auto mt-4 max-w-[380px] rounded-xl border border-border bg-surface/95 backdrop-blur-sm px-4 py-3.5 shadow-[0_10px_30px_var(--c-shadow)]"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(10px)",
        transition: reduced ? "none" : `opacity var(--dur-base) var(--ease-out-soft), transform var(--dur-base) var(--ease-spring)`,
      }}
    >
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="font-serif text-lg leading-tight text-text">{muscle.name[lang]}</span>
        <span className="font-mono text-[0.6rem] uppercase tracking-wide text-text-soft">
          {lang === "en" ? muscle.name.zh : muscle.name.en}
        </span>
      </div>

      {muscle.parts && muscle.parts.length > 0 ? (
        // 多束展示（如三角肌前/中/后束）：束名徽章 + 器械/动作右侧两行
        <div className="flex flex-col gap-2.5 mt-1">
          {muscle.parts.map((part, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-px shrink-0 rounded-md bg-accent-soft px-2 py-0.5 text-[0.62rem] font-mono uppercase tracking-wide text-accent-deep">
                {part.label[lang]}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[0.8rem] text-accent-deep">
                  <EquipIcon />
                  <span>{part.equip[lang]}</span>
                </div>
                <div className="text-[0.8rem] text-text-mid leading-snug">{part.move[lang]}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 单卡片展示
        <>
          <div className="flex items-center gap-1.5 text-sm text-accent-deep mb-1">
            <EquipIcon />
            <span>{muscle.equip[lang]}</span>
          </div>
          <div className="text-sm text-text-mid leading-snug">{muscle.move[lang]}</div>
        </>
      )}
    </div>
  );
}

// ── 交互人体（翻转 + 对焦 + 高亮 + 标注卡） ──────────────────────────

function InteractiveBody({ inView, lang }: { inView: boolean; lang: Lang }) {
  const reduced = prefersReducedMotion();
  const isMobile = useIsMobile();
  const [flipped, setFlipped] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = MUSCLES.find((m) => m.id === selectedId) ?? null;
  const t = TEXT[lang];

  function flip() {
    setSelectedId(null);
    setFlipped((f) => !f);
  }
  function reset() {
    setSelectedId(null);
  }

  return (
    <div className="relative w-full max-w-[480px] mx-auto select-none">
      <div className="relative w-full aspect-[800/1024] overflow-hidden rounded-2xl">
        {/* 正 / 背面叠放，淡入淡出切换（不用 3D 镜像翻转，保证两面都居中、点位精准） */}
        <BodyFace face="front" src="/anatomy/body-glow-front-tight.png" flipped={flipped} inView={inView} lang={lang} reduced={reduced} selected={selected} onSelect={setSelectedId} isMobile={isMobile} />
        <BodyFace face="back" src="/anatomy/body-glow-tight.png" flipped={flipped} inView={inView} lang={lang} reduced={reduced} selected={selected} onSelect={setSelectedId} isMobile={isMobile} />

        {/* 复位点击层：仅选中时渲染，避免空覆盖层拦截触摸 */}
        {selected && (
          <button type="button" aria-label={t.reset} onClick={reset} className="absolute inset-0 z-20 cursor-zoom-out" />
        )}
      </div>

      {/* 控制条 */}
      <div className="mt-5 flex items-center justify-center gap-3 min-h-[2.25rem]">
        {selected ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-mid shadow-[0_4px_14px_var(--c-shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_var(--c-shadow-strong)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t.reset}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={flip}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-on-ink shadow-[0_6px_20px_var(--c-shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_var(--c-shadow-strong)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3M21 3v6h-6" />
                <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3M3 21v-6h6" />
              </svg>
              {flipped ? t.viewFront : t.viewBack}
            </button>
            <span className="text-xs text-text-soft">{t.hint}</span>
          </>
        )}
      </div>

      {/* 标注卡：key 绑定肌群 id，切换时重新入场 */}
      {selected && <MuscleCard key={selected.id} muscle={selected} lang={lang} reduced={reduced} />}
    </div>
  );
}

// ── 功能行（文字 + 视觉，左右交替） ──────────────────────────────

function FeatureRow({ reverse, lang }: { reverse: boolean; lang: Lang }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const reduced = prefersReducedMotion();

  const rise = (i: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(20px)",
    transition: reduced
      ? "none"
      : `opacity var(--dur-slow) var(--ease-out-soft) ${i * 90}ms, transform var(--dur-slow) var(--ease-out-soft) ${i * 90}ms`,
  });

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* 文字侧 */}
      <div className={reverse ? "lg:order-2" : ""}>
        <div style={rise(0)} className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent-deep mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {FEATURE.eyebrow[lang]}
        </div>
        <h3 style={rise(1)} className="text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.12] text-text mb-4">
          {FEATURE.title[lang]}
        </h3>
        <p style={rise(2)} className="text-base text-text-muted leading-relaxed max-w-[42ch] mb-7">
          {FEATURE.desc[lang]}
        </p>
        <ul className="flex flex-col gap-3.5">
          {FEATURE.points.map((pt, i) => (
            <li key={i} style={rise(3 + i)} className="flex items-start gap-3 text-sm text-text-mid leading-relaxed">
              <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-deep)" strokeWidth="2.2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {pt[lang]}
            </li>
          ))}
        </ul>
      </div>

      {/* 视觉侧 */}
      <div className={reverse ? "lg:order-1" : ""}>
        <InteractiveBody inView={inView} lang={lang} />
      </div>
    </div>
  );
}

// ── 版块 ─────────────────────────────────────────────────────────

export default function FeatureShowcase() {
  const { locale } = useLocale();
  const lang: Lang = locale === "en" ? "en" : "zh";
  const c = SECTION[lang];

  return (
    <section className="bg-bg py-24 md:py-32 px-6 md:px-15" id="features">
      <div className="max-w-[1180px] mx-auto">
        <div className="max-w-[48ch] mb-16 md:mb-24">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent-deep mb-4">
            {c.eyebrow}
          </span>
          <h2 className="text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.1] mb-4">{c.title}</h2>
          <p className="text-base text-text-muted leading-relaxed">{c.desc}</p>
        </div>

        <FeatureRow reverse={false} lang={lang} />
      </div>
    </section>
  );
}
