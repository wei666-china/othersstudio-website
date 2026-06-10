import { supabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pin, Edit2, Trash2 } from "lucide-react";
import { ArticleActions } from "./components";

export default async function ArticlesPage() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");

  let articles: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("website_articles")
      .select("*")
      .order("created_at", { ascending: false });
    articles = data || [];
  } catch {}

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#3D2B1F] mb-1">文章管理</h1>
          <p className="text-sm text-[#A08060]">{articles.length} 篇文章</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D2B1F] text-white text-sm font-medium rounded-xl no-underline hover:bg-[#5C3D2E] transition-colors"
        >
          <Plus size={16} /> 写文章
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#C9A88C]/15">
          <p className="text-[#A08060] mb-4">还没有文章</p>
          <Link href="/admin/articles/new" className="text-sm text-[#5C3D2E] font-medium no-underline hover:underline">
            写第一篇 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl p-5 border border-[#C9A88C]/15 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {article.is_pinned && <Pin size={12} className="text-[#FF6B35]" />}
                  <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${
                    article.status === "published" ? "bg-green-50 text-green-700" : "bg-[#E8DDD3] text-[#6B4E3D]"
                  }`}>
                    {article.status === "published" ? "已发布" : "草稿"}
                  </span>
                  <span className="text-[0.65rem] text-[#C9A88C]">{article.tag}</span>
                </div>
                <h3 className="text-sm font-medium text-[#3D2B1F] truncate">{article.title}</h3>
                <p className="text-xs text-[#A08060] mt-1 truncate">{article.excerpt}</p>
              </div>
              <ArticleActions id={article.id} isPinned={article.is_pinned} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
