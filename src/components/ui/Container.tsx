/**
 * Container — 统一的内容宽度容器 + 水平内边距。
 * 全站区块的最大宽度收口在这里，避免各页重复写 max-w-[...] mx-auto px-6 md:px-15。
 */

import type { ReactNode } from "react";

type Width = "default" | "narrow" | "wide";

const widths: Record<Width, string> = {
  narrow: "max-w-[820px]",
  default: "max-w-[1200px]",
  wide: "max-w-[1280px]",
};

export default function Container({
  width = "default",
  className = "",
  children,
}: {
  width?: Width;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`${widths[width]} mx-auto px-6 md:px-15 ${className}`}>
      {children}
    </div>
  );
}
