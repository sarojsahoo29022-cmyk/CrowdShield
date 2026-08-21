'use client'

import { ChartColumn } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  riskMeta,
  type RiskLevel,
} from '@/lib/crowdshield-data'
import { useZones, useTrends } from '@/lib/hooks'
import { DataState } from '@/components/crowdshield/data-state'

function TrendChart({
  data,
  color,
  unit,
  label,
  current,
}: {
  data: number[]
  color: string
  unit: string
  label: string
  current: string
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 120
  const h = 44
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 8) - 4
    return [x, y]
  })
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`
  const last = pts[pts.length - 1]
  return (
    <div className="rounded-md border border-border bg-background/40 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-xs font-semibold" style={{ color }}>
          {current}
          <span className="text-muted-foreground">{unit}</span>
        </p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-2 h-11 w-full">
        <path d={area} fill={color} fillOpacity="0.12" />
        <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <circle cx={last[0]} cy={last[1]} r="1.6" fill={color} />
      </svg>
    </div>
  )
}

export function Analytics({
  selectedZone,
  onSelectZone,
}: {
  selectedZone: string | null
  onSelectZone: (id: string | null) => void
}) {
  const { zones, loading: zonesLoading, error: zonesError } = useZones()
  const { densityTrend, flowTrend, riskTrend, loading: trendsLoading, error: trendsError } = useTrends()
  const maxDensity = Math.max(...zones.map((z) => z.density))
  return (
    <section
      aria-label="Crowd analytics"
      className="rounded-lg border border-border bg-card"
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <ChartColumn className="size-4 text-primary" />
        <h2 className="text-sm font-semibold tracking-tight">Crowd Analytics</h2>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Last 60 min
        </span>
      </div>

      <div className="px-3 pt-2"><DataState loading={zonesLoading || trendsLoading} error={zonesError ?? trendsError} /></div>

      <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-4">
        <TrendChart label="Density Trend" data={densityTrend} color="var(--warning)" unit="%" current={String(densityTrend[densityTrend.length - 1] ?? 78)} />
        <TrendChart label="Flow Trend" data={flowTrend} color="var(--info)" unit="/min" current={(flowTrend[flowTrend.length - 1] ?? 2340).toLocaleString()} />
        <TrendChart label="Risk Trend" data={riskTrend} color="var(--danger)" unit="/100" current={String(riskTrend[riskTrend.length - 1] ?? 82)} />

        {/* Zone comparison */}
        <div className="rounded-md border border-border bg-background/40 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Zone Density Comparison
          </p>
          <ul className="mt-2 space-y-1.5">
            {zones.map((z) => {
              const meta = riskMeta[z.risk as RiskLevel]
              const isSel = selectedZone === z.id
              return (
                <li key={z.id}>
                  <button
                    type="button"
                    onClick={() => onSelectZone(isSel ? null : z.id)}
                    className={cn(
                      'group flex w-full items-center gap-2 rounded px-1 py-0.5 text-left transition-colors',
                      isSel ? 'bg-accent/60' : 'hover:bg-accent/40',
                    )}
                  >
                    <span className="w-10 shrink-0 font-mono text-[10px] text-muted-foreground">
                      {z.name}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(z.density / maxDensity) * 100}%`,
                          backgroundColor: `var(--${meta.token})`,
                        }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right font-mono text-[10px] tabular-nums text-foreground">
                      {z.density}%
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
