"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export interface ApiKeyRecord {
  id: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  usage_count: number;
  monthly_limit: number;
  created_at: string;
  last_used_at: string | null;
}

export async function listApiKeys(): Promise<ApiKeyRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/me/login");

  const { data, error } = await supabase
    .from("api_keys")
    .select(
      "id,key_prefix,name,is_active,usage_count,monthly_limit,created_at,last_used_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listApiKeys error:", error.message);
    return [];
  }

  return (data ?? []) as ApiKeyRecord[];
}

export async function generateApiKey(
  name: string
): Promise<{ key: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/me/login");

  if (!name || name.trim().length === 0) {
    return { error: "请输入 Key 名称" };
  }
  if (name.length > 50) {
    return { error: "名称不能超过 50 个字符" };
  }

  const existing = await supabase
    .from("api_keys")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if ((existing.data?.length ?? 0) >= 5) {
    return { error: "最多可拥有 5 个活跃 Key" };
  }

  const rawBytes = new Uint8Array(24);
  crypto.getRandomValues(rawBytes);
  const hex = Array.from(rawBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const plainKey = `d1_sk_${hex}`;

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(plainKey)
  );
  const keyHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const { error } = await supabase.from("api_keys").insert({
    user_id: user.id,
    key_hash: keyHash,
    key_prefix: plainKey.slice(0, 10),
    name: name.trim(),
    monthly_limit: 1000,
  });

  if (error) {
    console.error("generateApiKey insert error:", error.message);
    return { error: "生成失败，请稍后再试" };
  }

  return { key: plainKey };
}

export async function revokeApiKey(
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/me/login");

  const { error } = await supabase
    .from("api_keys")
    .update({ is_active: false })
    .eq("id", keyId)
    .eq("user_id", user.id);

  if (error) {
    console.error("revokeApiKey error:", error.message);
    return { success: false, error: "撤销失败" };
  }

  return { success: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/me/login");
}
