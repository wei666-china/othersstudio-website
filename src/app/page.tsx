import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import Reveal from "@/components/Reveal";
import CoverMedia from "@/components/CoverMedia";
import Logo3D from "@/components/Logo3D";
import ReadinessOrb from "@/components/ReadinessOrb";
import Button from "@/components/ui/Button";
import AdvisorDemo from "@/components/AdvisorDemo";
import FeatureShowcase from "@/components/FeatureShowcase";
import FoodScanDemo from "@/components/FoodScanDemo";
import CoachTimingDemo from "@/components/CoachTimingDemo";
import TrainingDataDemo from "@/components/TrainingDataDemo";
import { getServerT, getLocale } from "@/i18n/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getRecentContent() {
  try {
    const { data: articles } = await supabaseAdmin
      .from("website_articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3);

    const { data: updates } = await supabaseAdmin
      .from("website_updates")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3);

    return { articles: articles || [], updates: updates || [] };
  } catch {
    return { articles: [], updates: [] };
  }
}

async function getSettings() {
  try {
    const { data } = await supabaseAdmin
      .from("website_settings")
      .select("key, value")
      .in("key", ["product", "team"]);
    const map: Record<string, any> = {};
    data?.forEach((row) => { map[row.key] = row.value; });
    return map;
  } catch {
    return {};
  }
}

