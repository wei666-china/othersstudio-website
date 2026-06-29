/**
 * 门面文案中英字典（轻量自建 i18n，不引第三方、不重构目录）。
 *
 * 仅覆盖"门面"——导航 / 首页框架文案 / 按钮 / 通用区块标题。
 * 文章、动态等数据库内容保持中文，不在此处翻译（本期范围 A：务实派）。
 *
 * 用法：组件内 const t = useT(); t("nav.thoughts")
 * 缺词时回退到 zh，再回退到 key 本身，保证永不空白。
 */

export type Locale = "zh" | "en";
export const LOCALES: Locale[] = ["zh", "en"];
export const DEFAULT_LOCALE: Locale = "zh";
export const LOCALE_COOKIE = "NEXT_LOCALE";

type Dict = Record<string, string>;

const zh: Dict = {
  // nav
  "nav.thoughts": "思考",
  "nav.updates": "动态",
  "nav.product": "产品",
  "nav.team": "团队",
  "nav.developer": "开发者",
  "nav.menu": "菜单",

  // hero
  "hero.badge": "AI 健身科技",
  "hero.desc": "用 AI 真正理解你的身体。DAY 1 把训练、恢复与健康数据融为一体，让每一天都是最好的开始。",
  "hero.cta.product": "了解产品",
  "hero.cta.thoughts": "阅读思考",

  // sections
  "section.thoughts.title": "最新思考",
  "section.thoughts.desc": "关于产品、设计与生活的独立思考，以及 DAY 1 功能背后的落地逻辑。",
  "section.thoughts.more": "查看全部思考",
  "section.updates.title": "最新动态",
  "section.updates.desc": "App 更新记录、产品感想，以及我们的日常。",
  "section.updates.more": "查看全部动态",
  "section.product.eyebrow": "Our Product",
  "section.developer.eyebrow": "For Developers",
  "section.developer.title": "让你的 AI 读懂你的身体",
  "section.developer.desc": "健康，应当像 AI 一样被持续追踪、被真正理解。用 App 同款账号登录，生成专属 API Key，把你的健康数据开放给 Cursor、Claude Code、Codex 等 AI Agent，让它比任何人都更了解你。",
  "section.developer.apply": "申请 API Key",
  "section.developer.docs": "查看 API 文档",
  "section.developer.step1.title": "登录",
  "section.developer.step1.desc": "用 App 同款账号登录",
  "section.developer.step2.title": "生成 Key",
  "section.developer.step2.desc": "一键创建专属 API Key",
  "section.developer.step3.title": "接入 Agent",
  "section.developer.step3.desc": "AI 自动读取你的数据",
  "section.team.title": "我们的团队",
  "section.team.desc": "一群热爱健身和技术的人，致力于让训练变得更智能。",

  // 卡片 / 链接通用
  "card.viewProduct": "查看产品详情",
  "card.readMins": "分钟阅读",

  // footer
  "footer.tagline": "记录思考，构建产品。每一天都是新的 Day 1。",
  "footer.col.content": "内容",
  "footer.col.product": "产品",
  "footer.col.contact": "联系",
  "footer.link.thoughts": "思考与思路",
  "footer.link.updates": "动态更新",
  "footer.link.email": "邮箱",
  "footer.rights": "保留所有权利。",
  "footer.built": "用心打造。",

  // misc
  "common.readMore": "查看详情",
  "lang.switch": "EN",
};

const en: Dict = {
  "nav.thoughts": "Thoughts",
  "nav.updates": "Updates",
  "nav.product": "Product",
  "nav.team": "Team",
  "nav.developer": "Developers",
  "nav.menu": "Menu",

  "hero.badge": "AI Fitness Technology",
  "hero.desc": "Let AI truly understand your body. DAY 1 unifies training, recovery and health data, so every day is the best place to start.",
  "hero.cta.product": "Explore Product",
  "hero.cta.thoughts": "Read Thoughts",

  "section.thoughts.title": "Latest Thoughts",
  "section.thoughts.desc": "Independent thinking on product, design and life — and the logic behind DAY 1's features.",
  "section.thoughts.more": "View all thoughts",
  "section.updates.title": "Latest Updates",
  "section.updates.desc": "App release notes, product reflections, and our day-to-day.",
  "section.updates.more": "View all updates",
  "section.product.eyebrow": "Our Product",
  "section.developer.eyebrow": "For Developers",
  "section.developer.title": "Let your AI understand your body",
  "section.developer.desc": "Health should be continuously tracked and truly understood, the way AI is. Sign in with your app account, generate an API Key, and open your health data to AI agents like Cursor, Claude Code and Codex — so they know you better than anyone.",
  "section.developer.apply": "Get API Key",
  "section.developer.docs": "Read API Docs",
  "section.developer.step1.title": "Sign in",
  "section.developer.step1.desc": "Use your app account",
  "section.developer.step2.title": "Generate Key",
  "section.developer.step2.desc": "Create your API Key in one click",
  "section.developer.step3.title": "Connect Agent",
  "section.developer.step3.desc": "Your AI reads your data automatically",
  "section.team.title": "Our Team",
  "section.team.desc": "A team that loves fitness and technology, making training smarter.",

  "card.viewProduct": "View product details",
  "card.readMins": "min read",

  "footer.tagline": "Thinking out loud, building products. Every day is a new Day 1.",
  "footer.col.content": "Content",
  "footer.col.product": "Product",
  "footer.col.contact": "Contact",
  "footer.link.thoughts": "Thoughts & ideas",
  "footer.link.updates": "Updates",
  "footer.link.email": "Email",
  "footer.rights": "All rights reserved.",
  "footer.built": "Built with care.",

  "common.readMore": "Read more",
  "lang.switch": "中",
};

const dicts: Record<Locale, Dict> = { zh, en };

export function getDict(locale: Locale): Dict {
  return dicts[locale] || zh;
}

/** 取词：缺词回退 zh，再回退 key 本身。 */
export function translate(locale: Locale, key: string): string {
  return dicts[locale]?.[key] ?? zh[key] ?? key;
}
