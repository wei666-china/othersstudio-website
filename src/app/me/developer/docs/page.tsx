import Link from "next/link";
import { getLocale } from "@/i18n/server";

export const metadata = {
  title: "DAY 1 — API 文档",
  description: "Day 1 Health API 完整使用指南",
};

const SKILL_REPO_URL = "https://github.com/wei666-china/day1-health-skill";
const SKILL_RAW_URL =
  "https://raw.githubusercontent.com/wei666-china/day1-health-skill/main/SKILL.md";
const GUIDE_BASE =
  "https://github.com/wei666-china/day1-health-skill/blob/main/examples";

// 接入指南卡片：工具名保留原样，描述双语
const AGENT_GUIDES = [
  {
    name: "Cursor",
    desc: { zh: ".cursor/skills/ 目录 + 环境变量", en: ".cursor/skills/ folder + env variable" },
    file: "cursor-setup.md",
  },
  {
    name: "Claude Code",
    desc: { zh: "CLAUDE.md / .claude/skills/ 接入", en: "CLAUDE.md / .claude/skills/ setup" },
    file: "claude-code-setup.md",
  },
  {
    name: "Codex CLI",
    desc: { zh: "AGENTS.md + 环境变量接入", en: "AGENTS.md + env variable setup" },
    file: "codex-setup.md",
  },
  {
    name: "openclaw",
    desc: { zh: "skill 目录 + 环境变量", en: "skill folder + env variable" },
    file: "openclaw-setup.md",
  },
  {
    name: { zh: "其他 Agent", en: "Other agents" },
    desc: { zh: "任何能发 HTTP 的 Agent 通用接入", en: "Generic setup for any agent that can send HTTP" },
    file: "generic-agent-setup.md",
  },
];

// 端点表格行：用途双语，端点名/参数为技术内容不翻
const ENDPOINT_ROWS = [
  {
    path: "/workouts",
    use: { zh: "每次训练 + 逐动作组数/重量/次数", en: "Each session + sets/weight/reps per exercise" },
    params: "days(1-90,默认30) limit(1-50,默认20)",
    paramsEn: "days(1-90, default 30) limit(1-50, default 20)",
  },
  {
    path: "/nutrition",
    use: { zh: "逐日营养 + 目标对比 + 达标率", en: "Daily nutrition + target comparison + completion rate" },
    params: "days(1-60,默认14)",
    paramsEn: "days(1-60, default 14)",
  },
  {
    path: "/body",
    use: { zh: "体重/体脂时间序列 + 目标计划", en: "Weight/body-fat time series + goal plan" },
    params: "days(1-365,默认90)",
    paramsEn: "days(1-365, default 90)",
  },
  {
    path: "/recovery",
    use: { zh: "每日状态、午间签到、训练前后回顾", en: "Daily status, midday check-in, pre/post-training reviews" },
    params: "days(1-60,默认14)",
    paramsEn: "days(1-60, default 14)",
  },
  {
    path: "/insights",
    use: { zh: "训练频率、容量趋势、连续训练周数 streak", en: "Training frequency, volume trends, weekly training streak" },
    params: "无",
    paramsEn: "none",
  },
];

// 错误码表格：错误码/HTTP 不翻，说明双语
const ERROR_ROWS = [
  { http: "401", code: "missing_or_invalid_key", desc: { zh: "缺少 Authorization header 或格式错误", en: "Missing Authorization header or malformed" } },
  { http: "401", code: "key_not_found", desc: { zh: "Key 不存在或已被撤销", en: "Key doesn't exist or has been revoked" } },
  { http: "401", code: "key_expired", desc: { zh: "Key 已过期", en: "Key has expired" } },
  { http: "429", code: "monthly_limit_exceeded", desc: { zh: "本月配额已用完 (1000 次/月)", en: "Monthly quota used up (1,000 / month)" } },
  { http: "405", code: "method_not_allowed", desc: { zh: "仅支持 GET 请求", en: "Only GET requests are supported" } },
  { http: "500", code: "internal_error", desc: { zh: "服务器内部错误", en: "Internal server error" } },
];

