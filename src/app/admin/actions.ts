"use server";

import { redirect } from "next/navigation";
import { isAuthenticated, setAuthCookie, clearAuthCookie, verifyPassword } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// ─── Auth Actions ────────────────────────────────────────────

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const password = formData.get("password") as string;

  if (!password || !verifyPassword(password)) {
    return { error: "密码错误" };
  }

  await setAuthCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/admin/login");
}

// ─── Article Actions ─────────────────────────────────────────

export async function saveArticleAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const authed = await isAuthenticated();
  if (!authed) return { error: "未授权" };

  const id = formData.get("id") as string | null;
  const status = formData.get("action_type") === "publish" ? "published" : "draft";

  const data = {
    title: formData.get("title") as string,
    tag: formData.get("tag") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    cover_url: formData.get("cover_url") as string || null,
    status,
    is_pinned: formData.get("is_pinned") === "true",
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  try {
    if (id) {
      const { error } = await supabaseAdmin
        .from("website_articles")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("website_articles")
        .insert(data);
      if (error) throw error;
    }
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "保存失败" };
  }
}

export async function deleteArticleAction(id: string) {
  const authed = await isAuthenticated();
  if (!authed) return { error: "未授权" };

  const { error } = await supabaseAdmin
    .from("website_articles")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function togglePinArticleAction(id: string, pinned: boolean) {
  const authed = await isAuthenticated();
  if (!authed) return { error: "未授权" };

  const { error } = await supabaseAdmin
    .from("website_articles")
    .update({ is_pinned: pinned, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

// ─── Update Actions ──────────────────────────────────────────

export async function saveUpdateAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const authed = await isAuthenticated();
  if (!authed) return { error: "未授权" };

  const id = formData.get("id") as string | null;
  const status = formData.get("action_type") === "publish" ? "published" : "draft";
  const type = formData.get("type") as string;

  const changelogRaw = formData.get("changelog") as string;
  const photosRaw = formData.get("photos") as string;

  const data: Record<string, unknown> = {
    type,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    cover_url: formData.get("cover_url") as string || null,
    photos: photosRaw ? JSON.parse(photosRaw) : [],
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  if (type === "app-update") {
    data.version = formData.get("version") as string;
    data.why = formData.get("why") as string;
    data.changelog = changelogRaw ? JSON.parse(changelogRaw) : [];
  }

  try {
    if (id) {
      const { error } = await supabaseAdmin
        .from("website_updates")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("website_updates")
        .insert(data);
      if (error) throw error;
    }
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "保存失败" };
  }
}

export async function deleteUpdateAction(id: string) {
  const authed = await isAuthenticated();
  if (!authed) return { error: "未授权" };

  const { error } = await supabaseAdmin
    .from("website_updates")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

// ─── Settings Actions ────────────────────────────────────────

export async function getSettingsAction(key: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("website_settings")
      .select("value")
      .eq("key", key)
      .single();
    if (error) return { value: null };
    return { value: data.value };
  } catch {
    return { value: null };
  }
}

export async function saveSettingsAction(key: string, value: unknown) {
  const authed = await isAuthenticated();
  if (!authed) return { error: "未授权" };

  try {
    const { error } = await supabaseAdmin
      .from("website_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "保存失败" };
  }
}

// ─── Data Fetchers (for edit pages) ─────────────────────────

export async function getArticleById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("website_articles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getUpdateById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("website_updates")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

// ─── Image Upload ────────────────────────────────────────────

export async function uploadImageAction(formData: FormData) {
  const authed = await isAuthenticated();
  if (!authed) return { error: "未授权" };

  const file = formData.get("file") as File;
  if (!file) return { error: "请选择文件" };

  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from("website-images")
    .upload(filename, file, { contentType: file.type });

  if (error) return { error: error.message };

  const { data: urlData } = supabaseAdmin.storage
    .from("website-images")
    .getPublicUrl(filename);

  return { success: true, url: urlData.publicUrl };
}
