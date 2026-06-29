import { NextResponse } from "next/server";
import {
  normalizeInput,
  generatePresetPlan,
  coerceAIPlan,
  type AdvisorInput,
  type Goal,
  type Equipment,
  type Experience,
} from "@/lib/advisor";
import { isRelayConfigured, callRelayChat, type ChatMessage } from "@/lib/ai-relay";

export const dynamic = "force-dynamic";

// ── 限流（基础内存版）─────────────────────────────────────────────
// 注意：serverless 多实例 / 冷启动下此计数不持久，仅作基础防刷。
// 上线后建议在 Cloudflare 后台配 Rate Limiting Rules，或改用 KV 持久化。
const DAILY_LIMIT = 10;
const hits = new Map<string, { day: string; count: number }>();

function getClientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { ok: boolean; remaining: number } {
  const day = new Date().toISOString().slice(0, 10);
  if (hits.size > 5000) hits.clear(); // 防内存无限增长
  const cur = hits.get(ip);
  if (!cur || cur.day !== day) {
    hits.set(ip, { day, count: 1 });
    return { ok: true, remaining: DAILY_LIMIT - 1 };
  }
  if (cur.count >= DAILY_LIMIT) return { ok: false, remaining: 0 };
  cur.count += 1;
  return { ok: true, remaining: DAILY_LIMIT - cur.count };
}

// ── 真 AI：prompt 构造 + JSON 提取 ────────────────────────────────
const GOAL_TEXT: Record<Goal, string> = {
  muscle: "增肌（增加肌肉维度）",
  fatloss: "减脂（降低体脂、保留肌肉）",
  shape: "塑形（线条紧致、体态优化）",
  strength: "力量（提升最大力量）",
};
const EQUIP_TEXT: Record<Equipment, string> = {
  gym: "健身房（杠铃、器械齐全）",
  dumbbell: "仅一对可调哑铃",
  bodyweight: "纯徒手、无任何器械",
};
const EXP_TEXT: Record<Experience, string> = {
  beginner: "新手（训练 1 年以内）",
  intermediate: "进阶（有稳定训练基础）",
};

function buildMessages(input: AdvisorInput, locale: "zh" | "en"): ChatMessage[] {
  const exCount = input.experience === "beginner" ? 4 : 5;
  const langLine =
    locale === "en"
      ? "Respond in English."
      : "用简体中文输出。";
  const system =
    `你是 DAY 1 健身 App 的 AI 训练顾问。根据用户条件，生成一份科学、可执行的每周训练计划。\n` +
    `严格要求：\n` +
    `1) 只输出 JSON，不要任何解释文字、不要 markdown 代码块。\n` +
    `2) JSON 结构：{"name": string, "note": string, "days": [{"title": string, "exercises": [{"name": string, "muscle": string, "sets": number, "reps": string}]}]}\n` +
    `3) days 的数量必须等于用户每周训练天数。\n` +
    `4) 每天约 ${exCount} 个动作。\n` +
    `5) 动作必须符合可用器械限制。\n` +
    `6) reps 用区间字符串，如 "8-12"；sets 为数字。\n` +
    `7) note 是 1-2 句训练建议。\n` +
    `${langLine}`;
  const user =
    `请生成训练计划：\n` +
    `- 目标：${GOAL_TEXT[input.goal]}\n` +
    `- 每周训练天数：${input.daysPerWeek} 天\n` +
    `- 可用器械：${EQUIP_TEXT[input.equipment]}\n` +
    `- 训练经验：${EXP_TEXT[input.experience]}`;
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function extractJSON(text: string): unknown | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fall through */
  }
  // 剥离 ```json ... ``` 或从首个 { 到末个 }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // 限流
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", remaining: 0 },
      { status: 429 }
    );
  }

  // 解析输入
  let body: Partial<AdvisorInput> & { locale?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const input = normalizeInput(body);
  const locale: "zh" | "en" = body.locale === "en" ? "en" : "zh";

  // 开关式真 AI：配了密钥就尝试真调，失败回退预设
  if (isRelayConfigured()) {
    const content = await callRelayChat(buildMessages(input, locale), {
      maxTokens: 1500,
      temperature: 0.7,
      timeoutMs: 30000,
    });
    if (content) {
      const parsed = extractJSON(content);
      const aiPlan = coerceAIPlan(parsed, input);
      if (aiPlan) {
        return NextResponse.json({ plan: aiPlan, remaining: rl.remaining });
      }
    }
    // 真 AI 失败 → 静默回退预设
  }

  const plan = generatePresetPlan(input);
  return NextResponse.json({ plan, remaining: rl.remaining });
}
