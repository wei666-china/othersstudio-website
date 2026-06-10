import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理后台 — DAY 1",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      {children}
    </div>
  );
}
