"use client";

/**
 * LocaleProvider + useT —— 轻量 i18n 的客户端入口。
 *
 * 当前 locale 由服务端（根 layout 读 cookie）注入 initialLocale，
 * 切换语言时写 cookie 并刷新，保证 SSR/CSR 一致、不闪烁。
 */

import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  type Locale,
  LOCALE_COOKIE,
  DEFAULT_LOCALE,
  translate,
} from "./messages";

type LocaleContextValue = {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (next: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      // 一年有效期的语言偏好 cookie
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    [router]
  );

  const t = useCallback((key: string) => translate(initialLocale, key), [initialLocale]);

  return (
    <LocaleContext.Provider value={{ locale: initialLocale, t, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // 容错：未包裹 Provider 时回退默认语言，避免崩溃
    return {
      locale: DEFAULT_LOCALE,
      t: (key: string) => translate(DEFAULT_LOCALE, key),
      setLocale: () => {},
    };
  }
  return ctx;
}

/** 便捷 hook：只取翻译函数。 */
export function useT(): (key: string) => string {
  return useLocale().t;
}
