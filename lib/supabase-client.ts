import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

/**
 * Returns a browser-safe Supabase client using public anonymous keys.
 * If credentials are not present in environment variables, returns null.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null

  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) return null

  try {
    browserClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    })
    return browserClient
  } catch {
    return null
  }
}
