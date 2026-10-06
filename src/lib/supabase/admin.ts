import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/env";

/**
 * Creates a server-only client for narrowly scoped trusted operations.
 * Do not import this module from browser code or ordinary user operations.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const env = getServerEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
