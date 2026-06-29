/**
 * SectionHeading — 统一的区块标题 + 可选副文案。
 * 承载 Anthropic 气质的排版增强（更优雅的字距/行高），各区块复用保持一致节奏。
 * align: 左对齐（默认）或居中。
 */

import type { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
  descriptionClassName = "",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  descriptionClassName?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center mx-auto max-w-[42ch]" : ""} ${className}`}>
      {eyebrow ? (
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-text-muted mb-4">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-[clamp(2rem,4.2vw,3.1rem)] leading-[1.1] tracking-[-0.02em] text-text">
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base text-text-muted leading-relaxed ${
            centered ? "" : "max-w-[42ch]"
          } ${descriptionClassName}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
