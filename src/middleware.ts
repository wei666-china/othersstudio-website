import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// 语言前缀路由：/en 或 /zh 仅用于"分享指定语言链接"。
// 命中后设置 NEXT_LOCALE cookie，并重写到去掉前缀的干净 URL（URL 不暴露 /en）。
const LOCALE_PREFIXES = ["en", "zh"] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 语言前缀处理（最前、独立于鉴权逻辑）
  const seg = pathname.split("/")[1];
  if ((LOCALE_PREFIXES as readonly string[]).includes(seg)) {
    const rest = pathname.slice(seg.length + 1) || "/";
    const url = request.nextUrl.clone();
    url.pathname = rest;
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", seg, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return response;
  }

  // 管理后台：原有密码 + HMAC Cookie 鉴权，保持不变
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const token = request.cookies.get(COOKIE_NAME)?.value;
    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!secret || !token || !(await verifyToken(token, secret))) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 用户中心：Supabase Auth 会话守卫
  if (pathname.startsWith("/me")) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 登录页与 OAuth 回调放行；其余 /me/* 未登录则跳登录页
    const isLoginRoute =
      pathname === "/me/login" || pathname.startsWith("/me/auth");

    if (!user && !isLoginRoute) {
      const loginUrl = new URL("/me/login", request.url);
      loginUrl.searchParams.set(
        "next",
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      );
      return NextResponse.redirect(loginUrl);
    }

    // 已登录访问登录页则跳回 /me
    if (user && pathname === "/me/login") {
      return NextResponse.redirect(new URL("/me", request.url));
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/me/:path*", "/en/:path*", "/en", "/zh/:path*", "/zh"],
};
