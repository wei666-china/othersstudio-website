import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import CoverMedia from "@/components/CoverMedia";
import { supabaseAdmin } from "@/lib/supabase";

async function getArticles() {
  try {
    const { data: pinned } = await supabaseAdmin
      .from("website_articles")
      .select("*")
      .eq("status", "published")
      .eq("is_pinned", true)
      .order("published_at", { ascending: false })
      .limit(1);

    const { data: articles } = await supabaseAdmin
      .from("website_articles")
      .select("*")
      .eq("status", "published")
      .eq("is_pinned", false)
      .order("published_at", { ascending: false });

    return { pinned: pinned?.[0] || null, articles: articles || [] };
  } catch {
    return { pinned: null, articles: [] };
  }
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

// 有 id（真实文章）渲染为可点击链接；无 id（示例占位）渲染为静态卡片
function CardWrapper({
  id,
  className,
  children,
}: {
  id: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  if (id) {
    return (
      <Link href={`/thoughts/${id}`} className={`${className} no-underline cursor-pointer`}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}

export const dynamic = "force-dynamic";

export default async function ThoughtsPage() {
  const { pinned, articles } = await getArticles();
  const hasData = pinned || articles.length > 0;

  const fallbackPinned = {
    tag: "产品哲学",
    title: "为什么我们选择用 AI 重新定义健身记录",
    excerpt: "传统健身 App 的问题在于它们只是电子化了纸质记录。我们认为，真正的突破在于让 AI 理解你的训练语境，而不是让你适应软件的逻辑。从第一天起，DAY 1 就不想做一个\"更好的记录工具\"...",
    date: "2025 年 6 月 8 日",
    readTime: "12 分钟阅读",
  };

  const fallbackArticles = [
    { tag: "功能逻辑", title: "「身体准备度」功能的设计逻辑", excerpt: "如何将 HRV、睡眠、训练负荷等多维度数据融合成一个直观的准备度评分，让用户一眼看懂今天的身体状态。", date: "2025.06.05", readTime: "8 分钟" },
    { tag: "个人思考", title: "独立开发者的产品观：少即是多", excerpt: "在资源有限的情况下，如何做减法比做加法更重要。分享我在 DAY 1 开发过程中的一些产品取舍心得。", date: "2025.05.28", readTime: "6 分钟" },
    { tag: "功能逻辑", title: "AI 教练的对话设计：如何做到\"不烦人\"", excerpt: "AI 教练在训练中的介入时机、语气、内容长度，都经过了大量实测。记录我们的设计决策过程。", date: "2025.05.20", readTime: "10 分钟" },
    { tag: "产品思考", title: "Apple Watch 独立体验的取舍", excerpt: "Watch 端该做到什么程度？完整复刻手机端不现实，但太简陋又没用。我们最终的答案是\"场景驱动\"。", date: "2025.05.12", readTime: "7 分钟" },
    { tag: "设计笔记", title: "从色彩到情绪：DAY 1 的视觉语言", excerpt: "为什么选橙色？为什么暗黑模式是默认？一个健身 App 的视觉设计，远不止\"好看\"那么简单。", date: "2025.05.05", readTime: "9 分钟" },
    { tag: "个人思考", title: "数据隐私与用户信任", excerpt: "健身数据比社交数据更私密。我们怎么在用好数据的同时，让用户真正放心？这是我们一直在思考的问题。", date: "2025.04.28", readTime: "5 分钟" },
  ];

  const displayPinned = pinned
    ? { id: pinned.id as string, tag: pinned.tag, title: pinned.title, excerpt: pinned.excerpt || "", date: formatDate(pinned.published_at), readTime: `${Math.ceil((pinned.content?.length || 0) / 500)} 分钟阅读`, cover: (pinned.cover_url as string | null) || null }
    : { ...fallbackPinned, id: null as string | null, cover: null as string | null };

  const displayArticles = hasData
    ? articles.map((a) => ({ id: a.id as string | null, tag: a.tag, title: a.title, excerpt: a.excerpt || "", date: formatDate(a.published_at), readTime: `${Math.ceil((a.content?.length || 0) / 500)} 分钟`, cover: (a.cover_url as string | null) || null }))
    : fallbackArticles.map((a) => ({ ...a, id: null as string | null, cover: null as string | null }));

  return (
    <>
      <Navbar />

      <header className="pt-36 pb-14 max-w-[1200px] mx-auto px-6 md:px-15">
        <h1 className="text-[clamp(2.5rem,5.5vw,4rem)] mb-4 tracking-[-0.02em] max-w-[16ch]">思考与产品思路</h1>
        <p className="text-lg text-text-muted max-w-[48ch]">
          关于产品、设计与生活的独立思考。记录灵感、沉淀观点。
        </p>
      </header>

      {/* Pinned */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-15 pb-16">
        <FadeIn>
          <CardWrapper id={displayPinned.id} className="group grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] bg-surface rounded-3xl overflow-hidden border border-border hover:border-border-strong hover:shadow-[0_22px_60px_var(--c-shadow)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="relative aspect-[16/11] lg:aspect-auto lg:min-h-[360px] overflow-hidden">
              <CoverMedia cover={displayPinned.cover} seed={`pinned-${displayPinned.title}`} alt={displayPinned.title} zoomOnHover />
              <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink/80 backdrop-blur-sm text-on-ink rounded-full text-xs font-medium z-10">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>
                置顶精选
              </span>
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <span className="inline-flex items-center px-3 py-1 border border-border-strong text-text-mid rounded-full text-xs font-medium tracking-wide mb-5 w-fit">{displayPinned.tag}</span>
              <h2 className="text-2xl lg:text-[2rem] mb-4 leading-[1.2] text-text">{displayPinned.title}</h2>
              <p className="text-sm text-text-muted leading-relaxed mb-7 line-clamp-4">{displayPinned.excerpt}</p>
              <div className="text-xs text-text-soft font-mono flex gap-5">
                <span>{displayPinned.date}</span>
                <span>{displayPinned.readTime}</span>
              </div>
            </div>
          </CardWrapper>
        </FadeIn>
      </section>

      {/* Section heading — 真实反映内容，替代过去点击无反应的假筛选 Tab */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-15">
        <div className="flex items-baseline justify-between gap-4 mb-12 border-b border-border pb-4">
          <h2 className="font-serif text-xl text-text">全部文章</h2>
          <span className="text-xs text-text-soft font-mono tracking-wide">
            按时间倒序 · 共 {displayArticles.length} 篇
          </span>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-15 pb-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {displayArticles.map((article, idx) => (
          <FadeIn key={article.id ?? `${article.title}-${idx}`} delay={(idx % 3) * 80}>
            <CardWrapper id={article.id} className="group flex flex-col h-full bg-surface rounded-2xl overflow-hidden border border-border hover:border-border-strong hover:-translate-y-1 hover:shadow-[0_18px_50px_var(--c-shadow)] transition-all duration-300">
              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <CoverMedia cover={article.cover} seed={`article-${article.title}-${idx}`} label={article.tag} alt={article.title} zoomOnHover />
              </div>
              <div className="flex flex-col flex-1 p-6">
                <span className="inline-flex w-fit items-center px-2.5 py-0.5 border border-border-strong text-text-mid rounded-full text-[0.7rem] font-medium tracking-wide mb-3">{article.tag}</span>
                <h3 className="font-serif text-lg text-text mb-2.5 leading-snug">{article.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{article.excerpt}</p>
                <div className="mt-auto pt-4 flex justify-between text-xs text-text-soft font-mono">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </CardWrapper>
          </FadeIn>
        ))}
      </section>

      <Footer />
    </>
  );
}
