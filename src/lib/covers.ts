/**
 * 封面来源的统一约定（前台渲染 + 后台选择器共用）。
 *
 * article.cover_url 是一个字符串，含义分三类：
 *   - 空字符串 / null         → 默认品牌图案（BrandCover warm，按 seed 变化）
 *   - "brand:<palette>"       → 指定配色的品牌图案（代码绘制，不占存储、不撞图）
 *   - "http..." / "/covers/.." → 真实图片（AI 生成的 Demo 图，或用户上传）
 */

import type { BrandPalette } from "@/components/BrandCover";

export type CoverKind =
  | { kind: "image"; url: string }
  | { kind: "brand"; palette: BrandPalette };

const BRAND_PREFIX = "brand:";

/** 把 cover_url 解析成前台可直接渲染的结构。空值回退到默认品牌图案。 */
export function resolveCover(coverUrl?: string | null): CoverKind {
  const v = (coverUrl || "").trim();
  if (!v) return { kind: "brand", palette: "warm" };
  if (v.startsWith(BRAND_PREFIX)) {
    const palette = v.slice(BRAND_PREFIX.length) as BrandPalette;
    return { kind: "brand", palette: palette || "warm" };
  }
  return { kind: "image", url: v };
}

/** 后台可选的品牌图案变体清单（值即写入 cover_url 的内容）。 */
export const BRAND_OPTIONS: { value: string; palette: BrandPalette; label: string }[] = [
  { value: "brand:warm", palette: "warm", label: "暖米" },
  { value: "brand:clay", palette: "clay", label: "陶土" },
  { value: "brand:sand", palette: "sand", label: "细沙" },
  { value: "brand:slate", palette: "slate", label: "岩灰" },
  { value: "brand:olive", palette: "olive", label: "橄榄" },
  { value: "brand:deep", palette: "deep", label: "深棕" },
];

/**
 * 后台可选的真实 Demo 封面清单（存于 public/covers/）。
 * 值即写入 cover_url 的内容（站内绝对路径，公开静态资源，大陆可达）。
 */
export const DEMO_COVERS: { value: string; label: string }[] = [
  { value: "/covers/demo-abstract-1.jpg", label: "暖光质感 1" },
  { value: "/covers/demo-abstract-2.jpg", label: "暖光质感 2" },
  { value: "/covers/demo-abstract-3.jpg", label: "暖光质感 3" },
  { value: "/covers/demo-fitness-1.jpg", label: "训练场景 1" },
  { value: "/covers/demo-fitness-2.jpg", label: "训练场景 2" },
  { value: "/covers/demo-fitness-3.jpg", label: "训练场景 3" },
];
