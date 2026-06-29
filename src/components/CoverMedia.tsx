/**
 * CoverMedia — 文章/卡片封面的统一渲染器。
 *
 * 根据 resolveCover 把 cover_url 解析为「真实图片」或「品牌图案」，
 * 在前台四处（首页、列表置顶卡、列表文章卡、详情页）统一渲染，
 * 替代过去各处重复的 “有图就 img、否则 BrandCover” 二元判断。
 */

import BrandCover from "@/components/BrandCover";
import { resolveCover } from "@/lib/covers";

type CoverMediaProps = {
  cover?: string | null;
  /** 品牌图案缺省时用于派生纹理变化 */
  seed?: string | number;
  /** 品牌图案左下角标签（如文章 tag） */
  label?: string | null;
  alt?: string;
  /** 真实图片是否在父级 hover 时轻微放大（卡片用） */
  zoomOnHover?: boolean;
};

export default function CoverMedia({
  cover,
  seed = "day1",
  label,
  alt = "",
  zoomOnHover = false,
}: CoverMediaProps) {
  const resolved = resolveCover(cover);

  if (resolved.kind === "image") {
    return (
      <>
        <img
          src={resolved.url}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover ${
            zoomOnHover
              ? "transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(41,32,26,0.30)] via-transparent to-transparent mix-blend-multiply" />
      </>
    );
  }

  return (
    <div
      className={`absolute inset-0 ${
        zoomOnHover
          ? "transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          : ""
      }`}
    >
      <BrandCover seed={seed} label={label} variant={resolved.palette} />
    </div>
  );
}
