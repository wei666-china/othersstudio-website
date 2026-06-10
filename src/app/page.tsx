import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
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
  const [{ articles: dbArticles, updates: dbUpdates }, settings] = await Promise.all([
    getRecentContent(),
    getSettings(),
  ]);
  const hasArticles = dbArticles.length > 0;
  const hasUpdates = dbUpdates.length > 0;

  const product = settings.product || {
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
  };

  const teamMembers = settings.team || [
    { initial: "L", name: "创始人", role: "产品 & 设计", bio: "独立开发者，热爱用技术解决真实问题。相信好的产品来自对生活的细致观察。", avatar_url: "" },
    { initial: "A", name: "成员 A", role: "iOS 开发", bio: "Swift 爱好者，专注于流畅的用户体验和性能优化。让每一帧都丝滑如初。", avatar_url: "" },
    { initial: "B", name: "成员 B", role: "AI & 后端", bio: "机器学习工程师，负责 AI 教练和智能推荐算法。让数据有温度。", avatar_url: "" },
  ];
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-15 pt-30 pb-20 relative overflow-hidden">
        <div className="absolute -top-50 -right-50 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(201,168,140,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-25 -left-37 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,168,140,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-5 py-2 bg-surface rounded-full text-xs font-medium text-brown-muted mb-10 border border-brown-light/30">
          <span className="w-1.5 h-1.5 rounded-full bg-brown-warm" />
          正在构建中
        </div>

        <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-bold mb-6 tracking-tighter text-brown-deep">
          Think Different,<br />
          Build <span className="italic text-brown-warm">Day One</span>
        </h1>

        <p className="text-lg text-brown-muted max-w-[600px] mb-12 font-light leading-relaxed">
          我们相信好的产品来自独立思考。这里记录着我们的思路、产品逻辑和每一个 DAY 1 的故事。
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/thoughts"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brown-deep text-white rounded-full text-sm font-medium no-underline shadow-[0_4px_16px_rgba(61,43,31,0.2)] hover:bg-brown-warm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(61,43,31,0.25)] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            阅读思考
          </Link>
          <Link
            href="#product"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent text-brown-deep border-[1.5px] border-brown-light rounded-full text-sm font-medium no-underline hover:border-brown-deep hover:bg-brown-deep/3 hover:-translate-y-0.5 transition-all"
          >
            了解产品
          </Link>
        </div>
      </section>

      {/* Thoughts Preview */}
      <section className="bg-bg-alt py-30 px-6 md:px-15" id="thoughts-preview">
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold tracking-[3px] uppercase text-brown-muted mb-4">Latest Thoughts</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] mb-4">最新思考</h2>
          <p className="text-base text-brown-muted max-w-[560px] mx-auto">
            关于产品、设计与生活的独立思考，以及 DAY 1 功能背后的落地逻辑。
          </p>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          {(hasArticles ? dbArticles : [
            { tag: "产品思考", title: "为什么我们选择用 AI 重新定义健身记录", excerpt: "传统健身 App 的问题在于它们只是电子化了纸质记录。我们认为，真正的突破在于让 AI 理解你的训练语境...", published_at: "2025-06-08", content: "x".repeat(6000) },
            { tag: "功能逻辑", title: "「身体准备度」功能的设计逻辑", excerpt: "如何将 HRV、睡眠、训练负荷等多维度数据融合成一个直观的准备度评分...", published_at: "2025-06-05", content: "x".repeat(4000) },
            { tag: "个人思考", title: "独立开发者的产品观：少即是多", excerpt: "在资源有限的情况下，如何做减法比做加法更重要。分享我的一些产品取舍心得...", published_at: "2025-05-28", content: "x".repeat(3000) },
          ]).map((article, i) => (
            <FadeIn key={i} className={i === 0 ? "lg:row-span-2" : ""}>
              <Link href="/thoughts" className="block bg-white rounded-2xl overflow-hidden border border-brown-light/20 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(61,43,31,0.1)] transition-all no-underline text-inherit">
                <div className={`w-full ${i === 0 ? "aspect-[16/12]" : "aspect-[16/10]"} bg-gradient-to-br from-surface to-brown-light/30 flex items-center justify-center text-brown-light`}>
                  <svg width={i === 0 ? "64" : "48"} height={i === 0 ? "64" : "48"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>
                <div className="p-7 pb-8">
                  <span className="inline-block px-3 py-1 bg-accent-soft text-accent rounded-full text-xs font-semibold mb-3">{article.tag}</span>
                  <h3 className={`${i === 0 ? "text-xl lg:text-2xl" : "text-lg"} mb-3 leading-snug`}>{article.title}</h3>
                  <p className="text-sm text-brown-muted leading-relaxed line-clamp-3">{article.excerpt}</p>
                  <div className="mt-5 pt-4 border-t border-brown-light/15 flex justify-between text-xs text-brown-light">
                    <span>{formatDate(article.published_at)}</span>
                    <span>{Math.ceil((article.content?.length || 0) / 500)} 分钟阅读</span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/thoughts" className="inline-flex items-center gap-1.5 text-sm font-medium text-brown-deep no-underline hover:gap-2.5 transition-all">
            查看全部思考
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Ornament */}
      <div className="flex items-center justify-center gap-4 py-15">
        <div className="w-15 h-px bg-brown-light" />
        <div className="w-1.5 h-1.5 rounded-full bg-brown-warm" />
        <div className="w-15 h-px bg-brown-light" />
      </div>

      {/* Updates Preview */}
      <section className="max-w-[900px] mx-auto px-6 md:px-15 pb-30" id="updates-preview">
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold tracking-[3px] uppercase text-brown-muted mb-4">Recent Updates</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] mb-4">最新动态</h2>
          <p className="text-base text-brown-muted max-w-[560px] mx-auto">
            App 更新记录、产品感想，以及我们的日常。
          </p>
        </div>

        <div className="relative pl-10 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1.5px] before:bg-gradient-to-b before:from-brown-light before:to-transparent">
          {(hasUpdates ? dbUpdates.map((u) => ({
            date: formatDate(u.published_at),
            title: u.version ? `${u.version} 上线 — ${u.title}` : u.title,
            text: u.content || u.why || "",
            hasLink: u.type === "app-update",
          })) : [
            { date: "2025.06.10", title: "v2.4 上线 — AI 教练语音交互", text: "训练过程中可以通过语音与 AI 教练对话。为什么要做这个功能？因为健身时双手不空闲，文字交互的摩擦太大了。", hasLink: true },
            { date: "2025.06.06", title: "完成了语音交互原型测试", text: "在健身房实测了几组，发现反馈时机很关键——太早显得唐突，太晚失去指导意义。最终确定在组间休息时主动反馈。", hasLink: false },
            { date: "2025.05.25", title: "v2.3 上线 — 身体准备度算法优化", text: "重新校准了 HRV 和训练负荷的权重模型。用户反馈说之前的评分偏保守，调整后更贴合真实感受。", hasLink: true },
          ]).slice(0, 3).map((item, i) => (
            <FadeIn key={i}>
              <Link
                href="/updates"
                className="relative block mb-12 p-7 bg-white rounded-xl border border-brown-light/15 no-underline text-inherit hover:shadow-[0_8px_24px_rgba(61,43,31,0.08)] hover:translate-x-1 transition-all before:content-[''] before:absolute before:-left-12 before:top-9 before:w-2.5 before:h-2.5 before:rounded-full before:bg-brown-warm before:border-[3px] before:border-bg before:shadow-[0_0_0_2px_var(--color-brown-light)]"
              >
                <div className="text-xs text-brown-light font-medium tracking-wide mb-2">{item.date}</div>
                <div className="text-lg font-serif text-brown-deep mb-2">{item.title}</div>
                <p className="text-sm text-brown-muted leading-relaxed line-clamp-3">{item.text}</p>
                {item.hasLink && (
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-brown-deep">
                    查看产品详情 →
                  </span>
                )}
              </Link>
            </FadeIn>
          ))}
        </div>

        <div className="text-center">
          <Link href="/updates" className="inline-flex items-center gap-1.5 text-sm font-medium text-brown-deep no-underline hover:gap-2.5 transition-all">
            查看全部动态
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Product Section */}
      <section className="bg-brown-deep py-30 px-6 md:px-15 text-white" id="product">
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold tracking-[3px] uppercase text-brown-light mb-4">Our Product</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] mb-4 text-white">{product.title}</h2>
          <p className="text-base text-white/60 max-w-[560px] mx-auto">
            {product.description}
          </p>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="lg:pr-10">
            <h3 className="font-serif text-3xl text-white mb-5">
              {product.subtitle}
            </h3>
            <p className="text-white/65 text-base leading-relaxed mb-8">
              {product.detail}
            </p>
            <ul className="list-none flex flex-col gap-4">
              {product.features.map((feat: string) => (
                <li key={feat} className="flex items-center gap-3 text-white/80 text-sm">
                  <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-white/5 to-white/2 rounded-2xl border border-white/8 flex items-center justify-center relative overflow-hidden">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/15"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
          </div>
        </div>
      </section>


      {/* Team Section */}
      <section className="py-30 px-6 md:px-15" id="team">
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold tracking-[3px] uppercase text-brown-muted mb-4">The Team</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] mb-4">我们的团队</h2>
          <p className="text-base text-brown-muted max-w-[560px] mx-auto">
            一群热爱健身和技术的人，致力于让训练变得更智能。
          </p>
        </div>

        <div className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {teamMembers.map((member: any, i: number) => (
            <FadeIn key={i}>
              <div className="text-center p-10 bg-white rounded-2xl border border-brown-light/15 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(61,43,31,0.1)] transition-all">
                <div className="w-25 h-25 rounded-full bg-gradient-to-br from-surface to-brown-light mx-auto mb-5 flex items-center justify-center text-3xl text-white border-3 border-white shadow-sm overflow-hidden">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.initial
                  )}
                </div>
                <div className="font-serif text-lg text-brown-deep mb-1">{member.name}</div>
                <div className="text-xs text-brown-warm font-medium mb-3">{member.role}</div>
                <p className="text-sm text-brown-muted leading-relaxed">{member.bio}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
