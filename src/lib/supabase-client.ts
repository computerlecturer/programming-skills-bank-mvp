"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) return null;
  if (browserClient) return browserClient;

  browserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // 이메일+비밀번호 방식만 사용하므로 URL 세션 감지는 끕니다.
        // OAuth/OTP 콜백 처리로 인한 불필요한 auth lock 경고를 줄입니다.
        detectSessionInUrl: false,
        flowType: "pkce"
      }
    }
  );

  return browserClient;
}
