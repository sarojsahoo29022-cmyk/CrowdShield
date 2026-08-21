import { NextResponse } from 'next/server'
import { apiResponse } from '@/lib/api-response'
import { getDashboard } from '@/lib/crowdshield-store'

export async function GET() {
  const result = await getDashboard()
  return NextResponse.json(apiResponse(result.data, result.source))
}
