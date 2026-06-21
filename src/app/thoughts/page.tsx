import Link from "next/link";
import Navbar from "@/components/Navbar";
import FadeIn from "@/components/FadeIn";
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
    ? { id: pinned.id as string, tag: pinned.tag, title: pinned.title, excerpt: pinned.excerpt || "", date: formatDate(pinned.published_at), readTime: `${Math.ceil((pinned.content?.length || 0) / 500)} 分钟阅读` }
    : { ...fallbackPinned, id: null as string | null };

  const displayArticles = hasData
    ? articles.map((a) => ({ id: a.id as string | null, tag: a.tag, title: a.title, excerpt: a.excerpt || "", date: formatDate(a.published_at), readTime: `${Math.ceil((a.content?.length || 0) / 500)} 分钟` }))
    : fallbackArticles.map((a) => ({ ...a, id: null as string | null }));

  return (
    <>
      <Navbar />

      <header className="pt-35 pb-15 text-center max-w-[800px] mx-auto px-6">
        <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] mb-4 tracking-tight">思考与产品思路</h1>
        <p className="text-lg text-brown-muted max-w-[500px] mx-auto">
          关于产品、设计与生活的独立思考。记录灵感、沉淀观点。
        </p>
      </header>

      {/* Pinned */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-15 pb-20">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brown-warm tracking-wide uppercase mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>
          置顶精选
        </div>

        <FadeIn>
          <CardWrapper id={displayPinned.id} className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] bg-white rounded-2xl overflow-hidden border border-brown-light/20 hover:shadow-[0_16px_48px_rgba(61,43,31,0.1)] hover:-translate-y-0.5 transition-all">
            <div className="aspect-[4/3] bg-gradient-to-br from-surface via-[#D4C4B0] to-brown-light flex items-center justify-center text-white">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div className="p-10 lg:p-12 flex flex-col justify-center">
              <span className="inline-block px-3.5 py-1 bg-accent-soft text-accent rounded-full text-xs font-semibold mb-4 w-fit">{displayPinned.tag}</span>
              <h2 className="text-2xl lg:text-3xl mb-4 leading-snug">{displayPinned.title}</h2>
              <p className="text-sm text-brown-muted leading-relaxed mb-6">{displayPinned.excerpt}</p>
              <div className="text-xs text-brown-light flex gap-4">
                <span>{displayPinned.date}</span>
                <span>{displayPinned.readTime}</span>
              </div>
            </div>
          </CardWrapper>
        </FadeIn>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-15">
        <div className="flex gap-1 bg-surface rounded-full p-1 w-fit mx-auto mb-15">
          {["最近", "热门", "最受欢迎"].map((tab, i) => (
            <button
              key={tab}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all border-none font-sans cursor-pointer ${
                i === 0
                  ? "bg-white text-brown-deep shadow-sm"
                  : "bg-transparent text-brown-muted hover:text-brown-deep"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-15 pb-30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayArticles.map((article, idx) => (
          <FadeIn key={article.id ?? `${article.title}-${idx}`}>
            <CardWrapper id={article.id} className="block bg-white rounded-2xl overflow-hidden border border-brown-light/15 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(61,43,31,0.1)] transition-all">
              <div className="w-full aspect-[16/10] bg-gradient-to-br from-surface to-brown-light/40 flex items-center justify-center text-brown-light">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div className="p-6">
                <span className="inline-block px-2.5 py-0.5 bg-accent-soft text-accent rounded-full text-[0.7rem] font-semibold mb-2.5">{article.tag}</span>
                <h3 className="font-serif text-lg text-brown-deep mb-2.5 leading-snug">{article.title}</h3>
                <p className="text-sm text-brown-muted leading-relaxed line-clamp-3">{article.excerpt}</p>
                <div className="mt-4 pt-3.5 border-t border-brown-light/10 flex justify-between text-xs text-brown-light">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </CardWrapper>
          </FadeIn>
        ))}
      </section>

      <footer className="px-6 md:px-15 py-10 border-t border-brown-light/15 flex flex-col md:flex-row justify-between items-center text-xs text-brown-light gap-3">
        <span>&copy; 2025 DAY 1 Team</span>
        <Link href="/" className="text-brown-mid no-underline hover:text-brown-deep transition-colors">← 返回首页</Link>
      </footer>
    </>
  );
}
