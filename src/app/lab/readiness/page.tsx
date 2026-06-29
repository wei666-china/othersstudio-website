/**
 * /lab/readiness —— 原型/试验页（noindex，不进站点导航）。
 * 用来打磨「身体准备度」编辑式排版 + 滚动分段淡入，认可后再搬进首屏 hero。
 */

import ReadinessOrb from "@/components/ReadinessOrb";

export const metadata = {
  title: "Lab · Readiness Orb",
  robots: { index: false, follow: false },
};

// 标题渐变（取自 3D Logo 的橙→粉红），用来同时预览 hero 标题的新配色
const HEADLINE_GRADIENT = "linear-gradient(105deg, #FF7326 0%, #F24059 100%)";

export default async function ReadinessLabPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const initialPage = p ? parseInt(p, 10) || 0 : 0;
  return (
    <main className="relative min-h-[100dvh] flex items-center overflow-hidden px-6 md:px-16 py-24">
      {/* hero 同款暖色氛围光晕 */}
      <div className="absolute top-[-18%] right-[-12%] w-[64vw] max-w-[820px] aspect-square rounded-full bg-[radial-gradient(circle,var(--c-accent-soft)_0%,transparent_66%)] pointer-events-none" />
      <div className="absolute bottom-[-16%] left-[-14%] w-[46vw] max-w-[560px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(92,61,46,0.07)_0%,transparent_64%)] pointer-events-none" />

      <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[0.62rem] font-mono tracking-wide text-text-muted">
        LAB · 原型页（不会出现在正式站点）
      </div>

      <div className="relative w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center lg:items-start">
        {/* 左：标题配色预览 */}
        <div>
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-accent-deep mb-5">
            配色 / 动效预览
          </span>
          <h1 className="text-[clamp(2.75rem,6vw,4.9rem)] font-bold leading-[1.04] tracking-[-0.03em] text-text mb-7 max-w-[15ch]">
            Think Different,
            <br />
            Build{" "}
            <span
              className="italic font-medium"
              style={{
                backgroundImage: HEADLINE_GRADIENT,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Day One
            </span>
          </h1>
          <p className="text-lg text-text-muted max-w-[34rem] leading-relaxed">
            右侧为「身体准备度」原型（编辑式排版 + 横向翻页）：固定卡片框，内容像幻灯片一样左右翻页，
            用箭头或底部圆点手动切换；不再照搬 App 的圆环与 emoji。
          </p>
        </div>

        {/* 右：准备度原型 */}
        <div className="flex justify-center lg:justify-end">
          <ReadinessOrb initialPage={initialPage} />
        </div>
      </div>
    </main>
  );
}
