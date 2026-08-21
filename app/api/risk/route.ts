import { NextResponse } from 'next/server'
import { apiResponse } from '@/lib/api-response'
import { getIncidents, getZones } from '@/lib/crowdshield-store'
import { evaluateVenue, evaluateZone } from '@/lib/risk-engine'

/**
 * Phase 4 — Rule-Based Risk Engine Endpoint.
 *
 * Evaluates telemetry across all monitored zones and generates
 * quantitative risk scores (0-100), risk levels, and recommended actions.
 */
export async function GET() {
  const [zonesResult, incidentsResult] = await Promise.all([
    getZones(),
    getIncidents(),
  ])

  const zones = zonesResult.data
  const incidents = incidentsResult.data

  const venueAssessment = evaluateVenue(zones, incidents)
  const zoneAssessments = zones.map((zone) => evaluateZone(zone, incidents))

  return NextResponse.json(
    apiResponse(
      {
        venue: venueAssessment,
        zones: zoneAssessments,
      },
      zonesResult.source,
    ),
  )
}
