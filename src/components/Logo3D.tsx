"use client";

/**
 * Logo3D —— 官网版「DAY 1」3D 立体 Logo（对齐 App 的 Logo3DView）。
 *
 * 模型来源：App 同款 DAY1_Logo.usdz 转出的 DAY1_Logo.glb（public/models/）。
 * 渲染：Google <model-viewer>（web component）——正面小幅左右摆动（不整圈自转，
 * 避免转到背面露出镜像反字）+ 鼠标/手指可拖拽，透明背景融进深色卡片。
 * 朝向与橙→粉红渐变材质已在 glb 里「烘焙」好（复刻 App 的 pitch -90° + yaw 180°，
 * 金属感 0.3 / 粗糙度 0.5），无需运行时改色。
 *
 * 加载策略：model-viewer 脚本仅在组件进入视口时动态 import（不拖慢首屏），
 * 加载中显示品牌占位；尊重 prefers-reduced-motion（关闭摆动，固定正面）。
 */

import { useEffect, useRef, useState } from "react";

// App 的渐变色（取自 Logo3DView.makeGradientImage）：橙 → 粉红
const GRAD_FROM = "#FF7326"; // rgb(255,115,38)
const GRAD_TO = "#F24059"; // rgb(242,64,89)

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Logo3D({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mvRef = useRef<HTMLElement>(null); // <model-viewer> 元素
  const [ready, setReady] = useState(false); // model-viewer 脚本已加载
  const [loaded, setLoaded] = useState(false); // 模型已渲染完成
  const reduced = typeof window !== "undefined" && prefersReducedMotion();

  // 进入视口后再动态加载 model-viewer 脚本（避免拖慢首屏）
  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    let cancelled = false;

    const start = () => {
      import("@google/model-viewer")
        .then(() => {
          if (!cancelled) setReady(true);
        })
        .catch(() => {
          /* 加载失败时静默：保留占位，不报错 */
        });
    };

    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          start();
          ob.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    ob.observe(node);
    return () => {
      cancelled = true;
      ob.disconnect();
    };
  }, []);

  // model-viewer 的「加载完成」事件用 React onLoad 抓不稳，改用原生监听 +
  // 兜底超时，确保占位文字加载后一定被移除（不再透出成背景水印）。
  useEffect(() => {
    if (!ready) return;
    const el = mvRef.current as (HTMLElement & { loaded?: boolean }) | null;
    if (!el) return;
    if (el.loaded) {
      setLoaded(true);
      return;
    }
    const onModelLoad = () => setLoaded(true);
    el.addEventListener("load", onModelLoad);
    const fallback = window.setTimeout(() => setLoaded(true), 3500);
    return () => {
      el.removeEventListener("load", onModelLoad);
      window.clearTimeout(fallback);
    };
  }, [ready]);

  // 正面小幅左右摆动（替代整圈自转）：用 rAF 缓慢改变相机水平角，phi 固定正面，
  // 所以永远不会转到背面露出镜像字。用户拖拽时暂停，松手后平滑续上。
  // reduced-motion 下整个效果不启用 → 静止正面。
  useEffect(() => {
    if (!ready || reduced) return;
    const el = mvRef.current as (HTMLElement & { cameraOrbit?: string }) | null;
    if (!el) return;

    const AMP = 20; // 摆动幅度：正面 ±20°
    const PERIOD = 8000; // 一个来回约 8s（克制、缓慢）
    const t0 = performance.now();
    let raf = 0;
    let dragging = false;

    const tick = (now: number) => {
      if (!dragging) {
        // 正面在 180°（0° 是镜像背面），围绕 180° 小幅摆动
        const theta = 180 + AMP * Math.sin(((now - t0) / PERIOD) * Math.PI * 2);
        el.cameraOrbit = `${theta.toFixed(2)}deg 90deg 90%`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onDown = () => {
      dragging = true;
    };
    const onUp = () => {
      dragging = false;
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [ready, reduced]);

  return (
    <div ref={hostRef} className={`relative w-full h-full ${className}`}>
      {/* 背景：与 App 一致的暖色氛围光晕（给 logo 一层暖色背光，更立体） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 46%, rgba(255,107,53,0.22) 0%, rgba(255,107,53,0.06) 38%, transparent 64%)`,
        }}
      />

      {ready ? (
        // @ts-expect-error -- <model-viewer> 是运行时注册的自定义元素，无 JSX 类型
        <model-viewer
          ref={mvRef}
          src="/models/DAY1_Logo.glb?v=2"
          alt="DAY 1 立体 Logo"
          camera-controls
          disable-zoom
          disable-pan
          interaction-prompt="none"
          camera-orbit="180deg 90deg 90%"
          min-camera-orbit="90deg 90deg auto"
          max-camera-orbit="270deg 90deg auto"
          exposure="1.15"
          shadow-intensity="0"
          environment-image="neutral"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            "--poster-color": "transparent",
          }}
        />
      ) : null}

      {/* 加载中/未就绪占位：低调的 DAY 1 字样，与卡片基调一致 */}
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-serif select-none leading-none"
            style={{
              fontSize: "clamp(3rem, 13vw, 6.5rem)",
              letterSpacing: "-0.03em",
              background: `linear-gradient(135deg, ${GRAD_FROM}, ${GRAD_TO})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              opacity: ready ? 0.18 : 0.32,
              transition: "opacity var(--dur-slow) var(--ease-out-soft)",
            }}
          >
            DAY<span style={{ fontWeight: 300 }}>1</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
