"use client";

import { useEffect, useState } from "react";

/**
 * usePrefersReducedMotion —— 水合安全的 prefers-reduced-motion 侦测。
 *
 * SSR 与首帧一律返回 false（与服务端一致，避免水合不匹配），
 * 挂载后读取真实值并监听系统设置变化。
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
