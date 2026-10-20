import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(url?.trim() && anonKey?.trim());
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) client = createClient(url!, anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: { headers: { "X-Client-Info": "wallet-card-studio" } },
  });
  return client;
}

export type ShareSummary = {
  shareId: string;
  fields: string[];
  createdAt: string | null;
  expiresAt: string;
  revoked: boolean;
  expired: boolean;
};

export type PublicProfile = Record<string, string>;
export type ResolveShareResponse = {
  profile: PublicProfile;
  fields: string[];
  expiresAt: string;
};

export async function invokeShareFunction<T>(
  action: "create" | "list" | "revoke" | "resolve",
  payload: Record<string, unknown> = {},
): Promise<T> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.functions.invoke("share-links", {
    body: { action, ...payload },
  });
  if (error) throw error;
  return data as T;
}
