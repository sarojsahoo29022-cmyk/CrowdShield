import { NextResponse } from 'next/server'
import { getDatabaseStatus } from '@/lib/supabase-server'

/**
 * Database health check.
 * Dashboard routes try Supabase first and fall back to mock data if needed.
 */
export async function GET() {
  const status = await getDatabaseStatus()
  const httpStatus = status.configured && !status.connected ? 503 : 200

  return NextResponse.json(
    {
      data: status,
      meta: {
        source: status.connected ? 'supabase' : 'none',
        generatedAt: new Date().toISOString(),
        phase: 3,
      },
    },
    { status: httpStatus },
  )
}
