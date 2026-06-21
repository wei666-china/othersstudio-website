import Link from "next/link";
import { listApiKeys } from "./actions";
import { KeyList } from "./components/key-list";
import { CreateKeyForm } from "./components/create-key-form";

export const metadata = {
  title: "DAY 1 — Developer",
  description: "让你的 AI Agent 读懂你的身体。生成 API Key，接入你的健康数据。",
};

const SKILL_RAW_URL =
  "https://raw.githubusercontent.com/wei666-china/day1-health-skill/main/SKILL.md";

const CAPABILITIES = [
  {
    endpoint: "health-snapshot",
    title: "健康总览",
    desc: "一次调用返回训练、营养、身体、恢复、睡眠、HRV 的窗口摘要。",
    icon: "M9 19V6l12-3v13M9 19c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zm12-3c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2z",
  },
  {
    endpoint: "workouts",
    title: "训练明细",
    desc: "逐次训练 + 每个动作的组数、重量、次数，看清你的渐进负荷。",
    icon: "M6.5 6.5h11M6.5 17.5h11M4 9v6M20 9v6M2 10.5v3M22 10.5v3",
  },
  {
    endpoint: "nutrition",
    title: "营养明细",
    desc: "逐日热量与三大营养素，对比目标，算出你的达标率。",
    icon: "M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z M12 6v6",
  },
  {
    endpoint: "body",
    title: "身体趋势",
    desc: "体重 / 体脂时间序列 + 你的目标计划进度。",
    icon: "M3 17l6-6 4 4 8-8M21 7v6h-6",
  },
  {
    endpoint: "recovery",
    title: "恢复状态",
    desc: "每日精力、酸痛、压力、HRV 与训练前后回顾——AI 判断你今天该不该练。",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
  },
  {
    endpoint: "insights",
    title: "衍生洞察",
    desc: "训练频率、容量趋势、连续训练周数 streak。",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
];

export default async function DeveloperPage() {
  const keys = await listApiKeys();
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
            Day 1 · Developer Platform
          </span>
          <h1
            className="font-sans font-bold text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.2] tracking-tight mb-5"
            style={{ color: "#FFFFFF", fontFamily: "var(--font-inter), sans-serif" }}
          >
            让你的 AI<br className="hidden sm:block" /> 读懂你的身体
          </h1>
          <p className="text-[15px] sm:text-base text-[#F0E8DF] leading-relaxed mb-4">
            我们生活在 AI 时代，而 Day 1 本身就是 AI 时代的原生产物。我们不愿做一个守旧、停滞、被当成「傻瓜
            App」就停止生长的应用。
          </p>
          <p className="text-[15px] sm:text-base text-[#F0E8DF] leading-relaxed">
            健康，应当像 AI 一样被持续追踪、被真正理解、被不断进化。我们把你的身体数据开放给你自己的 AI
            Agent——让它比任何人都更了解你。这是我们一直在做的事。
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-8">
            <a
              href="#create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FAF6F1] text-[#3D2B1F] text-sm font-semibold no-underline hover:bg-white hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.18)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              生成 API Key
            </a>
            <Link
              href="/me/developer/docs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#C9A88C]/40 text-[#E8DDD3] text-sm font-medium no-underline hover:border-[#C9A88C] hover:bg-white/5 transition-all"
            >
              查看 API 文档
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── 能力一览 ───────── */}
      <section className="mb-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#3D2B1F]">你的 Agent 能读到什么</h2>
            <p className="text-sm text-[#6B4E3D] mt-0.5">6 个端点，覆盖从总览到逐组训练的私教级数据</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAPABILITIES.map((c) => (
            <div
              key={c.endpoint}
              className="group bg-white rounded-2xl border border-[#C9A88C]/15 p-5 hover:border-[#C9A88C]/40 hover:shadow-[0_6px_24px_rgba(61,43,31,0.07)] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F3EDE6] flex items-center justify-center mb-3 group-hover:bg-[#3D2B1F] transition-colors">
                <svg
                  className="w-5 h-5 text-[#5C3D2E] group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={c.icon} />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[#3D2B1F] mb-1">{c.title}</h3>
              <p className="text-xs text-[#6B4E3D] leading-relaxed mb-2.5">{c.desc}</p>
              <code className="text-[11px] font-mono text-[#A08060] bg-[#FAF6F1] px-2 py-0.5 rounded-md">
                /{c.endpoint}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 快速开始 ───────── */}
      <div className="bg-[#F3EDE6] rounded-2xl border border-[#C9A88C]/25 p-5 sm:p-6 mb-6">
        <h3 className="text-sm font-semibold text-[#3D2B1F] mb-3">三步接入</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <StepCard step="1" title="生成 Key" desc="在下方创建一个专属 API Key" />
          <StepCard step="2" title="安装 Skill" desc="下载 Day 1 Health Skill 到你的 AI 工具" />
          <StepCard step="3" title="配置环境变量" desc="设置 DAY1_API_KEY=你的Key" />
        </div>
        <div className="mt-4 pt-4 border-t border-[#C9A88C]/25 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href="/me/developer/docs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5C3D2E] hover:underline"
          >
            查看完整文档
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href={SKILL_RAW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5C3D2E] hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载 Skill 文件
          </a>
        </div>
      </div>

      {/* ───────── 创建 Key ───────── */}
      <div id="create" className="scroll-mt-6">
        <CreateKeyForm activeCount={activeKeys.length} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#3D2B1F] mb-4">
          活跃 Keys
          {activeKeys.length > 0 && (
            <span className="ml-2 text-sm font-normal text-[#6B4E3D]">
              ({activeKeys.length}/5)
            </span>
          )}
        </h2>
        {activeKeys.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#C9A88C]/15 px-5 py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FAF6F1] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#A08060]"
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
            <p className="text-sm text-[#6B4E3D]">
              还没有 API Key，在上方创建一个开始使用
            </p>
          </div>
        ) : (
          <KeyList keys={activeKeys} />
        )}
      </div>

      {revokedKeys.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-[#6B4E3D] mb-3">
            已撤销 ({revokedKeys.length})
          </h2>
          <div className="bg-white rounded-2xl border border-[#C9A88C]/15 overflow-hidden opacity-60">
            <div className="divide-y divide-[#C9A88C]/10">
              {revokedKeys.map((k) => (
                <div
                  key={k.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-[#6B4E3D] line-through">
                      {k.name}
                    </p>
                    <p className="text-xs text-[#A08060] font-mono mt-0.5">
                      {k.key_prefix}••••••••
                    </p>
                  </div>
                  <span className="text-xs text-red-400 bg-red-50 px-2 py-0.5 rounded-full">
                    已撤销
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
      <div className="shrink-0 w-6 h-6 rounded-full bg-[#5C3D2E] text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {step}
      </div>
      <div>
        <p className="text-sm font-medium text-[#3D2B1F]">{title}</p>
        <p className="text-xs text-[#6B4E3D] mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
