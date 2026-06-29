"use client";

/**
 * Reveal — 比 FadeIn 更精细的滚动揭示动效，统一走 motion language。
 *
 * 支持从不同方向进入（up / left / right / scale），用于 Hero、数据卡等需要
 * "克制但有方向感"的元素。一组子项可用 index 做交错（stagger）。
 * 完全遵守 prefers-reduced-motion：开启时直接显示、无位移。
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

type Direction = "up" | "left" | "right" | "scale";

const hidden: Record<Direction, string> = {
  up: "opacity-0 translate-y-8",
  left: "opacity-0 -translate-x-8",
  right: "opacity-0 translate-x-8",
  scale: "opacity-0 scale-[0.96]",
};

export default function Reveal({
  children,
  className = "",
  direction = "up",
  index = 0,
  step = 90,
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  /** 交错序号，配合 step 形成依次进入 */
  index?: number;
  /** 每个序号的间隔毫秒 */
  step?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setReduced(true);
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={
        reduced
          ? undefined
          : {
              transitionProperty: "opacity, transform",
              transitionDuration: "var(--dur-slow)",
              transitionTimingFunction: "var(--ease-out-soft)",
              transitionDelay: `${index * step}ms`,
            }
      }
      className={`${visible ? "opacity-100 translate-x-0 translate-y-0 scale-100" : hidden[direction]} ${className}`}
    >
      {children}
    </div>
  );
}
