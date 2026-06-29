// AI 导览助手 —— FAQ 知识库 + 关键词匹配（不调真 AI，零成本、即时、可控）。
//
// 设计：每条 FAQ 带中英关键词，用户输入或点快捷问题时按命中关键词数匹配最佳答案。
// 答案附可选跳转，把访客引导到对应版块 / 页面。无命中给出友好兜底。

export type Lang = "zh" | "en";

export interface FAQItem {
  id: string;
  keywords: string[]; // 统一小写，中英混合
  question: { zh: string; en: string }; // 快捷问题按钮文案
  answer: { zh: string; en: string };
  link?: { href: string; label: { zh: string; en: string } };
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "what",
    keywords: ["什么是", "是什么", "是谁", "介绍", "产品", "day1", "day one", "关于", "about", "what is", "who are", "intro"],
    question: { zh: "DAY 1 是什么？", en: "What is DAY 1?" },
    answer: {
      zh: "DAY 1 是一款 AI 健身科技产品，由 Others Studio 打造。它结合 Apple Health 数据和 AI 分析，帮你了解身体状态、智能规划训练，并在需要时给出个性化教练建议。",
      en: "DAY 1 is an AI fitness product by Others Studio. It combines Apple Health data with AI to read your body state, plan training intelligently, and coach you when you need it.",
    },
    link: { href: "#product", label: { zh: "了解产品", en: "See the product" } },
  },
  {
    id: "features",
    keywords: ["功能", "能做什么", "能干什么", "特点", "亮点", "feature", "features", "what can", "capabilities"],
    question: { zh: "有哪些核心功能？", en: "What are the key features?" },
    answer: {
      zh: "核心功能包括：AI 实时教练（训练中的语音指导）、身体准备度（基于 HRV/睡眠的每日状态）、智能训练计划（按恢复动态调整）、Apple Watch 联动，以及训练数据可视化分析。",
      en: "Highlights: a live AI coach, daily Body Readiness (from HRV/sleep), adaptive training plans, Apple Watch sync, and visual training analytics.",
    },
    link: { href: "#product", label: { zh: "查看全部功能", en: "View all features" } },
  },
  {
    id: "advisor",
    keywords: ["计划", "训练计划", "生成", "顾问", "推荐", "plan", "advisor", "generate", "recommend", "routine"],
    question: { zh: "能帮我生成训练计划吗？", en: "Can it build me a plan?" },
    answer: {
      zh: "可以！上方的「AI 训练顾问」就能体验：选好目标、天数、器械和经验，30 秒生成一份训练计划卡。完整的动态计划和实时教练在 App 里。",
      en: "Yes! Try the “AI Training Advisor” above — pick your goal, days, equipment and level to get a plan card in 30 seconds. The full adaptive plan lives in the app.",
    },
    link: { href: "#advisor", label: { zh: "去体验顾问", en: "Try the advisor" } },
  },
  {
    id: "readiness",
    keywords: ["准备度", "状态", "恢复", "hrv", "睡眠", "readiness", "recovery", "sleep", "ready"],
    question: { zh: "「身体准备度」是什么？", en: "What is Body Readiness?" },
    answer: {
      zh: "身体准备度把 HRV、睡眠、训练负荷等多维度数据融合成一个直观评分，告诉你今天适合冲强度还是该恢复。它是 DAY 1 智能调整训练的基础。",
      en: "Body Readiness fuses HRV, sleep and training load into one score that tells you whether to push hard or recover today. It's the basis of DAY 1's adaptive training.",
    },
    link: { href: "/thoughts", label: { zh: "读相关思考", en: "Read our thinking" } },
  },
  {
    id: "developer",
    keywords: ["api", "开发者", "key", "密钥", "接入", "数据接入", "cursor", "claude", "codex", "agent", "developer", "integrate"],
    question: { zh: "开发者怎么接入 API？", en: "How do I use the API?" },
    answer: {
      zh: "用 App 同款账号登录开发者门户，生成专属 API Key，就能把你的健康数据安全地开放给 Cursor、Claude、Codex 等 AI Agent。",
      en: "Sign in to the developer portal with your app account, generate an API key, and let AI agents like Cursor, Claude or Codex securely read your health data.",
    },
    link: { href: "/me/developer", label: { zh: "前往开发者门户", en: "Open developer portal" } },
  },
  {
    id: "price",
    keywords: ["价格", "收费", "多少钱", "订阅", "会员", "免费", "pro", "price", "cost", "subscription", "free", "pay"],
    question: { zh: "怎么收费？", en: "How is it priced?" },
    answer: {
      zh: "DAY 1 提供免费使用额度，进阶能力（更高频次的 AI 聊天、拍照识别、教练等）由 Pro 订阅解锁。具体以 App 内为准。",
      en: "DAY 1 is free to start, with Pro unlocking heavier AI usage (more chat, photo recognition, coaching, etc.). See the app for current pricing.",
    },
  },
  {
    id: "privacy",
    keywords: ["隐私", "安全", "数据安全", "保护", "privacy", "security", "safe"],
    question: { zh: "我的数据安全吗？", en: "Is my data safe?" },
    answer: {
      zh: "我们以隐私为先：敏感健康数据（如生理周期、健康状况、心率采样）不会上传云端；只有你授权时，数据才会通过你自己的 API Key 开放给指定 AI。",
      en: "Privacy-first: sensitive health data (cycle, conditions, heart-rate samples) never leaves your device, and data is only shared via your own API key when you authorize it.",
    },
  },
  {
    id: "download",
    keywords: ["下载", "安装", "哪里下", "苹果", "app store", "ios", "download", "install", "get the app"],
    question: { zh: "在哪里下载？", en: "Where can I download it?" },
    answer: {
      zh: "DAY 1 是一款 iOS App。可以先在产品版块了解它的能力；上架信息会在官网与更新日志同步。",
      en: "DAY 1 is an iOS app. Explore its capabilities in the product section — availability is announced on the site and in our updates.",
    },
    link: { href: "/updates", label: { zh: "看最新更新", en: "See latest updates" } },
  },
];

