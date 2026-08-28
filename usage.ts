import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

/**
 * Records a generation event so future plan limits (FREE/CREATOR/PRO/AGENCY)
 * can enforce monthly quotas. Not enforced yet in this MVP — logging only.
 * Never throws: usage tracking must not block a successful generation.
 */
export async function logUsage(supabase: SupabaseClient, userId: string, kind: string) {
  try {
    await supabase.from('usage_log').insert({ user_id: userId, kind })
  } catch {
    // best-effort — swallow errors so a logging hiccup never fails the request
  }
}