function formatDate(d: string | null) {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export default async function Home() {
  const [{ articles: dbArticles, updates: dbUpdates }, settings, t, locale] = await Promise.all([
    getRecentContent(),
    getSettings(),
    getServerT(),
    getLocale(),
  ]);
  const hasArticles = dbArticles.length > 0;
  const hasUpdates = dbUpdates.length > 0;

  // 产品区门面兜底（数据库未配 product 时使用）：随语言切换，避免英文用户看到中文
  const productFallbackByLang = {
    zh: {
      title: "DAY 1 — 你的智能健身伙伴",
      subtitle: "不只是记录，更是理解",
      description: "用 AI 重新定义训练记录与恢复管理，让每一天都是最好的 Day 1。",
      detail: "DAY 1 结合 Apple Health 数据和 AI 分析，帮你了解身体状态，智能规划训练，并在你需要时提供个性化的教练建议。",
      features: [
        "AI 实时教练 — 训练中的智能语音指导",
        "身体准备度 — 基于 HRV/睡眠的每日状态评估",
        "智能训练计划 — 根据恢复情况动态调整",
        "Apple Watch 联动 — 手腕上的训练助手",
        "训练数据分析 — 可视化你的进步轨迹",
      ],
      app_store_url: "",
    },
    en: {
      title: "DAY 1 — Your smart fitness companion",
      subtitle: "More than tracking — understanding",
      description: "AI reimagines training logs and recovery, making every day the best Day 1.",
      detail: "DAY 1 combines Apple Health data with AI analysis to help you understand your body, plan training intelligently, and get personalized coaching when you need it.",
      features: [
        "Live AI coach — smart voice guidance during workouts",
        "Body readiness — daily status from HRV / sleep",
        "Smart training plans — adapt to your recovery",
        "Apple Watch sync — your training assistant on the wrist",
        "Training analytics — visualize your progress",
      ],
      app_store_url: "",
    },
  };
  // 产品区文案策略：
  // - 中文：优先用数据库配置；数据库没配则用中文兜底
  // - 英文：数据库内容是中文（不翻译），所以英文文案一律走代码英文版，
  //   但保留数据库里与语言无关的图片/链接（image_url / app_store_url）。
  const product =
    locale === "en"
      ? {
          ...productFallbackByLang.en,
          image_url: settings.product?.image_url ?? "",
          app_store_url: settings.product?.app_store_url ?? productFallbackByLang.en.app_store_url,
        }
      : settings.product || productFallbackByLang.zh;

  const teamMembers = settings.team || [
    { initial: "L", name: "创始人", role: "产品 & 设计", bio: "独立开发者，热爱用技术解决真实问题。相信好的产品来自对生活的细致观察。", avatar_url: "" },
    { initial: "A", name: "成员 A", role: "iOS 开发", bio: "Swift 爱好者，专注于流畅的用户体验和性能优化。让每一帧都丝滑如初。", avatar_url: "" },
    { initial: "B", name: "成员 B", role: "AI & 后端", bio: "机器学习工程师，负责 AI 教练和智能推荐算法。让数据有温度。", avatar_url: "" },
  ];
  const previewArticles = hasArticles
    ? dbArticles
    : [
        { tag: "产品思考", title: "为什么我们选择用 AI 重新定义健身记录", excerpt: "传统健身 App 的问题在于它们只是电子化了纸质记录。我们认为，真正的突破在于让 AI 理解你的训练语境...", published_at: "2025-06-08", content: "x".repeat(6000) },
        { tag: "功能逻辑", title: "「身体准备度」功能的设计逻辑", excerpt: "如何将 HRV、睡眠、训练负荷等多维度数据融合成一个直观的准备度评分...", published_at: "2025-06-05", content: "x".repeat(4000) },
        { tag: "个人思考", title: "独立开发者的产品观：少即是多", excerpt: "在资源有限的情况下，如何做减法比做加法更重要。分享我的一些产品取舍心得...", published_at: "2025-05-28", content: "x".repeat(3000) },
      ];

  const previewUpdates = (hasUpdates
    ? dbUpdates.map((u) => ({
        date: formatDate(u.published_at),
        title: u.version ? `${u.version} 上线 · ${u.title}` : u.title,
        text: u.content || u.why || "",
        hasLink: u.type === "app-update",
      }))
    : [
        { date: "2025.06.10", title: "v2.4 上线 · AI 教练语音交互", text: "训练过程中可以通过语音与 AI 教练对话。为什么要做这个功能？因为健身时双手不空闲，文字交互的摩擦太大了。", hasLink: true },
        { date: "2025.06.06", title: "完成了语音交互原型测试", text: "在健身房实测了几组，发现反馈时机很关键，太早显得唐突，太晚失去指导意义。最终确定在组间休息时主动反馈。", hasLink: false },
        { date: "2025.05.25", title: "v2.3 上线 · 身体准备度算法优化", text: "重新校准了 HRV 和训练负荷的权重模型。用户反馈说之前的评分偏保守，调整后更贴合真实感受。", hasLink: true },
      ]
  ).slice(0, 3);

  return (
    <>
      <Navbar />

      {/* Hero — A+C 融合：左侧克制大标题 + 右侧准备度数据卡点题 */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden px-6 md:px-15 pt-32 pb-24">
        <div className="absolute top-[-18%] right-[-12%] w-[64vw] max-w-[820px] aspect-square rounded-full bg-[radial-gradient(circle,var(--c-accent-soft)_0%,transparent_66%)] pointer-events-none" />
        <div className="absolute bottom-[-16%] left-[-14%] w-[46vw] max-w-[560px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(92,61,46,0.07)_0%,transparent_64%)] pointer-events-none" />

        <div className="relative w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          {/* 左：文案 */}
          <div>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-surface rounded-full text-xs font-medium text-text-muted mb-9 border border-border">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {t("hero.badge")}
            </div>

            <h1 className="text-[clamp(2.75rem,6vw,4.9rem)] font-bold leading-[1.04] tracking-[-0.03em] text-text mb-7 max-w-[15ch]">
              Think Different,<br />
              Build{" "}
              <span
                className="italic font-medium inline-block"
                style={{
                  backgroundImage: "linear-gradient(105deg, #FF7326 0%, #F24059 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  // 斜体行尾 "e" 会探出字形盒子，被 background-clip:text 削边。
                  // 右侧留 padding 给字形缓冲；background-origin 默认 padding-box，
                  // 渐变会填充到 padding 区，使 "e" 完整显示。
                  paddingRight: "0.25em",
                }}
              >
                Day One
              </span>
            </h1>

            <p className="text-lg md:text-xl text-text-muted max-w-[34rem] mb-11 leading-relaxed">
              {t("hero.desc")}
            </p>

            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <Button href="#product">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                {t("hero.cta.product")}
              </Button>
              <Button href="/thoughts" variant="secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                {t("hero.cta.thoughts")}
              </Button>
            </div>
          </div>

          {/* 右：身体准备度（横向翻页卡片，无白底、与背景融合；入场动画由组件自带，故不再套 Reveal） */}
          <div className="flex justify-center lg:justify-end">
            <ReadinessOrb />
          </div>
        </div>
      </section>

      {/* Thoughts Preview */}
      <section className="bg-bg-alt py-24 md:py-32 px-6 md:px-15" id="thoughts-preview">
        <div className="max-w-[1280px] mx-auto">
          <Reveal direction="up" className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <h2 className="text-[clamp(2rem,4.2vw,3.1rem)] max-w-[18ch]">{t("section.thoughts.title")}</h2>
            <p className="text-base text-text-muted max-w-[34ch] md:text-right">
              {t("section.thoughts.desc")}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-8">
            {previewArticles.map((article, i) => {
              const cover = (article as { cover_url?: string }).cover_url;
              return (
                <FadeIn key={i} delay={i * 80} className={i === 0 ? "lg:row-span-2" : ""}>
                  <Link
                    href="/thoughts"
                    className="group flex flex-col h-full bg-surface rounded-2xl overflow-hidden border border-border hover:border-border-strong hover:-translate-y-1 hover:shadow-[0_18px_50px_var(--c-shadow)] transition-all duration-300 no-underline text-inherit"
                  >
                    <div className={`relative w-full overflow-hidden ${i === 0 ? "aspect-[16/11]" : "aspect-[16/9]"}`}>
                      <CoverMedia cover={cover} seed={`thought-${article.title}-${i}`} alt={article.title} zoomOnHover />
                    </div>
                    <div className="flex flex-col flex-1 p-7 lg:p-8">
                      <span className="inline-flex w-fit items-center px-3 py-1 border border-border-strong text-text-mid rounded-full text-xs font-medium tracking-wide mb-4">{article.tag}</span>
                      <h3 className={`${i === 0 ? "text-xl lg:text-2xl" : "text-lg"} mb-3 leading-snug text-text`}>{article.title}</h3>
                      <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{article.excerpt}</p>
                      <div className="mt-auto pt-5 flex justify-between text-xs text-text-soft font-mono">
                        <span>{formatDate(article.published_at)}</span>
                        <span>{Math.ceil((article.content?.length || 0) / 500)} {t("card.readMins")}</span>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>

          <div className="mt-12">
            <Link href="/thoughts" className="group inline-flex items-center gap-2 text-sm font-medium text-text no-underline">
              {t("section.thoughts.more")}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Updates Preview */}
      <section className="max-w-[820px] mx-auto px-6 md:px-15 py-24 md:py-32" id="updates-preview">
        <Reveal direction="up">
          <h2 className="text-[clamp(2rem,4.2vw,3.1rem)] mb-3">{t("section.updates.title")}</h2>
          <p className="text-base text-text-muted max-w-[40ch] mb-14">
            {t("section.updates.desc")}
          </p>
        </Reveal>

        <div className="relative pl-9 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-border-strong before:via-border before:to-transparent">
          {previewUpdates.map((item, i) => (
            <FadeIn key={i} delay={i * 70}>
              <Link
                href="/updates"
                className="group relative block mb-10 last:mb-0 p-6 md:p-7 bg-surface rounded-2xl border border-border no-underline text-inherit hover:border-border-strong hover:shadow-[0_10px_30px_var(--c-shadow)] transition-all duration-300 before:content-[''] before:absolute before:-left-[37px] before:top-8 before:w-2.5 before:h-2.5 before:rounded-full before:bg-accent before:ring-4 before:ring-bg"
              >
                <div className="text-xs text-text-soft font-mono tracking-wide mb-2">{item.date}</div>
                <div className="text-lg font-serif text-text mb-2 leading-snug">{item.title}</div>
                <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{item.text}</p>
                {item.hasLink && (
                  <span className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-accent-deep">
                    {t("card.viewProduct")}
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </span>
                )}
              </Link>
            </FadeIn>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/updates" className="group inline-flex items-center gap-2 text-sm font-medium text-text no-underline">
            {t("section.updates.more")}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
        </div>
      </section>

      {/* Product Section */}
      <section className="bg-ink text-on-ink py-24 md:py-32 px-6 md:px-15 relative overflow-hidden" id="product">
        <div className="absolute top-[-10%] left-[-8%] w-[40vw] max-w-[520px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.10)_0%,transparent_66%)] pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-12 lg:gap-16 items-center">
          <Reveal direction="up">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-5">{t("section.product.eyebrow")}</span>
            <h2 className="text-[clamp(2rem,4.2vw,3.1rem)] text-on-ink mb-4 leading-[1.1]">{product.title}</h2>
            <h3 className="font-serif text-xl md:text-2xl text-on-ink/85 mb-6 italic">
              {product.subtitle}
            </h3>
            <p className="text-on-ink/80 text-base leading-relaxed mb-10 max-w-[46ch]">
              {product.detail}
            </p>
            <ul className="list-none flex flex-col gap-4">
              {product.features.map((feat: string) => {
                const [name, ...rest] = feat.split("—");
                const desc = rest.join("—").trim();
                return (
                  <li key={feat} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span>
                      <span className="text-on-ink font-medium">{name.trim()}</span>
                      {desc ? <span className="text-on-ink/65">{` — ${desc}`}</span> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
          <Reveal direction="up" index={1} className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-on-ink/10 bg-[radial-gradient(130%_100%_at_50%_28%,rgba(96,63,47,0.45)_0%,rgba(45,31,23,0.7)_45%,rgba(26,18,14,0.92)_100%)] shadow-[inset_0_1px_0_rgba(255,180,140,0.10),inset_0_-44px_80px_-44px_rgba(0,0,0,0.55)]">
            {product.image_url ? (
              <>
                <img
                  src={product.image_url}
                  alt="DAY 1 训练场景"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-[rgba(41,32,26,0.45)] to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,107,53,0.18),transparent_55%)] mix-blend-screen" />
              </>
            ) : (
              <Logo3D />
            )}
          </Reveal>
        </div>
      </section>

      {/* 核心功能展示 —— 解剖线描 + 数据可视化（第 3 期样板：身体准备度）。接深色产品介绍之后，浅底交替 */}
      <FeatureShowcase />

      {/* AI 顾问 demo —— 体验式展示我们的 AI（接核心功能展示之后，明暗交替） */}
      <AdvisorDemo />

      {/* 拍照识别食物 demo —— 深色科技版块：扫描识别 + 营养卡（第 3 期功能展示，接 AI 顾问之后）*/}
      <FoodScanDemo />

      {/* AI 教练时机感 demo —— 浅色暖底：训练时刻 + 组间休息 AI 气泡（第 3 期功能展示，接食物识别深色版块之后，明暗交替）*/}
      <CoachTimingDemo />

      {/* 训练数据可视化 demo —— 深色版块：进步轨迹描边生长 + 指标滚动 + AI 洞察（第 3 期功能展示，接教练浅色版块之后，明暗交替）*/}
      <TrainingDataDemo />

      {/* Developer / API Section */}
      <section className="py-24 md:py-32 px-6 md:px-15" id="developer">
        <div className="max-w-[1000px] mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-surface-2 border border-border px-7 md:px-16 py-14 md:py-16">
            <div className="absolute -top-24 -right-24 w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,var(--c-accent-soft)_0%,transparent_70%)] pointer-events-none" />

            <Reveal direction="up" className="relative max-w-[640px]">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-text-muted mb-5">{t("section.developer.eyebrow")}</span>
              <h2 className="text-[clamp(1.8rem,3.6vw,2.6rem)] mb-4 leading-[1.12]">{t("section.developer.title")}</h2>
              <p className="text-base text-text-muted mb-10 leading-relaxed">
                {t("section.developer.desc")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-12">
                <Link
                  href="/me/developer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-ink text-on-ink rounded-full text-sm font-medium no-underline shadow-[0_6px_22px_var(--c-shadow)] hover:shadow-[0_10px_32px_var(--c-shadow-strong)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                  {t("section.developer.apply")}
                </Link>
                <Link
                  href="/me/developer/docs"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-transparent text-text border border-border-strong rounded-full text-sm font-medium no-underline hover:border-ink hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  {t("section.developer.docs")}
                </Link>
              </div>
            </Reveal>

            <Reveal direction="up" index={1} className="relative grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
              {[
                { step: "01", title: t("section.developer.step1.title"), desc: t("section.developer.step1.desc") },
                { step: "02", title: t("section.developer.step2.title"), desc: t("section.developer.step2.desc") },
                { step: "03", title: t("section.developer.step3.title"), desc: t("section.developer.step3.desc") },
              ].map((s) => (
                <div key={s.step} className="bg-surface px-5 py-5">
                  <span className="block font-mono text-xs text-accent-deep mb-2">{s.step}</span>
                  <p className="text-sm font-medium text-text">{s.title}</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 md:py-32 px-6 md:px-15 bg-bg-alt" id="team">
        <div className="max-w-[1080px] mx-auto">
          <Reveal direction="up" className="text-center max-w-[40ch] mx-auto mb-14 md:mb-16">
            <h2 className="text-[clamp(2rem,4.2vw,3.1rem)] mb-4">{t("section.team.title")}</h2>
            <p className="text-base text-text-muted leading-relaxed">
              {t("section.team.desc")}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {teamMembers.map((member: any, i: number) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="group relative h-full flex flex-col p-7 bg-surface rounded-2xl border border-border overflow-hidden hover:border-border-strong hover:-translate-y-1 hover:shadow-[0_16px_44px_var(--c-shadow)] transition-all duration-300">
                  {/* 顶部强调线：hover 时显现，提升精致度 */}
                  <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent to-accent-deep opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="w-14 h-14 rounded-2xl bg-accent-soft border border-accent/20 mb-5 flex items-center justify-center text-xl font-serif text-accent-deep overflow-hidden">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.initial
                    )}
                  </div>

                  <div className="font-serif text-lg text-text">{member.name}</div>
                  <div className="flex items-center gap-2 mt-1.5 mb-4">
                    <span className="w-4 h-px bg-accent-deep/50" />
                    <span className="text-xs text-accent-deep font-medium tracking-wide">{member.role}</span>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">{member.bio}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
