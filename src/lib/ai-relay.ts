// 服务端专用：复用 App 同款 Cloudflare Worker 中继（ai.othersstudio.tech）调用 AI。
//
// 安全要点（务必遵守，othersstudio 是公开仓库）：
//  - HMAC 密钥只从环境变量 AI_RELAY_SECRET 读取，绝不硬编码、绝不出现在前端 bundle。
//  - 本文件只在服务端（API route）被 import，浏览器拿不到。
//  - 没配密钥时所有函数安全降级（返回 null），上层自动回退到预设结果。
//
// 鉴权方式与 App 的 AIService.generateHMAC / applyAuthHeaders 完全一致：
//  signature = hex( HMAC-SHA256( bodyBytes ++ timestampBytes, secret ) )
//  请求头：X-Device-ID / X-Timestamp / X-Signature / X-Region

const WORKER_URL = "https://ai.othersstudio.tech";
const DEFAULT_MODEL = "qwen3.6-plus";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function getSecret(): string | null {
  const s = process.env.AI_RELAY_SECRET;
  return s && s.trim() ? s.trim() : null;
}

/** 真 AI 是否已通过环境变量接通。未接通时上层应使用预设结果。 */
export function isRelayConfigured(): boolean {
  return getSecret() !== null;
}

async function hmacSignHex(bodyBytes: Uint8Array, timestamp: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const tsBytes = enc.encode(timestamp);
  const payload = new Uint8Array(bodyBytes.length + tsBytes.length);
  payload.set(bodyBytes, 0);
  payload.set(tsBytes, bodyBytes.length);
  const sig = await crypto.subtle.sign("HMAC", key, payload);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * 调用 Worker 的 /chat/completions，返回 assistant 文本。
 * 任何失败（未配密钥 / 网络 / 非 2xx / 解析失败）都返回 null，由上层兜底。
 */
export async function callRelayChat(
  messages: ChatMessage[],
  opts?: { maxTokens?: number; temperature?: number; timeoutMs?: number }
): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const body = JSON.stringify({
    model: process.env.AI_RELAY_MODEL || DEFAULT_MODEL,
    messages,
    max_tokens: opts?.maxTokens ?? 1500,
    temperature: opts?.temperature ?? 0.7,
    enable_thinking: false,
  });
  const bodyBytes = new TextEncoder().encode(body);
  const timestamp = String(Math.floor(Date.now() / 1000));

  let signature: string;
  try {
    signature = await hmacSignHex(bodyBytes, timestamp, secret);
  } catch {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 30000);
  try {
    const res = await fetch(`${WORKER_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 网站统一身份；如 Worker 按 device 限流可通过 env 覆盖
        "X-Device-ID": process.env.AI_RELAY_DEVICE_ID || "othersstudio-web",
        "X-Timestamp": timestamp,
        "X-Signature": signature,
        "X-Region": process.env.AI_RELAY_REGION || "sg",
      },
      body,
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices?: { message?: { content?: unknown } }[];
    };
    const content = json?.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
