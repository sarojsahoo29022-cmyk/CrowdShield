import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { DataSource } from '@/lib/api-response'
import {
  densityTrend as mockDensityTrend,
  flowTrend as mockFlowTrend,
  incidents as mockIncidents,
  kpis as mockKpis,
  recommendations as mockRecommendations,
  riskTrend as mockRiskTrend,
  timeLabels as mockTimeLabels,
  zones as mockZones,
  type Incident,
  type Kpi,
  type Recommendation,
  type RiskLevel,
  type Zone,
} from '@/lib/crowdshield-data'
import { evaluateVenue, evaluateZone, toRecommendation } from '@/lib/risk-engine'
import { getServerSupabase } from '@/lib/supabase-server'

const DEFAULT_EVENT_ID = 'event-metro-final'

export type EventSummary = {
  id: string
  name: string
  venue: string
  status: 'scheduled' | 'live' | 'paused' | 'completed'
  startsAt: string
  capacity: number
  attendance: number
}

export type TrendData = {
  densityTrend: number[]
  flowTrend: number[]
  riskTrend: number[]
  timeLabels: string[]
}

export type DashboardData = {
  kpis: Kpi[]
  trends: TrendData
}

export type Loaded<T> = {
  data: T
  source: DataSource
}

const mockEvent: EventSummary = {
  id: DEFAULT_EVENT_ID,
  name: 'Championship Final',
  venue: 'Metro Arena',
  status: 'live',
  startsAt: '2026-08-20T13:30:00.000Z',
  capacity: 42000,
  attendance: 38300,
}

type EventRow = {
  id: string
  name: string
  venue: string
  status: string
  starts_at: string
  capacity: number
  attendance: number
}

type ZoneRow = {
  id: string
  name: string
  sector: string
  risk: string
  density: number
  flow: number
  capacity: number
  occupancy: number
  trend: string
  x: number
  y: number
  w: number
  h: number
  incidents: number
}

type IncidentRow = {
  id: string
  title: string
  description: string
  severity: string
  zone_id: string | null
  location: string
  time: string
  status: string
}

type RecommendationRow = {
  zone_id: string
  risk: string
  affected: string
  reason: string
  actions: string[] | null
  confidence: number
}

type KpiRow = {
  id: string
  label: string
  value: string
  unit: string | null
  delta: string
  trend: string
  risk: string
  spark: number[] | null
}

type TrendRow = {
  label: string
  density: number
  flow: number
  risk_score: number
}

function asRisk(value: string): RiskLevel {
  if (value === 'safe' || value === 'caution' || value === 'warning' || value === 'danger') {
    return value
  }
  return 'caution'
}

function asTrend(value: string): 'up' | 'down' | 'stable' {
  if (value === 'up' || value === 'down' || value === 'stable') return value
  return 'stable'
}

function asEventStatus(value: string): EventSummary['status'] {
  if (value === 'scheduled' || value === 'live' || value === 'paused' || value === 'completed') {
    return value
  }
  return 'live'
}

function asIncidentStatus(value: string): Incident['status'] {
  if (value === 'active' || value === 'monitoring' || value === 'dispatched' || value === 'resolved') {
    return value
  }
  return 'monitoring'
}

function mapEvent(row: EventRow): EventSummary {
  return {
    id: row.id,
    name: row.name,
    venue: row.venue,
    status: asEventStatus(row.status),
    startsAt: row.starts_at,
    capacity: row.capacity,
    attendance: row.attendance,
  }
}

function mapZone(row: ZoneRow): Zone {
  return {
    id: row.id,
    name: row.name,
    sector: row.sector,
    risk: asRisk(row.risk),
    density: row.density,
    flow: row.flow,
    capacity: row.capacity,
    occupancy: row.occupancy,
    trend: asTrend(row.trend),
    x: row.x,
    y: row.y,
    w: row.w,
    h: row.h,
    incidents: row.incidents,
  }
}

function mapIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    severity: asRisk(row.severity),
    zoneId: row.zone_id ?? '',
    location: row.location,
    time: row.time,
    status: asIncidentStatus(row.status),
  }
}

function mapRecommendation(row: RecommendationRow): Recommendation {
  return {
    zoneId: row.zone_id,
    risk: asRisk(row.risk),
    affected: row.affected,
    reason: row.reason,
    actions: row.actions ?? [],
    confidence: row.confidence,
  }
}

function mapKpi(row: KpiRow): Kpi {
  return {
    id: row.id,
    label: row.label,
    value: row.value,
    unit: row.unit ?? undefined,
    delta: row.delta,
    trend: asTrend(row.trend),
    risk: asRisk(row.risk),
    spark: row.spark ?? [],
  }
}

/**
 * Simulates small live telemetry fluctuations in mock mode to demonstrate
 * real-time dashboard updates.
 */
function applyLiveFluctuations(zones: Zone[]): Zone[] {
  const tick = Math.floor(Date.now() / 5000) // Ticks every 5 seconds
  return zones.map((z, idx) => {
    // Generate small pseudo-random variance based on tick + zone index
    const delta = Math.sin(tick + idx * 2.3) * 2
    const flowDelta = Math.round(Math.cos(tick + idx * 1.7) * 45)

    const newDensity = Math.max(10, Math.min(98, Math.round(z.density + delta)))
    const newFlow = Math.max(100, Math.round(z.flow + flowDelta))
    const newCapacity = Math.max(10, Math.min(100, Math.round(z.capacity + delta * 0.8)))

    const incidentsDummy: Incident[] = mockIncidents
    const assessment = evaluateZone(
      {
        ...z,
        density: newDensity,
        flow: newFlow,
        capacity: newCapacity,
      },
      incidentsDummy,
    )

    return {
      ...z,
      density: newDensity,
      flow: newFlow,
      capacity: newCapacity,
      risk: assessment.riskLevel,
    }
  })
}

