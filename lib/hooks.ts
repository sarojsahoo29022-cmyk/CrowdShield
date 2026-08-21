'use client'

/**
 * Phase 5 dashboard data hooks with real-time updates.
 *
 * Supports background polling (every 5s), manual refetching,
 * last updated timestamps, and source tracking.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ApiResponse, DataSource } from '@/lib/api-response'
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
  type Zone,
} from '@/lib/crowdshield-data'

export type { Incident, Kpi, Recommendation, Zone }

export type TrendData = {
  densityTrend: number[]
  flowTrend: number[]
  riskTrend: number[]
  timeLabels: string[]
}

export type EventSummary = {
  id: string
  name: string
  venue: string
  status: 'scheduled' | 'live' | 'paused' | 'completed'
  startsAt: string
  capacity: number
  attendance: number
}

type DashboardData = { kpis: Kpi[]; trends: TrendData }

type FetchResult<T> = {
  data: T
  source: DataSource
}

async function fetchApiData<T>(path: string): Promise<FetchResult<T>> {
  const response = await fetch(path, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Request failed (${response.status})`)
  const body = (await response.json()) as ApiResponse<T>
  if (body.data === undefined || body.data === null) throw new Error('The API returned no data')
  return {
    data: body.data,
    source: body.meta?.source ?? 'mock',
  }
}

function useApiData<T>(path: string, fallback: T, intervalMs: number = 5000) {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<DataSource>('mock')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const activeRef = useRef(true)

  const executeFetch = useCallback(async () => {
    try {
      const result = await fetchApiData<T>(path)
      if (activeRef.current) {
        setData(result.data)
        setSource(result.source)
        setError(null)
        setLastUpdated(new Date())
      }
    } catch (requestError: unknown) {
      if (activeRef.current) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard data')
      }
    } finally {
      if (activeRef.current) {
        setLoading(false)
      }
    }
  }, [path])

  useEffect(() => {
    activeRef.current = true
    executeFetch()

    const timer = setInterval(() => {
      executeFetch()
    }, intervalMs)

    return () => {
      activeRef.current = false
      clearInterval(timer)
    }
  }, [executeFetch, intervalMs])

  return { data, loading, error, source, lastUpdated, refetch: executeFetch }
}

export function useEvent() {
  return useApiData<EventSummary>('/api/event', {
    id: 'event-metro-final',
    name: 'Championship Final',
    venue: 'Metro Arena',
    status: 'live',
    startsAt: '2026-08-20T13:30:00.000Z',
    capacity: 42000,
    attendance: 38300,
  })
}

export function useZones() {
  const result = useApiData<Zone[]>('/api/zones', mockZones)
  return {
    zones: result.data,
    loading: result.loading,
    error: result.error,
    source: result.source,
    lastUpdated: result.lastUpdated,
    refetch: result.refetch,
  }
}

export function useZone(zoneId: string | null) {
  const { zones, loading, error, lastUpdated, refetch } = useZones()
  return {
    zone: zones.find((item) => item.id === zoneId) ?? null,
    loading,
    error,
    lastUpdated,
    refetch,
  }
}

export function useIncidents() {
  const result = useApiData<Incident[]>('/api/incidents', mockIncidents)
  return {
    incidents: result.data,
    loading: result.loading,
    error: result.error,
    source: result.source,
    lastUpdated: result.lastUpdated,
    refetch: result.refetch,
  }
}

export function useRecommendations() {
  const result = useApiData<Record<string, Recommendation>>('/api/recommendations', mockRecommendations)
  return {
    recommendations: result.data,
    loading: result.loading,
    error: result.error,
    source: result.source,
    lastUpdated: result.lastUpdated,
    refetch: result.refetch,
  }
}

export function useRecommendation(zoneId: string) {
  const { recommendations, loading, error, lastUpdated, refetch } = useRecommendations()
  return {
    recommendation: recommendations[zoneId] ?? recommendations['zone-a'],
    loading,
    error,
    lastUpdated,
    refetch,
  }
}

export function useDashboard() {
  return useApiData<DashboardData>('/api/dashboard', {
    kpis: mockKpis,
    trends: {
      densityTrend: mockDensityTrend,
      flowTrend: mockFlowTrend,
      riskTrend: mockRiskTrend,
      timeLabels: mockTimeLabels,
    },
  })
}

export function useKpis() {
  const { data, loading, error, source, lastUpdated, refetch } = useDashboard()
  return { kpis: data.kpis, loading, error, source, lastUpdated, refetch }
}

export function useTrends(): TrendData & {
  loading: boolean
  error: string | null
  source: DataSource
  lastUpdated: Date | null
  refetch: () => void
} {
  const { data, loading, error, source, lastUpdated, refetch } = useDashboard()
  return { ...data.trends, loading, error, source, lastUpdated, refetch }
}
