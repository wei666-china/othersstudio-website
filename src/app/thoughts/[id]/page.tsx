import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import BrandCover from "@/components/BrandCover";
import { resolveCover } from "@/lib/covers";
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
  const cover = resolveCover(article.cover_url);
  const paragraphs = (article.content || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Navbar />

      <article className="max-w-[720px] mx-auto px-6 pt-36 pb-28">
        <FadeIn>
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link
              href="/thoughts"
              className="group inline-flex items-center gap-1.5 text-sm text-text-mid no-underline hover:text-text transition-colors"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </span>
              返回思考列表
            </Link>

            <span className="inline-flex items-center px-3 py-1 border border-border-strong text-text-mid rounded-full text-xs font-medium tracking-wide">
              {article.tag}
            </span>
          </div>

          <h1 className="text-[clamp(2rem,4.4vw,3rem)] leading-[1.16] mb-6 tracking-[-0.02em]">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-text-soft font-mono mb-12">
            <span>{formatDate(article.published_at)}</span>
            <span className="w-1 h-1 rounded-full bg-text-soft/50" />
            <span>{readTime}</span>
          </div>

          {cover.kind === "image" ? (
            <div className="w-full aspect-[16/9] relative rounded-2xl overflow-hidden mb-14 border border-border">
              <Image
                src={cover.url}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 720px) 100vw, 720px"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-14 border border-border">
              <BrandCover seed={`cover-${article.id}`} label={article.tag} variant={cover.palette} />
            </div>
          )}
        </FadeIn>

        <FadeIn>
          <div className="text-[1.075rem] text-text-mid leading-[1.92] [&_p+p]:mt-6">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-text-muted italic">这篇文章还没有正文内容。</p>
            )}
          </div>
        </FadeIn>

        <FadeIn>
          <div className="mt-16 pt-8 border-t border-border">
            <Link
              href="/thoughts"
              className="group inline-flex items-center gap-1.5 text-sm text-text-mid no-underline hover:text-text transition-colors"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </span>
              返回思考列表
            </Link>
          </div>
        </FadeIn>
      </article>

      <Footer />
    </>
  );
}