const COPY = {
  zh: {
    crumbDocs: "API 文档",
    subtitle: "让你的 AI Agent 安全地获取你的结构化健康数据",
    secEndpoints: "端点",
    overviewNote: "总览端点（一次返回所有维度的摘要，最常用）：",
    secCoachEndpoints: "私教级端点",
    coachIntro1: "当需要逐组、逐日的深入分析时，调用以下细分端点。它们与总览端点共用同一鉴权方式、配额和",
    coachIntro2: "响应结构。",
    thEndpoint: "端点",
    thUse: "用途",
    thParams: "参数",
    coachComment1: "# 训练明细（近30天，最多20次）",
    coachComment2: "# 营养明细（近14天）",
    calibTitle: "口径说明：",
    calibBody:
      "总览端点返回的是「窗口内平均值 / 全历史最新值」，明细端点返回的是「时间序列 / 逐日原始记录」，且两者默认天数不同（总览 7 天，明细 14–90 天）。因此明细端点某一天的数值与总览的平均值不一致是正常的，不是矛盾。",
    calibInsights1: "额外提供",
    calibInsights2: "（连续训练周数，以最近一次训练所在周为锚点，本周未训练不会清零）。",
    secAuth: "认证方式",
    authNote: "在请求头中使用 Bearer Token：",
    authSafetyTitle: "安全提示：",
    authSafetyBody:
      "API Key 仅能访问你自己的数据，无法获取其他用户的信息。Key 使用 SHA-256 单向哈希存储，即使数据库泄露也无法反推出你的 Key。",
    secQuery: "查询参数（health-snapshot）",
    thType: "类型",
    thDefault: "默认",
    thDesc: "说明",
    daysDesc: "回溯天数 (1-30)",
    queryNote: "私教级端点（/workouts、/nutrition 等）的参数见上方「私教级端点」表格。",
    secResponse: "响应示例",
    secErrors: "错误码",
    thError: "错误码",
    secQuota: "配额限制",
    quotaMonthly: "月请求上限",
    quotaMonthlyVal: "1,000 次",
    quotaKeys: "最大活跃 Key",
    quotaKeysVal: "5 个",
    secSkill: "AI Skill 安装",
    getSkillTitle: "获取 Skill 文件",
    getSkillNote: "Skill 托管在 GitHub。你可以直接下载文件，或把 raw 链接喂给 AI，让它自动读取。",
    downloadSkill: "下载 SKILL.md",
    viewOnGithub: "在 GitHub 查看",
    rawLinkNote: "给 AI 用的 raw 链接（直接读取）：",
    guidesNote: "按你使用的 Agent 选择对应的接入指南。所有指南都托管在 GitHub，点击即可查看分步说明：",
    secCurl: "cURL 测试",
    backToKeys: "返回 Key 管理",
  },
  en: {
    crumbDocs: "API docs",
    subtitle: "Let your AI agent securely access your structured health data",
    secEndpoints: "Endpoints",
    overviewNote: "Overview endpoint (returns a summary of all dimensions in one call — the most common):",
    secCoachEndpoints: "Coach-level endpoints",
    coachIntro1: "When you need set-by-set or day-by-day analysis, call the endpoints below. They share the same auth, quota and",
    coachIntro2: "response structure as the overview endpoint.",
    thEndpoint: "Endpoint",
    thUse: "Purpose",
    thParams: "Parameters",
    coachComment1: "# Workout details (last 30 days, up to 20)",
    coachComment2: "# Nutrition details (last 14 days)",
    calibTitle: "About the numbers:",
    calibBody:
      "The overview endpoint returns “averages within the window / latest all-time values”, while detail endpoints return “time series / raw daily records”, and their default ranges differ (overview 7 days, details 14–90 days). So a single day's value from a detail endpoint differing from the overview's average is expected, not a contradiction.",
    calibInsights1: "additionally provides",
    calibInsights2: "(consecutive training weeks, anchored to the week of your most recent workout; not training this week won't reset it).",
    secAuth: "Authentication",
    authNote: "Use a Bearer token in the request header:",
    authSafetyTitle: "Security note:",
    authSafetyBody:
      "An API key can only access your own data, never other users'. Keys are stored as one-way SHA-256 hashes, so even a database leak can't reveal your key.",
    secQuery: "Query parameters (health-snapshot)",
    thType: "Type",
    thDefault: "Default",
    thDesc: "Description",
    daysDesc: "Days to look back (1-30)",
    queryNote: "For coach-level endpoints (/workouts, /nutrition, etc.), see the “Coach-level endpoints” table above.",
    secResponse: "Response example",
    secErrors: "Error codes",
    thError: "Error code",
    secQuota: "Rate limits",
    quotaMonthly: "Monthly request limit",
    quotaMonthlyVal: "1,000",
    quotaKeys: "Max active keys",
    quotaKeysVal: "5",
    secSkill: "AI Skill installation",
    getSkillTitle: "Get the Skill file",
    getSkillNote: "The Skill is hosted on GitHub. Download the file directly, or feed the raw link to your AI and let it read it automatically.",
    downloadSkill: "Download SKILL.md",
    viewOnGithub: "View on GitHub",
    rawLinkNote: "Raw link for your AI (reads directly):",
    guidesNote: "Pick the setup guide for the agent you use. All guides are hosted on GitHub — click to see step-by-step instructions:",
    secCurl: "cURL test",
    backToKeys: "Back to key management",
  },
};

