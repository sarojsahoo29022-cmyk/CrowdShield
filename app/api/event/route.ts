import { NextResponse } from 'next/server'
import { apiResponse } from '@/lib/api-response'
import { getEvent } from '@/lib/crowdshield-store'

export async function GET() {
  const result = await getEvent()
  return NextResponse.json(apiResponse(result.data, result.source))
}
