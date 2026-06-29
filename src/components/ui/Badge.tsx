/**
 * Badge — 统一的素雅小标签（透明底 + 细边框 + 中性文字）。
 * 与前面统一的文章 tag 样式保持一致，供首页/列表/详情等处复用。
 */

import type { ReactNode } from "react";

type Size = "sm" | "md";

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-0.5 text-[0.7rem]",
  md: "px-3 py-1 text-xs",
};

export default function Badge({
  size = "md",
  className = "",
  children,
}: {
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center border border-border-strong text-text-mid rounded-full font-medium tracking-wide ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
