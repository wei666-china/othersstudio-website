"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t, locale, setLocale } = useLocale();

  const links = [
    { href: "/thoughts", label: t("nav.thoughts") },
    { href: "/updates", label: t("nav.updates") },
    { href: "/#product", label: t("nav.product") },
    { href: "/#team", label: t("nav.team") },
  ];

  const toggleLocale = () => setLocale(locale === "zh" ? "en" : "zh");

  return (
    <nav className="fixed top-0 left-0 right-0 z-100 px-6 md:px-15 h-16 flex items-center justify-between backdrop-blur-xl bg-bg/85 border-b border-border transition-all">
      <Link
        href="/"
        aria-label="DAY 1 — 返回首页"
        className="inline-flex items-center no-underline"
        onClick={() => setOpen(false)}
      >
        {/* 品牌 3D Logo（橙→粉红渐变立体字，透明底）。装饰性图片，普通 img 即可 */}
        <img
          src="/brand/day1-logo-3d.png"
          alt="DAY 1"
          className="h-8 w-auto select-none"
          draggable={false}
        />
      </Link>

      <div className="flex items-center gap-8">
        <ul className="hidden md:flex gap-8 list-none">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`no-underline text-sm font-medium tracking-wide transition-colors relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:h-[1.5px] after:w-full after:bg-accent after:origin-left after:transition-transform after:duration-300 ${
                  pathname === link.href
                    ? "text-text font-semibold after:scale-x-100"
                    : "text-text-mid hover:text-text after:scale-x-0 hover:after:scale-x-100"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={toggleLocale}
          aria-label="切换语言 / Switch language"
          className="hidden sm:inline-flex items-center justify-center min-w-9 h-9 px-2.5 rounded-full border border-border-strong text-xs font-semibold text-text-mid no-underline hover:border-ink hover:bg-surface transition-all cursor-pointer"
        >
          {t("lang.switch")}
        </button>

        <Link
          href="/me/developer"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border-strong text-sm font-medium text-text no-underline hover:border-ink hover:bg-surface transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          {t("nav.developer")}
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={t("nav.menu")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 -mr-1 rounded-full text-text hover:bg-surface transition-colors"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          )}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-bg/95 backdrop-blur-xl border-b border-border px-6 py-5 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`no-underline text-base font-medium py-2.5 px-2 rounded-lg transition-colors ${
                pathname === link.href ? "text-text bg-surface" : "text-text-mid hover:text-text hover:bg-surface"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/me/developer"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center gap-2 px-2 py-2.5 text-base font-medium text-accent-deep no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
            {t("nav.developer")}
          </Link>
          <button
            type="button"
            onClick={() => {
              toggleLocale();
              setOpen(false);
            }}
            className="mt-1 inline-flex items-center gap-2 px-2 py-2.5 text-base font-medium text-text-mid no-underline cursor-pointer text-left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            {locale === "zh" ? "English" : "中文"}
          </button>
        </div>
      )}
    </nav>
  );
}
