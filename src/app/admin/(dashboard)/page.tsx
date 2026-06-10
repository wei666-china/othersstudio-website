import { supabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Radio, Plus } from "lucide-react";

export default async function AdminDashboard() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");

  let articleCount = 0;
  let updateCount = 0;

  try {
    const { count: ac } = await supabaseAdmin
      .from("website_articles")
      .select("*", { count: "exact", head: true });
    articleCount = ac || 0;

    const { count: uc } = await supabaseAdmin
      .from("website_updates")
      .select("*", { count: "exact", head: true });
    updateCount = uc || 0;
  } catch {
    // Tables may not exist yet
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-[#3D2B1F] mb-2">管理后台</h1>
      <p className="text-sm text-[#A08060] mb-10">管理你的网站内容：文章、动态和照片。</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-[#C9A88C]/15">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F1] flex items-center justify-center">
              <FileText size={20} className="text-[#6B4E3D]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#3D2B1F]">{articleCount}</div>
              <div className="text-xs text-[#A08060]">篇文章</div>
            </div>
          </div>
          <Link href="/admin/articles" className="text-xs text-[#5C3D2E] font-medium no-underline hover:underline">
            管理文章 →
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#C9A88C]/15">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F1] flex items-center justify-center">
              <Radio size={20} className="text-[#6B4E3D]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#3D2B1F]">{updateCount}</div>
              <div className="text-xs text-[#A08060]">条动态</div>
            </div>
          </div>
          <Link href="/admin/updates" className="text-xs text-[#5C3D2E] font-medium no-underline hover:underline">
            管理动态 →
          </Link>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D2B1F] text-white text-sm font-medium rounded-xl no-underline hover:bg-[#5C3D2E] transition-colors"
        >
          <Plus size={16} /> 写文章
        </Link>
        <Link
          href="/admin/updates/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#3D2B1F] text-sm font-medium rounded-xl no-underline border border-[#C9A88C]/20 hover:bg-[#FAF6F1] transition-colors"
        >
          <Plus size={16} /> 发动态
        </Link>
      </div>
    </div>
  );
}
