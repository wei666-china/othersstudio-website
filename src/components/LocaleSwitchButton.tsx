"use client";

import { useLocale } from "@/i18n/LocaleProvider";

/**
 * 独立的语言切换按钮（供开发者门户 /me 顶部栏使用）。
 * 复用全站 LocaleProvider：点击写 NEXT_LOCALE cookie 并刷新，行为与首页导航栏一致。
 * 样式走门户暖色调，与 me/layout 顶部栏统一。
 */
export default function LocaleSwitchButton() {
  const { t, locale, setLocale } = useLocale();
  const toggleLocale = () => setLocale(locale === "zh" ? "en" : "zh");

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label="切换语言 / Switch language"
      className="inline-flex items-center justify-center min-w-8 h-8 px-2.5 rounded-full border border-[#C9A88C]/40 text-xs font-semibold text-[#6B4E3D] hover:border-[#3D2B1F] hover:bg-white/60 transition-all cursor-pointer"
    >
      {t("lang.switch")}
    </button>
  );
}
