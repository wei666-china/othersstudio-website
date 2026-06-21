"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

const PRODUCTION_SITE_URL = "https://othersstudio.tech";

function getSiteUrl() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredSiteUrl) return configuredSiteUrl;

  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return window.location.origin;
  }

  return PRODUCTION_SITE_URL;
}

function getSafeNextPath() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") ?? "/me";
  return next.startsWith("/me") ? next : "/me";
}

export default function MeLoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOAuth(provider: "apple" | "google") {
    setLoading(provider);
    setError(null);

    const supabase = createClient();
    const callbackUrl = new URL("/me/auth/callback", getSiteUrl());
    callbackUrl.searchParams.set("next", getSafeNextPath());

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-[#3D2B1F] mb-3">DAY 1</h1>
          <p className="text-base text-[#6B4E3D] leading-relaxed">
            用你在 App 中的账号登录，管理 API Key
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#C9A88C]/15">
          {error && (
            <p className="mb-4 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg text-center">
              登录失败：{error}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => handleOAuth("apple")}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-[#3D2B1F] text-white font-medium text-sm transition-colors hover:bg-[#5C3D2E] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {loading === "apple" ? "正在跳转..." : "通过 Apple 登录"}
            </button>

            <button
              onClick={() => handleOAuth("google")}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white text-[#3D2B1F] font-medium text-sm border border-[#C9A88C]/30 transition-colors hover:bg-[#FAF6F1] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {loading === "google" ? "正在跳转..." : "通过 Google 登录"}
            </button>
          </div>

          <p className="mt-6 text-xs text-center text-[#A08060]">
            请使用与 App 相同的 Apple / Google 账号
          </p>
        </div>
      </div>
    </div>
  );
}