export const GUIDE_UI = {
  zh: {
    launcher: "问问 DAY 1",
    title: "DAY 1 助手",
    subtitle: "由 DAY 1 的 AI 驱动",
    welcome: "你好，我是 DAY 1 的 AI 助手。关于产品、功能或数据接入，都可以问我——点下面的问题，或直接打字。",
    fallback: "这个问题我还不太确定。我最擅长 DAY 1 的产品、功能和接入相关的问题，试试这些：",
    placeholder: "问点什么…",
    send: "发送",
    quickTitle: "你可以问",
    status: "在线",
  },
  en: {
    launcher: "Ask DAY 1",
    title: "DAY 1 Assistant",
    subtitle: "Powered by DAY 1's AI",
    welcome: "Hi, I'm DAY 1's AI assistant. Ask me anything about the product, features or data access — tap a question below, or just type.",
    fallback: "I'm not sure about that one — I'm best with questions about DAY 1's product, features and integrations. Try these:",
    placeholder: "Ask anything…",
    send: "Send",
    quickTitle: "You can ask",
    status: "Online",
  },
};

// 首屏快捷问题（取这几条 FAQ）
export const QUICK_IDS = ["what", "features", "advisor", "developer"];

/** 关键词匹配：返回命中分最高的 FAQ，无命中返回 null。 */
export function matchFAQ(query: string): FAQItem | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  let best: FAQItem | null = null;
  let bestScore = 0;
  for (const item of FAQ_ITEMS) {
    let score = 0;
    for (const kw of item.keywords) {
      if (kw && q.includes(kw.toLowerCase())) score += kw.length >= 3 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return bestScore > 0 ? best : null;
}
