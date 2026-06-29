<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# FitTrack 官网/门户专属规则（③ othersstudio · Codex）

> **前置**：先读仓库根 `DAY 1/AGENTS.md`（工程全景、跨端铁律、安全红线）。本节只讲 **官网/开发者门户（③ 工作面）专属**内容。
>
> **它和 Cursor 规则的关系**：本节镜像 `.cursor/rules/fittrack-web.mdc`。改了规则记得两边同步。

## PART 0: 先认清「哪个是官网」（重要）

| 目录 | 状态 | 该不该改 |
|---|---|---|
| **`othersstudio/`** | **当前官网**，独立 GitHub 仓库（`othersstudio-website`），已上线 `othersstudio.tech` | ✅ 改这里 |
| `website-v2/` | 历史版本（已停更，非独立仓库） | ❌ 默认勿改 |
| `website/` | 更早的历史备份 | ❌ 默认勿改 |

**改 `othersstudio/` 的代码会推上线、影响真实访客和开发者门户用户**。重大改动先确认（根 AGENTS 铁律 2）。

## PART 1: 门户结构认知

技术栈：Next.js（App Router）+ Supabase（`@supabase/ssr`）+ Cloudflare（OpenNext 部署）。

| 模块 | 位置 | 说明 |
|---|---|---|
| 公开页 | `src/app/page.tsx`、`src/app/thoughts/`、`src/app/updates/` | 官网首页、文章、更新日志 |
| 用户中心 | `src/app/me/` | 登录、开发者门户（API key 管理） |
| 开发者门户 | `src/app/me/developer/` | `actions.ts`（key CRUD）、docs |
| admin 后台 | `src/app/admin/` | 文章/更新管理（受保护） |
| Supabase 客户端 | `src/lib/supabase-server.ts`（SSR）、`supabase-browser.ts`、`supabase.ts` | |
| 中间件 | `src/middleware.ts` | session 刷新 |

> **写代码前必读**本文件顶部的 Next.js 提示：这是改过的 Next.js 版本，API/约定可能与训练数据不同，需先看 `node_modules/next/dist/docs/`。

## PART 2: 鉴权与用户隔离（安全核心）

参照 `src/app/me/developer/actions.ts` 的既定模式，**每个涉及用户数据的 Server Action 必须**：

```ts
"use server";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function doSomething() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/me/login");          // ① 校验登录态

  const { data } = await supabase
    .from("xxx")
    .select("...")
    .eq("user_id", user.id);                  // ② 用户隔离，防越权
}
```

**铁律**：
- **① 登录校验**：用 `supabase.auth.getUser()`（不是只读 cookie），未登录 `redirect` 到登录页
- **② 用户隔离**：所有用户数据的 select/update/delete 都带 `.eq("user_id", user.id)`——这是防越权的命门，**一处遗漏就是漏洞**
- 输入校验：表单输入做长度/空值校验（如 key 名 ≤50 字符）再落库
- 错误处理：`console.error` 记录，对用户返回友好中文提示，不泄漏内部错误细节

## PART 3: API Key 安全（门户签发，对外使用）

门户是 `d1_sk_` key 的**签发方**，后端（②）和 Skill（④）是消费方。三者必须一致。

- **明文只返回一次**：生成时 `crypto.getRandomValues` 造 `d1_sk_<hex>`，返回给用户**仅此一次**
- **库里只存哈希 + prefix**：存 SHA-256 `key_hash` 和 `key_prefix`（前 10 位用于展示），**绝不存明文**
- **撤销 = 软关闭**：`is_active = false`，不物理删除
- **配额上限**：每用户活跃 key 数有上限（现为 5）；`monthly_limit` 默认值与后端鉴权一致
- key 的哈希算法（SHA-256）必须与后端 `validate-key.ts` 完全一致，否则签发的 key 无法通过鉴权

## PART 4: 环境变量与部署

- **`.env*` 不入库**（`.gitignore` 已排除）。**这是公开 GitHub 仓库，泄漏密钥 = 公开泄漏**
- `NEXT_PUBLIC_` 前缀的变量会**打进客户端 bundle**，只放可公开的（如 anon key、URL）；service role key 等机密**绝不加** `NEXT_PUBLIC_`
- `supabase-server.ts` 用 anon key + cookie（受 RLS 约束）；需要绕过 RLS 的操作走后端 Edge Functions，不在门户用 service role
- 部署：Cloudflare（`wrangler` / OpenNext）。大陆可达性见根 AGENTS / 后端 AGENTS
- admin 后台必须有访问保护（middleware/鉴权），不能裸奔

## PART 5: 门户写完代码后的自查清单

- [ ] 每个用户数据 Server Action 是否都有 `getUser()` 登录校验？
- [ ] 每个查询是否都带 `.eq("user_id", user.id)` 用户隔离？
- [ ] 是否有机密变量误加了 `NEXT_PUBLIC_` 前缀？
- [ ] 是否硬编码/提交了密钥到这个公开仓库？
- [ ] API key 是否做到「明文只返回一次 + 只存哈希」？
- [ ] 改的是 `othersstudio/`（当前官网），没误改 `website-v2/`？
- [ ] 若改了 key/鉴权逻辑，是否与后端 `validate-key.ts` 保持一致？
- [ ] 重大/上线影响的改动，是否先和用户确认了？
