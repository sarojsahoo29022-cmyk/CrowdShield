import 'server-only'
import type { Incident, Recommendation, RiskLevel, Zone } from '@/lib/crowdshield-data'

export type ZoneRiskAssessment = {
  zoneId: string
  riskLevel: RiskLevel
  score: number // 0-100
  reason: string
  actions: string[]
  confidence: number // 0-100
}

export type VenueRiskAssessment = {
  overallRiskScore: number
  overallRiskLevel: RiskLevel
  activeAlertsCount: number
  criticalZoneCount: number
  warningZoneCount: number
}

/**
 * Deterministic Rule-Based Risk Engine for CrowdShield.
 *
 * NOTE: This is a rule-based decision support system that calculates risk metrics
 * and recommended actions based on deterministic threshold logic.
 */

/**
 * Calculates a numerical risk score (0-100) for a single zone.
 */
export function calculateZoneRiskScore(zone: Zone, activeIncidents: Incident[]): number {
  let score = 0

  // 1. Density Weight (max 40 points)
  // Density percentage directly impacts crowd pressure
  score += Math.min(40, (zone.density / 100) * 40)

  // 2. Capacity Weight (max 30 points)
  score += Math.min(30, (zone.capacity / 100) * 30)

  // 3. Flow Weight (max 15 points)
  // High flow (> 2000/min) adds to congestion risk
  if (zone.flow > 2000) {
    score += 15
  } else if (zone.flow > 1200) {
    score += 10
  } else if (zone.flow > 600) {
    score += 5
  }

  // 4. Incident Weight (max 15 points)
  const zoneIncidents = activeIncidents.filter(
    (i) => i.zoneId === zone.id && i.status !== 'resolved',
  )
  const dangerIncidents = zoneIncidents.filter((i) => i.severity === 'danger').length
  const warningIncidents = zoneIncidents.filter((i) => i.severity === 'warning').length

  score += dangerIncidents * 8 + warningIncidents * 4

  // Trend factor
  if (zone.trend === 'up') score += 5
  if (zone.trend === 'down') score -= 3

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Maps a numerical risk score to a standard RiskLevel badge.
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'danger'
  if (score >= 65) return 'warning'
  if (score >= 45) return 'caution'
  return 'safe'
}

/**
 * Generates structured risk explanations and recommended actions based on zone telemetry.
 */
export function evaluateZone(zone: Zone, incidents: Incident[]): ZoneRiskAssessment {
  const activeZoneIncidents = incidents.filter(
    (inc) => inc.zoneId === zone.id && inc.status !== 'resolved',
  )
  const score = calculateZoneRiskScore(zone, incidents)
  const riskLevel = scoreToRiskLevel(score)

  const reasons: string[] = []
  const actions: string[] = []

  // Analyze Density & Capacity
  if (zone.density >= 85 || zone.capacity >= 85) {
    reasons.push(
      `Critical crowd density (${zone.density}%) and occupancy capacity (${zone.capacity}%)`,
    )
    actions.push('Open adjacent overflow gates to relieve exit pressure')
    actions.push('Broadcast wayfinding announcements to alter arrival trajectory')
  } else if (zone.density >= 65 || zone.capacity >= 65) {
    reasons.push(
      `Elevated crowd density (${zone.density}%) approaching threshold limit`,
    )
    actions.push('Deploy stewards to reinforce one-way pedestrian flow')
  } else {
    reasons.push(
      `Crowd density (${zone.density}%) is within standard operating parameters`,
    )
    actions.push('Maintain standard monitoring protocols')
  }

  // Analyze Movement Flow
  if (zone.flow > 2000) {
    reasons.push(`High influx rate (${zone.flow.toLocaleString()} people/min) detected`)
    actions.push('Regulate ingress gates to reduce inflow rate')
  } else if (zone.flow > 1000) {
    reasons.push(`Moderate flow rate (${zone.flow.toLocaleString()} people/min)`)
  }

  // Analyze Incidents
  if (activeZoneIncidents.length > 0) {
    reasons.push(
      `${activeZoneIncidents.length} active incident(s) reported in this zone`,
    )
    actions.push(`Dispatch quick-response team to ${zone.sector}`)
  }

  // Calculate rule engine confidence based on data completeness
  const confidence = Math.min(
    98,
    Math.max(75, 80 + (zone.incidents > 0 ? 10 : 0) + (zone.density > 80 ? 8 : 4)),
  )

  const reasonText =
    reasons.length > 0
      ? reasons.join(' combined with ') + '.'
      : 'Zone operating normally.'

  return {
    zoneId: zone.id,
    riskLevel,
    score,
    reason: reasonText,
    actions: actions.slice(0, 3), // Top 3 recommended actions
    confidence,
  }
}

/**
 * Calculates overall venue risk summary across all zones and active incidents.
 */
export function evaluateVenue(
  zones: Zone[],
  incidents: Incident[],
): VenueRiskAssessment {
  if (zones.length === 0) {
    return {
      overallRiskScore: 0,
      overallRiskLevel: 'safe',
      activeAlertsCount: 0,
      criticalZoneCount: 0,
      warningZoneCount: 0,
    }
  }

  const zoneScores = zones.map((z) => calculateZoneRiskScore(z, incidents))
  const maxZoneScore = Math.max(...zoneScores, 0)
  const avgZoneScore = zoneScores.reduce((acc, s) => acc + s, 0) / zones.length

  // Overall risk is weighted towards the highest-risk zone (70% max + 30% average)
  const overallRiskScore = Math.min(100, Math.round(maxZoneScore * 0.7 + avgZoneScore * 0.3))
  const overallRiskLevel = scoreToRiskLevel(overallRiskScore)

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved')
  const criticalZones = zones.filter((z) => calculateZoneRiskScore(z, incidents) >= 80)
  const warningZones = zones.filter(
    (z) =>
      calculateZoneRiskScore(z, incidents) >= 65 &&
      calculateZoneRiskScore(z, incidents) < 80,
  )

  return {
    overallRiskScore,
    overallRiskLevel,
    activeAlertsCount: activeIncidents.length,
    criticalZoneCount: criticalZones.length,
    warningZoneCount: warningZones.length,
  }
}

/**
 * Converts a ZoneRiskAssessment into a Recommendation object.
 */
export function toRecommendation(
  assessment: ZoneRiskAssessment,
  zone: Zone,
): Recommendation {
  return {
    zoneId: zone.id,
    risk: assessment.riskLevel,
    affected: `${zone.name} — ${zone.sector}`,
    reason: assessment.reason,
    actions: assessment.actions,
    confidence: assessment.confidence,
  }
}
