import { NextResponse } from 'next/server'
import { apiResponse } from '@/lib/api-response'
import { getIncidents } from '@/lib/crowdshield-store'

export async function GET() {
  const result = await getIncidents()
  return NextResponse.json(apiResponse(result.data, result.source))
}
