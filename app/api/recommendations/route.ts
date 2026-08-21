import { NextResponse } from 'next/server'
import { apiResponse } from '@/lib/api-response'
import { getRecommendations } from '@/lib/crowdshield-store'

export async function GET() {
  const result = await getRecommendations()
  return NextResponse.json(apiResponse(result.data, result.source))
}
