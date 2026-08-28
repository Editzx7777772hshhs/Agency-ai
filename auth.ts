import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

/**
 * Verifies the caller's JWT and returns an authenticated Supabase client
 * scoped to that user, plus the user object. Throws on missing/invalid auth
 * so callers can return a 401 without AI keys ever being reachable by an
 * unauthenticated request.
 */
export async function requireUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new AuthError('Missing Authorization header')
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    throw new AuthError('Invalid or expired session')
  }

  return { supabase, user: data.user }
}

export class AuthError extends Error {}
