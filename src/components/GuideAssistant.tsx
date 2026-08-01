"use client";

/**
 * GuideAssistant —— 全站右下角「DAY 1 助手」浮层。
 *
 * 纯预设：基于 lib/guide-faq 的关键词匹配回答关于产品/功能/接入的问题，
 * 不调真 AI（零成本、即时、可控），命中后用打字机逐字呈现并给出跳转。
 * 中英双语，尊重 prefers-reduced-motion；收起时仅余一个按钮，绝不全屏拦截触摸。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  FAQ_ITEMS,
  GUIDE_UI,
  QUICK_IDS,
  matchFAQ,
  type FAQItem,
  type Lang,
} from "@/lib/guide-faq";

type Msg = {
  id: number;
  role: "user" | "assistant";
  text: string;
  link?: { href: string; label: string };
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function GuideAssistant() {
  const { locale } = useLocale();
  const lang: Lang = locale === "en" ? "en" : "zh";
  const ui = GUIDE_UI[lang];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typingId, setTypingId] = useState<number | null>(null);
  const [typedLen, setTypedLen] = useState(0);

  const idRef = useRef(0);
  const typeRaf = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const nextId = () => (idRef.current += 1);

  const quickItems = useMemo(
    () => QUICK_IDS.map((id) => FAQ_ITEMS.find((f) => f.id === id)).filter(Boolean) as FAQItem[],
    []
  );

  // 首次打开注入欢迎语
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: nextId(), role: "assistant", text: ui.welcome }]);
    }
    if (!open) return;
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 320);
    return () => clearTimeout(focusTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 新消息平滑滚到底；打字过程中即时贴底（避免每帧重启一次 smooth 滚动动画）
  useEffect(() => {
    const el = scrollRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [messages]);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typedLen]);

  useEffect(() => () => { if (typeRaf.current !== null) cancelAnimationFrame(typeRaf.current); }, []);

  // 打字机：rAF 按逝去时间推进（约 16ms/字），每帧至多一次状态更新
  const typeOut = useCallback((msgId: number, text: string) => {
    if (typeRaf.current !== null) cancelAnimationFrame(typeRaf.current);
    if (prefersReducedMotion()) {
      setTypingId(null);
      return;
    }
    setTypingId(msgId);
    setTypedLen(0);
    const start = performance.now();
    const tick = (now: number) => {
      const i = Math.min(text.length, Math.floor((now - start) / 16));
      setTypedLen(i);
      if (i >= text.length) {
        typeRaf.current = null;
        setTypingId(null);
        return;
      }
      typeRaf.current = requestAnimationFrame(tick);
    };
    typeRaf.current = requestAnimationFrame(tick);
  }, []);

  const ask = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      const userMsg: Msg = { id: nextId(), role: "user", text };

      const hit = matchFAQ(text);
      let answer: string;
      let link: Msg["link"];
      if (hit) {
        answer = hit.answer[lang];
        if (hit.link) link = { href: hit.link.href, label: hit.link.label[lang] };
      } else {
        answer = ui.fallback;
      }
      const aiMsg: Msg = { id: nextId(), role: "assistant", text: answer, link };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
      typeOut(aiMsg.id, answer);
    },
    [lang, ui.fallback, typeOut]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
    setInput("");
  };

  const hasUserMsg = messages.some((m) => m.role === "user");
  const showQuick = !hasUserMsg && typingId === null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden">
      {/* 面板：浮在按钮上方，收起时 pointer-events-none，不拦截触摸 */}
      <div
        role="dialog"
        aria-label={ui.title}
        aria-hidden={!open}
        className={`absolute bottom-[calc(100%+0.875rem)] right-0 w-[min(360px,calc(100vw-2.5rem))] origin-bottom-right rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-12px_var(--c-shadow-strong)] overflow-hidden transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] ${
          open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        {/* header —— 纸色克制基调 + 品牌 3D Logo 小头像（不再是深色客服条） */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-surface border-b border-border">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent-soft overflow-hidden">
            <img
              src="/brand/day1-logo-3d.png"
              alt="DAY 1"
              className="h-6 w-6 object-contain select-none"
              draggable={false}
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[0.95rem] font-semibold leading-tight text-text">{ui.title}</div>
            <div className="text-[11px] text-text-muted leading-tight mt-0.5">{ui.subtitle}</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-bg-alt transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="h-[min(56vh,420px)] overflow-y-auto px-4 py-4 flex flex-col gap-3.5 bg-bg">
          {messages.map((m, i) => {
            const isTyping = m.id === typingId;
            const shown = isTyping ? m.text.slice(0, typedLen) : m.text;
            if (m.role === "user") {
              return (
                <div key={m.id} className="self-end max-w-[82%] rounded-2xl rounded-br-md bg-ink text-on-ink px-3.5 py-2 text-sm leading-relaxed">
                  {m.text}
                </div>
              );
            }
            // 首条 assistant（欢迎语）带品牌起手式：小 Logo + 在线状态点（不重复 header 标题）
            const isWelcome = i === 0;
            return (
              <div key={m.id} className="self-start max-w-[90%] flex flex-col gap-2">
                {isWelcome && (
                  <div className="flex items-center gap-2 pl-0.5 mb-0.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-soft overflow-hidden">
                      <img src="/brand/day1-logo-3d.png" alt="" aria-hidden="true" className="h-4 w-4 object-contain" draggable={false} />
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-text-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3FB984] motion-safe:animate-pulse" />
                      {ui.status}
                    </span>
                  </div>
                )}
                <div className="rounded-2xl rounded-bl-md bg-surface border border-border/70 px-3.5 py-2.5 text-sm leading-relaxed text-text-mid shadow-[0_1px_2px_var(--c-shadow)]">
                  {shown}
                  {isTyping && <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[2px] rounded-full bg-accent align-middle motion-safe:animate-pulse" />}
                </div>
                {m.link && !isTyping && (
                  <a
                    href={m.link.href}
                    onClick={() => setOpen(false)}
                    className="group/link self-start inline-flex items-center gap-1.5 rounded-full bg-accent-soft border border-accent/20 px-3 py-1.5 text-xs font-medium text-accent-deep hover:bg-accent/15 transition-colors"
                  >
                    {m.link.label}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-[var(--dur-fast)] group-hover/link:translate-x-0.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            );
          })}

          {/* 快捷问题（仅初始）—— 轻量条目，左侧细竖条引导 */}
          {showQuick && (
            <div className="mt-1.5 flex flex-col gap-1.5">
              <div className="text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-text-soft px-1 mb-0.5">{ui.quickTitle}</div>
              {quickItems.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => ask(f.question[lang])}
                  className="group/q self-stretch text-left rounded-xl px-3 py-2.5 text-sm text-text-mid bg-surface/60 border border-transparent hover:border-border hover:bg-surface hover:text-text transition-all duration-[var(--dur-fast)] flex items-center gap-2.5"
                >
                  <span className="h-3.5 w-[2px] rounded-full bg-border-strong group-hover/q:bg-accent transition-colors duration-[var(--dur-fast)]" />
                  {f.question[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* input */}
        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border bg-surface px-3 py-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ui.placeholder}
            className="flex-1 min-w-0 h-10 rounded-full border border-border bg-bg px-4 text-sm text-text placeholder:text-text-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft transition-all duration-[var(--dur-fast)]"
          />
          <button
            type="submit"
            aria-label={ui.send}
            disabled={!input.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ink text-on-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent active:scale-95 transition-all duration-[var(--dur-fast)]"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>

      {/* launcher / toggle —— 深色胶囊（纸色页面上的克制锚点）+ 品牌 Logo 小头像 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={ui.title}
        className="group inline-flex items-center gap-2.5 rounded-full bg-ink text-on-ink pl-2 pr-4 h-12 shadow-[0_10px_30px_-8px_var(--c-shadow-strong)] hover:scale-[1.03] active:scale-95 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-spring)]"
      >
        {open ? (
          <span className="flex h-8 w-8 items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </span>
        ) : (
          <>
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-on-ink/10 overflow-hidden">
              <img
                src="/brand/day1-logo-3d.png"
                alt=""
                aria-hidden="true"
                className="h-5 w-5 object-contain select-none"
                draggable={false}
              />
            </span>
            <span className="text-sm font-medium">{ui.launcher}</span>
          </>
        )}
      </button>
    </div>
  );
}