async function loadWithFallback<T>(
  fallback: T,
  loader: (client: SupabaseClient) => Promise<T | null>,
): Promise<Loaded<T>> {
  const client = getServerSupabase()
  if (!client) return { data: fallback, source: 'mock' }

  try {
    const data = await loader(client)
    if (data === null) return { data: fallback, source: 'mock' }
    return { data, source: 'supabase' }
  } catch {
    return { data: fallback, source: 'mock' }
  }
}

export function getEvent(): Promise<Loaded<EventSummary>> {
  return loadWithFallback(mockEvent, async (client) => {
    const { data, error } = await client
      .from('events')
      .select('id,name,venue,status,starts_at,capacity,attendance')
      .eq('id', DEFAULT_EVENT_ID)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return mapEvent(data as EventRow)
  })
}

export function getZones(): Promise<Loaded<Zone[]>> {
  return loadWithFallback(applyLiveFluctuations(mockZones), async (client) => {
    const { data, error } = await client
      .from('zones')
      .select('id,name,sector,risk,density,flow,capacity,occupancy,trend,x,y,w,h,incidents')
      .eq('event_id', DEFAULT_EVENT_ID)
      .order('id')

    if (error) throw error
    if (!data || data.length === 0) return null
    return (data as ZoneRow[]).map(mapZone)
  })
}

export function getIncidents(): Promise<Loaded<Incident[]>> {
  return loadWithFallback(mockIncidents, async (client) => {
    const { data, error } = await client
      .from('incidents')
      .select('id,title,description,severity,zone_id,location,time,status')
      .order('time', { ascending: false })

    if (error) throw error
    if (!data || data.length === 0) return null
    return (data as IncidentRow[]).map(mapIncident)
  })
}

export function getRecommendations(): Promise<Loaded<Record<string, Recommendation>>> {
  return loadWithFallback(mockRecommendations, async (client) => {
    const [zonesLoaded, incidentsLoaded] = await Promise.all([getZones(), getIncidents()])
    const zones = zonesLoaded.data
    const incidents = incidentsLoaded.data

    const { data, error } = await client
      .from('recommendations')
      .select('zone_id,risk,affected,reason,actions,confidence')

    if (error) throw error

    const mapped: Record<string, Recommendation> = {}

    if (data && data.length > 0) {
      for (const row of data as RecommendationRow[]) {
        const recommendation = mapRecommendation(row)
        mapped[recommendation.zoneId] = recommendation
      }
    }

    for (const zone of zones) {
      if (!mapped[zone.id]) {
        const assessment = evaluateZone(zone, incidents)
        mapped[zone.id] = toRecommendation(assessment, zone)
      }
    }

    return mapped
  })
}

export function getDashboard(): Promise<Loaded<DashboardData>> {
  const dynamicZones = applyLiveFluctuations(mockZones)
  const venueRisk = evaluateVenue(dynamicZones, mockIncidents)

  const updatedMockKpis = mockKpis.map((kpi) => {
    if (kpi.id === 'density') {
      const avgDensity = Math.round(
        dynamicZones.reduce((acc, z) => acc + z.density, 0) / dynamicZones.length,
      )
      return { ...kpi, value: String(avgDensity) }
    }
    if (kpi.id === 'risk') {
      return { ...kpi, value: String(venueRisk.overallRiskScore), risk: venueRisk.overallRiskLevel }
    }
    return kpi
  })

  const mockFallbackDashboard: DashboardData = {
    kpis: updatedMockKpis,
    trends: {
      densityTrend: mockDensityTrend,
      flowTrend: mockFlowTrend,
      riskTrend: mockRiskTrend,
      timeLabels: mockTimeLabels,
    },
  }

  return loadWithFallback(mockFallbackDashboard, async (client) => {
    const [kpiResult, trendResult, zonesLoaded, incidentsLoaded] = await Promise.all([
      client
        .from('kpis')
        .select('id,label,value,unit,delta,trend,risk,spark')
        .eq('event_id', DEFAULT_EVENT_ID)
        .order('id'),
      client
        .from('trend_snapshots')
        .select('label,density,flow,risk_score,recorded_at')
        .eq('event_id', DEFAULT_EVENT_ID)
        .order('recorded_at'),
      getZones(),
      getIncidents(),
    ])

    if (kpiResult.error) throw kpiResult.error
    if (trendResult.error) throw trendResult.error
    if (!kpiResult.data || kpiResult.data.length === 0) return null
    if (!trendResult.data || trendResult.data.length === 0) return null

    const snapshots = trendResult.data as TrendRow[]
    const kpisList = (kpiResult.data as KpiRow[]).map(mapKpi)

    const venueEval = evaluateVenue(zonesLoaded.data, incidentsLoaded.data)
    const riskKpiIndex = kpisList.findIndex((k) => k.id === 'risk')
    if (riskKpiIndex !== -1) {
      kpisList[riskKpiIndex] = {
        ...kpisList[riskKpiIndex],
        value: String(venueEval.overallRiskScore),
        risk: venueEval.overallRiskLevel,
      }
    }

    return {
      kpis: kpisList,
      trends: {
        densityTrend: snapshots.map((row) => row.density),
        flowTrend: snapshots.map((row) => row.flow),
        riskTrend: snapshots.map((row) => row.risk_score),
        timeLabels: snapshots.map((row) => row.label),
      },
    }
  })
}
