import Link from "next/link";

export const metadata = {
  title: "DAY 1 — API 文档",
  description: "Day 1 Health API 完整使用指南",
};

const SKILL_REPO_URL = "https://github.com/wei666-china/day1-health-skill";
const SKILL_RAW_URL =
  "https://raw.githubusercontent.com/wei666-china/day1-health-skill/main/SKILL.md";
const GUIDE_BASE =
  "https://github.com/wei666-china/day1-health-skill/blob/main/examples";

const AGENT_GUIDES = [
  {
    name: "Cursor",
    desc: ".cursor/skills/ 目录 + 环境变量",
    file: "cursor-setup.md",
  },
  {
    name: "Claude Code",
    desc: "CLAUDE.md / .claude/skills/ 接入",
    file: "claude-code-setup.md",
  },
  {
    name: "Codex CLI",
    desc: "AGENTS.md + 环境变量接入",
    file: "codex-setup.md",
  },
  {
    name: "openclaw",
    desc: "skill 目录 + 环境变量",
    file: "openclaw-setup.md",
  },
  {
    name: "其他 Agent",
    desc: "任何能发 HTTP 的 Agent 通用接入",
    file: "generic-agent-setup.md",
  },
];

export default function DocsPage() {
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
        <span className="text-[#3D2B1F]">API 文档</span>
      </div>

      <h1 className="text-2xl font-semibold text-[#3D2B1F] mb-2">
        Day 1 Health API
      </h1>
      <p className="text-sm text-[#6B4E3D] mb-8">
        让你的 AI Agent 安全地获取你的结构化健康数据
      </p>

      <Section title="端点">
        <p className="text-sm text-[#6B4E3D] mb-3">
          总览端点（一次返回所有维度的摘要，最常用）：
        </p>
        <CodeBlock>
          {`GET https://ywliqhbjyiydlnahvwal.supabase.co/functions/v1/health-snapshot`}
        </CodeBlock>
      </Section>

      <Section title="私教级端点">
        <p className="text-sm text-[#6B4E3D] mb-3">
          当需要逐组、逐日的深入分析时，调用以下细分端点。它们与总览端点共用同一鉴权方式、配额和{" "}
          <code className="font-mono text-xs">{`{ status, data, meta }`}</code>{" "}
          响应结构。
        </p>
        <div className="bg-white rounded-xl border border-[#C9A88C]/15 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#C9A88C]/10 text-left">
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">端点</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">用途</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">参数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A88C]/10 text-[#6B4E3D]">
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-[#5C3D2E]">/workouts</td>
                <td className="px-4 py-3">每次训练 + 逐动作组数/重量/次数</td>
                <td className="px-4 py-3 font-mono text-[11px]">days(1-90,默认30) limit(1-50,默认20)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-[#5C3D2E]">/nutrition</td>
                <td className="px-4 py-3">逐日营养 + 目标对比 + 达标率</td>
                <td className="px-4 py-3 font-mono text-[11px]">days(1-60,默认14)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-[#5C3D2E]">/body</td>
                <td className="px-4 py-3">体重/体脂时间序列 + 目标计划</td>
                <td className="px-4 py-3 font-mono text-[11px]">days(1-365,默认90)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-[#5C3D2E]">/recovery</td>
                <td className="px-4 py-3">每日状态、午间签到、训练前后回顾</td>
                <td className="px-4 py-3 font-mono text-[11px]">days(1-60,默认14)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-[#5C3D2E]">/insights</td>
                <td className="px-4 py-3">训练频率、容量趋势、连续训练周数 streak</td>
                <td className="px-4 py-3 font-mono text-[11px]">无</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <CodeBlock language="bash">
            {`# 训练明细（近30天，最多20次）
curl "https://ywliqhbjyiydlnahvwal.supabase.co/functions/v1/workouts?days=30&limit=20" \\
  -H "Authorization: Bearer d1_sk_你的key"

# 营养明细（近14天）
curl "https://ywliqhbjyiydlnahvwal.supabase.co/functions/v1/nutrition?days=14" \\
  -H "Authorization: Bearer d1_sk_你的key"`}
          </CodeBlock>
        </div>
        <div className="mt-3 p-3 rounded-xl bg-[#FBF3EC] border border-[#C9A88C]/30">
          <p className="text-xs text-[#6B4E3D] leading-relaxed">
            <span className="font-semibold text-[#3D2B1F]">口径说明：</span>{" "}
            总览端点返回的是「窗口内平均值 / 全历史最新值」，明细端点返回的是「时间序列 / 逐日原始记录」，且两者默认天数不同（总览 7 天，明细 14–90 天）。
            因此明细端点某一天的数值与总览的平均值不一致是正常的，不是矛盾。
            <code className="font-mono text-[11px] mx-1">/insights</code> 额外提供{" "}
            <code className="font-mono text-[11px]">consecutive_week_streak</code>（连续训练周数，以最近一次训练所在周为锚点，本周未训练不会清零）。
          </p>
        </div>
      </Section>

      <Section title="认证方式">
        <p className="text-sm text-[#6B4E3D] mb-3">
          在请求头中使用 Bearer Token：
        </p>
        <CodeBlock>
          {`Authorization: Bearer d1_sk_your_api_key_here`}
        </CodeBlock>
        <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-100">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">安全提示：</span> API Key
            仅能访问你自己的数据，无法获取其他用户的信息。Key 使用 SHA-256
            单向哈希存储，即使数据库泄露也无法反推出你的 Key。
          </p>
        </div>
      </Section>

      <Section title="查询参数（health-snapshot）">
        <div className="bg-white rounded-xl border border-[#C9A88C]/15 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#C9A88C]/10 text-left">
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">参数</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">类型</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">默认</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A88C]/10">
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-[#5C3D2E]">
                  days
                </td>
                <td className="px-4 py-3 text-[#6B4E3D]">integer</td>
                <td className="px-4 py-3 text-[#6B4E3D]">7</td>
                <td className="px-4 py-3 text-[#6B4E3D]">回溯天数 (1-30)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#6B4E3D] mt-2">
          私教级端点（/workouts、/nutrition 等）的参数见上方「私教级端点」表格。
        </p>
      </Section>

      <Section title="响应示例">
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

      <Section title="错误码">
        <div className="bg-white rounded-xl border border-[#C9A88C]/15 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#C9A88C]/10 text-left">
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">HTTP</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">错误码</th>
                <th className="px-4 py-3 font-medium text-[#3D2B1F]">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A88C]/10 text-[#6B4E3D]">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">401</td>
                <td className="px-4 py-3 font-mono text-xs">
                  missing_or_invalid_key
                </td>
                <td className="px-4 py-3">缺少 Authorization header 或格式错误</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">401</td>
                <td className="px-4 py-3 font-mono text-xs">key_not_found</td>
                <td className="px-4 py-3">Key 不存在或已被撤销</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">401</td>
                <td className="px-4 py-3 font-mono text-xs">key_expired</td>
                <td className="px-4 py-3">Key 已过期</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">429</td>
                <td className="px-4 py-3 font-mono text-xs">
                  monthly_limit_exceeded
                </td>
                <td className="px-4 py-3">本月配额已用完 (1000 次/月)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">405</td>
                <td className="px-4 py-3 font-mono text-xs">
                  method_not_allowed
                </td>
                <td className="px-4 py-3">仅支持 GET 请求</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">500</td>
                <td className="px-4 py-3 font-mono text-xs">internal_error</td>
                <td className="px-4 py-3">服务器内部错误</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="配额限制">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#C9A88C]/15 p-4">
            <p className="text-xs text-[#6B4E3D] mb-1">月请求上限</p>
            <p className="text-xl font-semibold text-[#3D2B1F]">1,000 次</p>
          </div>
          <div className="bg-white rounded-xl border border-[#C9A88C]/15 p-4">
            <p className="text-xs text-[#6B4E3D] mb-1">最大活跃 Key</p>
            <p className="text-xl font-semibold text-[#3D2B1F]">5 个</p>
          </div>
        </div>
      </Section>

      <Section title="AI Skill 安装">
        <div className="bg-white rounded-xl border border-[#C9A88C]/15 p-5 mb-4">
          <h4 className="text-sm font-semibold text-[#3D2B1F] mb-1">
            获取 Skill 文件
          </h4>
          <p className="text-xs text-[#6B4E3D] mb-4">
            Skill 托管在 GitHub。你可以直接下载文件，或把 raw 链接喂给 AI，让它自动读取。
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
              下载 SKILL.md
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
              在 GitHub 查看
            </a>
          </div>
          <div className="mt-4 pt-4 border-t border-[#C9A88C]/15">
            <p className="text-xs text-[#6B4E3D] mb-1.5">给 AI 用的 raw 链接（直接读取）：</p>
            <code className="block bg-[#FAF6F1] border border-[#C9A88C]/20 rounded-lg px-3 py-2 text-[11px] font-mono text-[#3D2B1F] break-all select-all">
              {SKILL_RAW_URL}
            </code>
          </div>
        </div>
        <p className="text-xs text-[#6B4E3D] mb-3">
          按你使用的 Agent 选择对应的接入指南。所有指南都托管在 GitHub，点击即可查看分步说明：
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
                <p className="text-sm font-semibold text-[#3D2B1F]">{g.name}</p>
                <p className="text-xs text-[#6B4E3D] mt-0.5 truncate">{g.desc}</p>
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

      <Section title="cURL 测试">
        <CodeBlock language="bash">
          {`curl -s "https://ywliqhbjyiydlnahvwal.supabase.co/functions/v1/health-snapshot?days=7" \\
  -H "Authorization: Bearer d1_sk_你的key" | python3 -m json.tool`}
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
          返回 Key 管理
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
