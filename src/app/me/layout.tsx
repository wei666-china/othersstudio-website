import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { signOutAction } from "./developer/actions";
import { getLocale } from "@/i18n/server";
import LocaleSwitchButton from "@/components/LocaleSwitchButton";

export default async function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const locale = await getLocale();
  const isEn = locale === "en";

  // 未登录时不渲染外壳（登录页是 /me/login，不经过此 layout 的 user 分支展示）
  if (!user) {
    return <>{children}</>;
  }

  const email = user.email ?? (isEn ? "Signed in" : "已登录");

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <header className="sticky top-0 z-10 bg-[#FAF6F1]/85 backdrop-blur border-b border-[#C9A88C]/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/me"
            className="font-serif text-lg text-[#3D2B1F] hover:text-[#5C3D2E] transition-colors"
          >
            DAY 1
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/me/developer"
              className="text-sm text-[#6B4E3D] hover:text-[#3D2B1F] transition-colors"
            >
              API Key
            </Link>
            <span className="hidden sm:inline text-xs text-[#A08060] max-w-[180px] truncate">
              {email}
            </span>
            <LocaleSwitchButton />
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-xs text-[#A08060] hover:text-red-600 transition-colors cursor-pointer"
              >
                {isEn ? "Sign out" : "退出"}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
