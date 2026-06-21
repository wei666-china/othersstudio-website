import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "DAY 1 — 我的",
  description: "管理你的 API Key，让 AI Agent 读取你的健康数据",
};

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/me/login");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-2xl text-[#3D2B1F] mb-2">欢迎回来</h1>
      <p className="text-sm text-[#6B4E3D] mb-8">
        你已用 App 同款账号登录。在这里生成 API Key，让你的 AI Agent 安全读取你的健康数据。
      </p>

      <div className="bg-white rounded-2xl border border-[#C9A88C]/15 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-[#3D2B1F] flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#3D2B1F] mb-1">
              API Key 管理
            </h2>
            <p className="text-sm text-[#6B4E3D] mb-4">
              生成、查看和撤销你的 API Key，并查看接入文档。
            </p>
            <Link
              href="/me/developer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3D2B1F] text-white text-sm font-medium hover:bg-[#5C3D2E] transition-colors"
            >
              前往管理
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
