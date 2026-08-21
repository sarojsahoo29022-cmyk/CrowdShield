import { NextResponse } from 'next/server'
import { apiResponse } from '@/lib/api-response'
import { getZones } from '@/lib/crowdshield-store'

export async function GET() {
  const result = await getZones()
  return NextResponse.json(apiResponse(result.data, result.source))
}
