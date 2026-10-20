import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { isValidShareToken, normalizeShareProfile } from "../_shared/share-validation.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "http://localhost:5173",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}
function fail(message: string, status: number) { return response({ error: message }, status); }
function tokenString(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/g, "");
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return fail("Method not allowed.", 405);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("Invalid JSON.", 400); }
  const action = body.action;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  if (action === "resolve") {
    if (!isValidShareToken(body.token)) return fail("공유 링크를 사용할 수 없습니다.", 404);
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateKey = await sha256(forwarded);
    const minuteBucket = Math.floor(Date.now() / 60000);
    const { data: allowed, error: rateError } = await admin.rpc("consume_share_rate_limit", {
      p_rate_key: rateKey, p_minute_bucket: minuteBucket, p_limit: 60,
    });
    if (rateError) return fail("요청을 처리할 수 없습니다.", 503);
    if (!allowed) return fail("요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.", 429);
    const tokenHash = await sha256(body.token);
    const { data, error } = await admin.from("public_shares").select("profile,fields,expires_at,revoked_at")
      .eq("token_hash", tokenHash).maybeSingle();
    if (error || !data || data.revoked_at || Date.parse(data.expires_at) <= Date.now()) return fail("공유 링크를 사용할 수 없습니다.", 404);
    return response({ profile: data.profile, fields: data.fields, expiresAt: data.expires_at });
  }

  const authHeader = request.headers.get("Authorization") ?? "";
  const jwt = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!jwt) return fail("로그인이 필요합니다.", 401);
  const authClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(jwt);
  if (authError || !authData.user) return fail("로그인 세션이 유효하지 않습니다.", 401);
  const ownerId = authData.user.id;

  if (action === "create") {
    let normalized: ReturnType<typeof normalizeShareProfile>;
    try { normalized = normalizeShareProfile(body.profile, body.fields); } catch (error) {
      return fail(error instanceof Error ? error.message : "공유 정보를 확인해 주세요.", 400);
    }
    const days = body.expiresInDays === undefined ? 7 : body.expiresInDays;
    if (!Number.isInteger(days) || Number(days) < 1 || Number(days) > 90) return fail("만료 기간은 1~90일이어야 합니다.", 400);
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const token = tokenString(bytes);
    const expiresAt = new Date(Date.now() + Number(days) * 86400000).toISOString();
    const { data, error } = await admin.from("public_shares").insert({
      owner_id: ownerId, token_hash: await sha256(token), profile: normalized.profile,
      fields: normalized.fields, expires_at: expiresAt, schema_version: 1,
    }).select("id,expires_at").single();
    if (error || !data) return fail("공유 링크를 만들지 못했습니다.", 500);
    return response({ token, shareId: data.id, expiresAt: data.expires_at });
  }

  if (action === "list") {
    const { data, error } = await admin.from("public_shares").select("id,fields,created_at,expires_at,revoked_at")
      .eq("owner_id", ownerId).order("created_at", { ascending: false }).limit(50);
    if (error) return fail("공유 목록을 불러오지 못했습니다.", 500);
    return response({ shares: (data ?? []).map(item => ({
      shareId: item.id, fields: item.fields, createdAt: item.created_at, expiresAt: item.expires_at,
      revoked: Boolean(item.revoked_at), expired: Date.parse(item.expires_at) <= Date.now(),
    })) });
  }

  if (action === "revoke") {
    if (typeof body.shareId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.shareId)) return fail("공유 링크를 찾을 수 없습니다.", 404);
    const { data, error } = await admin.from("public_shares").select("id,revoked_at").eq("id", body.shareId).eq("owner_id", ownerId).maybeSingle();
    if (error || !data) return fail("공유 링크를 찾을 수 없습니다.", 404);
    if (!data.revoked_at) {
      const { error: updateError } = await admin.from("public_shares").update({ revoked_at: new Date().toISOString() })
        .eq("id", body.shareId).eq("owner_id", ownerId);
      if (updateError) return fail("공유 링크를 폐기하지 못했습니다.", 500);
    }
    return response({ revoked: true });
  }

  return fail("지원하지 않는 작업입니다.", 400);
});
