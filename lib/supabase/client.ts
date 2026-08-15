import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export { hasSupabaseConfig } from "@/lib/supabase/env";

export function createClient() {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    throw new Error("Supabase env vars are missing");
  }
  return createBrowserClient(url, key);
}
