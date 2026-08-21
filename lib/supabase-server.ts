import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const REQUIRED_TABLES = [
  'events',
  'zones',
  'incidents',
  'recommendations',
  'kpis',
  'trend_snapshots',
] as const

export type DatabaseCounts = {
  events: number
  zones: number
  incidents: number
  recommendations: number
  kpis: number
  trend_snapshots: number
}

export type DatabaseStatus = {
  configured: boolean
  connected: boolean
  tables: string[]
  counts: DatabaseCounts | null
  error: string | null
}

function getEnv(name: string): string {
  return process.env[name]?.trim() ?? ''
}

/**
 * Server-only Supabase client.
 *
 * Returns null until NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * are set. This keeps the privileged key off the browser and lets Phase 1
 * mock API routes keep working while the database is being set up.
 */
export function getServerSupabase(): SupabaseClient | null {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !serviceRoleKey) return null

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function countRows(
  client: SupabaseClient,
  table: keyof DatabaseCounts,
): Promise<number> {
  const { count, error } = await client.from(table).select('*', { count: 'exact', head: true })
  if (error) throw new Error(`${table}: ${error.message}`)
  return count ?? 0
}

/**
 * Checks whether the server can reach the CrowdShield tables.
 * Used by GET /api/health. Dashboard data routes stay on mock data in Phase 2.
 */
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const client = getServerSupabase()

  if (!client) {
    return {
      configured: false,
      connected: false,
      tables: [...REQUIRED_TABLES],
      counts: null,
      error: 'Supabase server credentials are not set. The dashboard still uses mock API data.',
    }
  }

  try {
    const counts: DatabaseCounts = {
      events: await countRows(client, 'events'),
      zones: await countRows(client, 'zones'),
      incidents: await countRows(client, 'incidents'),
      recommendations: await countRows(client, 'recommendations'),
      kpis: await countRows(client, 'kpis'),
      trend_snapshots: await countRows(client, 'trend_snapshots'),
    }

    return {
      configured: true,
      connected: true,
      tables: [...REQUIRED_TABLES],
      counts,
      error: null,
    }
  } catch (error) {
    return {
      configured: true,
      connected: false,
      tables: [...REQUIRED_TABLES],
      counts: null,
      error: error instanceof Error ? error.message : 'Unable to reach Supabase',
    }
  }
}
