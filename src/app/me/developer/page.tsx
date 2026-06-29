import Link from "next/link";
import { listApiKeys } from "./actions";
import { KeyList } from "./components/key-list";
import { CreateKeyForm } from "./components/create-key-form";
import { getLocale } from "@/i18n/server";

export const metadata = {
  title: "DAY 1 — Developer",
  description: "让你的 AI Agent 读懂你的身体。生成 API Key，接入你的健康数据。",
};

const SKILL_RAW_URL =
  "https://raw.githubusercontent.com/wei666-china/day1-health-skill/main/SKILL.md";

// 能力卡片：每个端点中英双语
const CAPABILITIES = [
  {
    endpoint: "health-snapshot",
    title: { zh: "健康总览", en: "Health snapshot" },
    desc: {
      zh: "一次调用返回训练、营养、身体、恢复、睡眠、HRV 的窗口摘要。",
      en: "One call returns a window summary of training, nutrition, body, recovery, sleep and HRV.",
    },
    icon: "M9 19V6l12-3v13M9 19c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zm12-3c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2z",
  },
  {
    endpoint: "workouts",
    title: { zh: "训练明细", en: "Workout details" },
    desc: {
      zh: "逐次训练 + 每个动作的组数、重量、次数，看清你的渐进负荷。",
      en: "Per-session workouts with sets, weight and reps for every exercise — see your progressive overload.",
    },
    icon: "M6.5 6.5h11M6.5 17.5h11M4 9v6M20 9v6M2 10.5v3M22 10.5v3",
  },
  {
    endpoint: "nutrition",
    title: { zh: "营养明细", en: "Nutrition details" },
    desc: {
      zh: "逐日热量与三大营养素，对比目标，算出你的达标率。",
      en: "Daily calories and macros versus your targets, with goal-completion rates.",
    },
    icon: "M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z M12 6v6",
  },
  {
    endpoint: "body",
    title: { zh: "身体趋势", en: "Body trends" },
    desc: {
      zh: "体重 / 体脂时间序列 + 你的目标计划进度。",
      en: "Weight / body-fat time series plus progress toward your goal plan.",
    },
    icon: "M3 17l6-6 4 4 8-8M21 7v6h-6",
  },
  {
    endpoint: "recovery",
    title: { zh: "恢复状态", en: "Recovery status" },
    desc: {
      zh: "每日精力、酸痛、压力、HRV 与训练前后回顾——AI 判断你今天该不该练。",
      en: "Daily energy, soreness, stress, HRV and pre/post-training reviews — so AI can judge whether you should train today.",
    },
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
  },
  {
    endpoint: "insights",
    title: { zh: "衍生洞察", en: "Derived insights" },
    desc: {
      zh: "训练频率、容量趋势、连续训练周数 streak。",
      en: "Training frequency, volume trends and your weekly training streak.",
    },
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
];

// 页面其余写死文案的中英对照（开发者门户专用，不进全局门面字典）
const COPY = {
  zh: {
    badge: "Day 1 · Developer Platform",
    heroTitle1: "让你的 AI",
    heroTitle2: "读懂你的身体",
    heroP1:
      "我们生活在 AI 时代，而 Day 1 本身就是 AI 时代的原生产物。我们不愿做一个守旧、停滞、被当成「傻瓜 App」就停止生长的应用。",
    heroP2:
      "健康，应当像 AI 一样被持续追踪、被真正理解、被不断进化。我们把你的身体数据开放给你自己的 AI Agent——让它比任何人都更了解你。这是我们一直在做的事。",
    btnCreate: "生成 API Key",
    btnDocs: "查看 API 文档",
    capTitle: "你的 Agent 能读到什么",
    capSubtitle: "6 个端点，覆盖从总览到逐组训练的私教级数据",
    quickStart: "三步接入",
    step1Title: "生成 Key",
    step1Desc: "在下方创建一个专属 API Key",
    step2Title: "安装 Skill",
    step2Desc: "下载 Day 1 Health Skill 到你的 AI 工具",
    step3Title: "配置环境变量",
    step3Desc: "设置 DAY1_API_KEY=你的Key",
    fullDocs: "查看完整文档",
    downloadSkill: "下载 Skill 文件",
    activeKeys: "活跃 Keys",
    emptyKeys: "还没有 API Key，在上方创建一个开始使用",
    revoked: "已撤销",
    revokedTag: "已撤销",
  },
  en: {
    badge: "Day 1 · Developer Platform",
    heroTitle1: "Let your AI",
    heroTitle2: "understand your body",
    heroP1:
      "We live in the age of AI, and Day 1 is a native product of that age. We refuse to be a stagnant, conventional app that stops growing the moment it's treated as a “dumb app.”",
    heroP2:
      "Health should be continuously tracked, truly understood and constantly evolved — just like AI. We open your body data to your own AI agent, so it can understand you better than anyone. That's what we've always been building.",
    btnCreate: "Generate API Key",
    btnDocs: "View API docs",
    capTitle: "What your agent can read",
    capSubtitle: "6 endpoints covering everything from overview to set-by-set training data",
    quickStart: "Get started in 3 steps",
    step1Title: "Generate a key",
    step1Desc: "Create a dedicated API key below",
    step2Title: "Install the Skill",
    step2Desc: "Download the Day 1 Health Skill into your AI tool",
    step3Title: "Set the env variable",
    step3Desc: "Set DAY1_API_KEY=your-key",
    fullDocs: "View full docs",
    downloadSkill: "Download Skill file",
    activeKeys: "Active keys",
    emptyKeys: "No API key yet — create one above to get started",
    revoked: "Revoked",
    revokedTag: "Revoked",
  },
};

export default async function DeveloperPage() {
  const [keys, locale] = await Promise.all([listApiKeys(), getLocale()]);
  const isEn = locale === "en";
  const c = isEn ? COPY.en : COPY.zh;
  const activeKeys = keys.filter((k) => k.is_active);
  const revokedKeys = keys.filter((k) => !k.is_active);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* ───────── 理念 Hero ───────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2A1D14] via-[#3D2B1F] to-[#5C3D2E] px-6 sm:px-10 py-10 sm:py-14 mb-8">
        <div className="absolute -top-28 -right-20 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(201,168,140,0.22)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(232,221,211,0.10)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[3px] uppercase text-[#C9A88C] mb-5">
            <span className="w-6 h-px bg-[#C9A88C]/60" />
            {c.badge}
          </span>
          <h1
            className="font-sans font-bold text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.2] tracking-tight mb-5"
            style={{ color: "#FFFFFF", fontFamily: "var(--font-inter), sans-serif" }}
          >
            {c.heroTitle1}
            <br className="hidden sm:block" /> {c.heroTitle2}
          </h1>
          <p className="text-[15px] sm:text-base text-[#F0E8DF] leading-relaxed mb-4">
            {c.heroP1}
          </p>
          <p className="text-[15px] sm:text-base text-[#F0E8DF] leading-relaxed">
            {c.heroP2}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-8">
            <a
              href="#create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FAF6F1] text-[#3D2B1F] text-sm font-semibold no-underline hover:bg-white hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.18)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {c.btnCreate}
            </a>
            <Link
              href="/me/developer/docs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#C9A88C]/40 text-[#E8DDD3] text-sm font-medium no-underline hover:border-[#C9A88C] hover:bg-white/5 transition-all"
            >
              {c.btnDocs}
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── 能力一览 ───────── */}
      <section className="mb-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text">{c.capTitle}</h2>
            <p className="text-sm text-text-mid mt-0.5">{c.capSubtitle}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.endpoint}
              className="group bg-surface rounded-2xl border border-border p-5 hover:border-border-strong hover:shadow-[0_6px_24px_var(--c-shadow)] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center mb-3 group-hover:bg-ink transition-colors">
                <svg
                  className="w-5 h-5 text-warm group-hover:text-on-ink transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={cap.icon} />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text mb-1">{isEn ? cap.title.en : cap.title.zh}</h3>
              <p className="text-xs text-text-mid leading-relaxed mb-2.5">{isEn ? cap.desc.en : cap.desc.zh}</p>
              <code className="text-[11px] font-mono text-text-muted bg-bg px-2 py-0.5 rounded-md">
                /{cap.endpoint}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 快速开始 ───────── */}
      <div className="bg-surface-2 rounded-2xl border border-border-strong p-5 sm:p-6 mb-6">
        <h3 className="text-sm font-semibold text-text mb-3">{c.quickStart}</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <StepCard step="1" title={c.step1Title} desc={c.step1Desc} />
          <StepCard step="2" title={c.step2Title} desc={c.step2Desc} />
          <StepCard step="3" title={c.step3Title} desc={c.step3Desc} />
        </div>
        <div className="mt-4 pt-4 border-t border-border-strong flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href="/me/developer/docs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-warm hover:underline"
          >
            {c.fullDocs}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href={SKILL_RAW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-warm hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {c.downloadSkill}
          </a>
        </div>
      </div>

      {/* ───────── 创建 Key ───────── */}
      <div id="create" className="scroll-mt-6">
        <CreateKeyForm activeCount={activeKeys.length} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text mb-4">
          {c.activeKeys}
          {activeKeys.length > 0 && (
            <span className="ml-2 text-sm font-normal text-text-mid">
              ({activeKeys.length}/5)
            </span>
          )}
        </h2>
        {activeKeys.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border px-5 py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-bg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <p className="text-sm text-text-mid">
              {c.emptyKeys}
            </p>
          </div>
        ) : (
          <KeyList keys={activeKeys} />
        )}
      </div>

      {revokedKeys.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-text-mid mb-3">
            {c.revoked} ({revokedKeys.length})
          </h2>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden opacity-60">
            <div className="divide-y divide-border">
              {revokedKeys.map((k) => (
                <div
                  key={k.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-text-mid line-through">
                      {k.name}
                    </p>
                    <p className="text-xs text-text-muted font-mono mt-0.5">
                      {k.key_prefix}••••••••
                    </p>
                  </div>
                  <span className="text-xs text-red-400 bg-red-50 px-2 py-0.5 rounded-full">
                    {c.revokedTag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-warm text-on-ink text-xs font-bold flex items-center justify-center mt-0.5">
        {step}
      </div>
      <div>
        <p className="text-sm font-medium text-text">{title}</p>
        <p className="text-xs text-text-mid mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
