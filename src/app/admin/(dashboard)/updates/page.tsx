import { supabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { UpdateActions } from "./components";

export default async function UpdatesPage() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");

  let updates: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("website_updates")
      .select("*")
      .order("created_at", { ascending: false });
    updates = data || [];
  } catch {}

  const typeLabels: Record<string, string> = {
    "app-update": "App 更新",
    "photo": "照片",
    "thought": "产品感想",
  };

  const typeColors: Record<string, string> = {
    "app-update": "bg-orange-50 text-orange-700",
    "photo": "bg-[#5C3D2E]/8 text-[#5C3D2E]",
    "thought": "bg-[#C9A88C]/20 text-[#6B4E3D]",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#3D2B1F] mb-1">动态管理</h1>
          <p className="text-sm text-[#A08060]">{updates.length} 条动态</p>
        </div>
        <Link
          href="/admin/updates/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D2B1F] text-white text-sm font-medium rounded-xl no-underline hover:bg-[#5C3D2E] transition-colors"
        >
          <Plus size={16} /> 发动态
        </Link>
      </div>

      {updates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#C9A88C]/15">
          <p className="text-[#A08060] mb-4">还没有动态</p>
          <Link href="/admin/updates/new" className="text-sm text-[#5C3D2E] font-medium no-underline hover:underline">
            发第一条 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => (
            <div key={update.id} className="bg-white rounded-xl p-5 border border-[#C9A88C]/15 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${typeColors[update.type] || ""}`}>
                    {typeLabels[update.type] || update.type}
                  </span>
                  <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${
                    update.status === "published" ? "bg-green-50 text-green-700" : "bg-[#E8DDD3] text-[#6B4E3D]"
                  }`}>
                    {update.status === "published" ? "已发布" : "草稿"}
                  </span>
                  {update.version && <span className="text-[0.65rem] text-[#C9A88C]">{update.version}</span>}
                </div>
                <h3 className="text-sm font-medium text-[#3D2B1F] truncate">{update.title}</h3>
              </div>
              <UpdateActions id={update.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