export default async function DocsPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const c = isEn ? COPY.en : COPY.zh;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-xs text-[#6B4E3D] mb-6">
        <Link
          href="/me/developer"
          className="hover:text-[#5C3D2E] transition-colors"
        >
          Developer
        </Link>
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-[#3D2B1F]">{c.crumbDocs}</span>
      </div>

      <h1 className="text-2xl font-semibold text-[#3D2B1F] mb-2">
        Day 1 Health API
      </h1>
      <p className="text-sm text-[#6B4E3D] mb-8">
        {c.subtitle}
      </p>

      <Section title={c.secEndpoints}>
        <p className="text-sm text-[#6B4E3D] mb-3">
          {c.overviewNote}
        </p>
        <CodeBlock>
          {`GET https://ywliqhbjyiydlnahvwal.supabase.co/functions/v1/health-snapshot`}
        </CodeBlock>
      </Section>

      <Section title={c.secCoachEndpoints}>
        <p className="text-sm text-[#6B4E3D] mb-3">
          {c.coachIntro1}{" "}
          <code className="font-mono text-xs">{`{ status, data, meta }`}</code>{" "}
          {c.coachIntro2}
        </p>
        <div className="bg-white rounded-xl border border-[#C9A88C]/15 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#C9A88C]/10 text-left">
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">{c.thEndpoint}</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">{c.thUse}</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">{c.thParams}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A88C]/10 text-[#6B4E3D]">
              {ENDPOINT_ROWS.map((row) => (
                <tr key={row.path}>
                  <td className="px-4 py-3 font-mono text-xs text-[#5C3D2E]">{row.path}</td>
                  <td className="px-4 py-3">{isEn ? row.use.en : row.use.zh}</td>
                  <td className="px-4 py-3 font-mono text-[11px]">{isEn ? row.paramsEn : row.params}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <CodeBlock language="bash">
            {`${c.coachComment1}
curl "https://ywliqhbjyiydlnahvwal.supabase.co/functions/v1/workouts?days=30&limit=20" \\
  -H "Authorization: Bearer d1_sk_${isEn ? "your_key" : "你的key"}"

${c.coachComment2}
curl "https://ywliqhbjyiydlnahvwal.supabase.co/functions/v1/nutrition?days=14" \\
  -H "Authorization: Bearer d1_sk_${isEn ? "your_key" : "你的key"}"`}
          </CodeBlock>
        </div>
        <div className="mt-3 p-3 rounded-xl bg-[#FBF3EC] border border-[#C9A88C]/30">
          <p className="text-xs text-[#6B4E3D] leading-relaxed">
            <span className="font-semibold text-[#3D2B1F]">{c.calibTitle}</span>{" "}
            {c.calibBody}
            <code className="font-mono text-[11px] mx-1">/insights</code> {c.calibInsights1}{" "}
            <code className="font-mono text-[11px]">consecutive_week_streak</code>{c.calibInsights2}
          </p>
        </div>
      </Section>

      <Section title={c.secAuth}>
        <p className="text-sm text-[#6B4E3D] mb-3">
          {c.authNote}
        </p>
        <CodeBlock>
          {`Authorization: Bearer d1_sk_your_api_key_here`}
        </CodeBlock>
        <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-100">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">{c.authSafetyTitle}</span> {c.authSafetyBody}
          </p>
        </div>
      </Section>

      <Section title={c.secQuery}>
        <div className="bg-white rounded-xl border border-[#C9A88C]/15 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#C9A88C]/10 text-left">
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">{c.thParams}</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">{c.thType}</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">{c.thDefault}</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">{c.thDesc}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A88C]/10">
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-[#5C3D2E]">
                  days
                </td>
                <td className="px-4 py-3 text-[#6B4E3D]">integer</td>
                <td className="px-4 py-3 text-[#6B4E3D]">7</td>
                <td className="px-4 py-3 text-[#6B4E3D]">{c.daysDesc}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#6B4E3D] mt-2">
          {c.queryNote}
        </p>
      </Section>

      <Section title={c.secResponse}>
        <CodeBlock language="json">
          {`{
  "status": "ok",
  "data": {
    "snapshot_date": "2026-05-30",
    "days_range": 7,
    "profile": {
      "goal": "减脂期",
      "training_level": "资深老手",
      "days_per_week": 5,
      "weight_kg": 76,
      "height_cm": 176,
      "age": 19,
      "gender": "男"
    },
    "training": {
      "sessions_completed": 3,
      "avg_duration_min": 38,
      "total_calories": 1039,
      "avg_rpe": 0,
      "avg_heart_rate": 134
    },
    "nutrition": {
      "avg_daily_calories": null,
      "avg_protein_g": null,
      "days_logged": 0
    },
    "body": {
      "latest_weight_kg": 76,
      "weight_change_kg": 0,
      "latest_body_fat_pct": 16.6
    },
    "recovery": {
      "avg_energy": 4.7,
      "avg_soreness": 0,
      "avg_stress": 2,
      "days_reported": 3
    },
    "sleep": { "avg_duration_min": null, "days_tracked": 0 },
    "hrv": { "avg_hrv_ms": null, "days_tracked": 0 },
    "resting_heart_rate": { "avg_rhr": null, "days_tracked": 0 }
  },
  "meta": {
    "requests_remaining": 997,
    "days_queried": 7
  }
}`}
        </CodeBlock>
      </Section>

      <Section title={c.secErrors}>
        <div className="bg-white rounded-xl border border-[#C9A88C]/15 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#C9A88C]/10 text-left">
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">HTTP</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">{c.thError}</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">{c.thDesc}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A88C]/10 text-[#6B4E3D]">
              {ERROR_ROWS.map((row) => (
                <tr key={row.code}>
                  <td className="px-4 py-3 font-mono text-xs">{row.http}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.code}</td>
                  <td className="px-4 py-3">{isEn ? row.desc.en : row.desc.zh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={c.secQuota}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#C9A88C]/15 p-4">
            <p className="text-xs text-[#6B4E3D] mb-1">{c.quotaMonthly}</p>
            <p className="text-xl font-semibold text-[#3D2B1F]">{c.quotaMonthlyVal}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#C9A88C]/15 p-4">
            <p className="text-xs text-[#6B4E3D] mb-1">{c.quotaKeys}</p>
            <p className="text-xl font-semibold text-[#3D2B1F]">{c.quotaKeysVal}</p>
          </div>
        </div>
      </Section>

      <Section title={c.secSkill}>
        <div className="bg-white rounded-xl border border-[#C9A88C]/15 p-5 mb-4">
          <h4 className="text-sm font-semibold text-[#3D2B1F] mb-1">
            {c.getSkillTitle}
          </h4>
          <p className="text-xs text-[#6B4E3D] mb-4">
            {c.getSkillNote}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={SKILL_RAW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#3D2B1F] hover:bg-[#5C3D2E] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {c.downloadSkill}
            </a>
            <a
              href={SKILL_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#3D2B1F] border border-[#C9A88C]/30 hover:bg-[#FAF6F1] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85 0 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48A10.02 10.02 0 0022 12c0-5.52-4.48-10-10-10z" />
              </svg>
              {c.viewOnGithub}
            </a>
          </div>
          <div className="mt-4 pt-4 border-t border-[#C9A88C]/15">
            <p className="text-xs text-[#6B4E3D] mb-1.5">{c.rawLinkNote}</p>
            <code className="block bg-[#FAF6F1] border border-[#C9A88C]/20 rounded-lg px-3 py-2 text-[11px] font-mono text-[#3D2B1F] break-all select-all">
              {SKILL_RAW_URL}
            </code>
          </div>
        </div>
        <p className="text-xs text-[#6B4E3D] mb-3">
          {c.guidesNote}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {AGENT_GUIDES.map((g) => (
            <a
              key={g.file}
              href={`${GUIDE_BASE}/${g.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-white rounded-xl border border-[#C9A88C]/15 p-4 no-underline hover:border-[#C9A88C]/45 hover:shadow-[0_4px_18px_rgba(61,43,31,0.06)] transition-all"
            >
              <div className="shrink-0 w-9 h-9 rounded-lg bg-[#F3EDE6] flex items-center justify-center group-hover:bg-[#3D2B1F] transition-colors">
                <svg
                  className="w-4.5 h-4.5 text-[#5C3D2E] group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#3D2B1F]">
                  {typeof g.name === "string" ? g.name : isEn ? g.name.en : g.name.zh}
                </p>
                <p className="text-xs text-[#6B4E3D] mt-0.5 truncate">{isEn ? g.desc.en : g.desc.zh}</p>
              </div>
              <svg
                className="shrink-0 w-4 h-4 text-[#A08060] group-hover:text-[#3D2B1F] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </Section>

      <Section title={c.secCurl}>
        <CodeBlock language="bash">
          {`curl -s "https://ywliqhbjyiydlnahvwal.supabase.co/functions/v1/health-snapshot?days=7" \\
  -H "Authorization: Bearer d1_sk_${isEn ? "your_key" : "你的key"}" | python3 -m json.tool`}
        </CodeBlock>
      </Section>

      <div className="mt-12 pt-6 border-t border-[#C9A88C]/15">
        <Link
          href="/me/developer"
          className="inline-flex items-center gap-1.5 text-sm text-[#5C3D2E] hover:underline"
        >
          <svg
            className="w-3.5 h-3.5 rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {c.backToKeys}
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-[#3D2B1F] mb-3">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({
  children,
  language,
}: {
  children: string;
  language?: string;
}) {
  return (
    <div className="relative">
      {language && (
        <span className="absolute top-2 right-3 text-[10px] font-mono text-gray-400 uppercase">
          {language}
        </span>
      )}
      <pre className="bg-[#2A1D14] text-[#F3EDE6] rounded-xl p-4 overflow-x-auto text-xs leading-relaxed font-mono">
        <code>{children}</code>
      </pre>
    </div>
  );
}
