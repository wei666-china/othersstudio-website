import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;
let _public: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    _admin = createClient(url, key);
  }
  return _admin;
}

export function getSupabasePublic(): SupabaseClient {
  if (!_public) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    _public = createClient(url, key);
  }
  return _public;
}

// Backwards-compatible lazy getters
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});

export const supabasePublic = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabasePublic() as any)[prop];
  },
});
