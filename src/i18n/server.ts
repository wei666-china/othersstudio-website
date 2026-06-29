/**
 * 服务端读取当前 locale（从 cookie）。供根 layout 与服务端页面使用。
 */

import { cookies } from "next/headers";
import {
  type Locale,
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  translate,
} from "./messages";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value as Locale | undefined;
  return value && LOCALES.includes(value) ? value : DEFAULT_LOCALE;
}

/** 服务端取词：在服务端组件里直接翻译门面文案。 */
export async function getServerT(): Promise<(key: string) => string> {
  const locale = await getLocale();
  return (key: string) => translate(locale, key);
}
