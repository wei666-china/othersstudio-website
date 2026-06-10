"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Radio, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { logoutAction } from "../actions";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/articles", label: "文章管理", icon: FileText },
  { href: "/admin/updates", label: "动态管理", icon: Radio },
  { href: "/admin/settings", label: "网站设置", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#3D2B1F] text-white">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="font-serif text-xl font-bold no-underline text-white">
            DAY<span className="font-light opacity-70 ml-1">1</span>
          </Link>
          <p className="text-xs text-white/40 mt-1">管理后台</p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm no-underline transition-colors ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full cursor-pointer bg-transparent border-none font-sans"
            >
              <LogOut size={18} />
              退出登录
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#3D2B1F] text-white px-4 py-3 flex items-center justify-between">
        <span className="font-serif font-bold">DAY 1 管理</span>
        <div className="flex gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg no-underline transition-colors ${isActive ? "bg-white/10 text-white" : "text-white/60"}`}
              >
                <Icon size={18} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 pt-16 lg:pt-0 overflow-auto">
        <div className="p-6 lg:p-10 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
