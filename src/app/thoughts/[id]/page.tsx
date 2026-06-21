import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import FadeIn from "@/components/FadeIn";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface Article {
  id: string;
  title: string;
  tag: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  published_at: string | null;
  view_count: number | null;
}

async function getArticle(id: string): Promise<Article | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("website_articles")
      .select("id,title,tag,excerpt,content,cover_url,published_at,view_count")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (error || !data) return null;
    return data as Article;
  } catch {
    return null;
  }
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ThoughtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) notFound();

  const readTime = `${Math.ceil((article.content?.length || 0) / 500)} 分钟阅读`;
  const paragraphs = (article.content || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Navbar />

      <article className="max-w-[760px] mx-auto px-6 pt-35 pb-30">
        <FadeIn>
          <Link
            href="/thoughts"
            className="inline-flex items-center gap-1.5 text-sm text-brown-mid no-underline hover:text-brown-deep transition-colors mb-8"
          >
            ← 返回思考列表
          </Link>

          <span className="inline-block px-3.5 py-1 bg-accent-soft text-accent rounded-full text-xs font-semibold mb-5">
            {article.tag}
          </span>

          <h1 className="text-[clamp(2rem,4vw,3rem)] leading-tight mb-5 tracking-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-brown-light mb-10">
            <span>{formatDate(article.published_at)}</span>
            <span>{readTime}</span>
          </div>

          {article.cover_url ? (
            <div className="w-full aspect-[16/9] relative rounded-2xl overflow-hidden mb-12 border border-brown-light/15">
              <Image
                src={article.cover_url}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 760px) 100vw, 760px"
              />
            </div>
          ) : (
            <div className="w-full aspect-[16/9] bg-gradient-to-br from-surface via-[#D4C4B0] to-brown-light rounded-2xl flex items-center justify-center text-white mb-12">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          )}
        </FadeIn>

        <FadeIn>
          <div className="text-[1.05rem] text-brown-mid leading-[1.9]">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} className="mb-6 whitespace-pre-line">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-brown-muted italic">这篇文章还没有正文内容。</p>
            )}
          </div>
        </FadeIn>

        <FadeIn>
          <div className="mt-16 pt-8 border-t border-brown-light/15">
            <Link
              href="/thoughts"
              className="text-sm text-brown-mid no-underline hover:text-brown-deep transition-colors"
            >
              ← 返回思考列表
            </Link>
          </div>
        </FadeIn>
      </article>

      <footer className="px-6 md:px-15 py-10 border-t border-brown-light/15 flex flex-col md:flex-row justify-between items-center text-xs text-brown-light gap-3">
        <span>&copy; 2025 DAY 1 Team</span>
        <Link
          href="/"
          className="text-brown-mid no-underline hover:text-brown-deep transition-colors"
        >
          ← 返回首页
        </Link>
      </footer>
    </>
  );
}
