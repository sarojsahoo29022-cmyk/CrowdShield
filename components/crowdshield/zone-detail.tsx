'use client'

import { X, Gauge, Navigation, Users, TriangleAlert, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { riskMeta } from '@/lib/crowdshield-data'
import { useZones } from '@/lib/hooks'
import { DataState } from '@/components/crowdshield/data-state'

export function ZoneDetail({
  zoneId,
  onClear,
}: {
  zoneId: string | null
  onClear: () => void
}) {
  const { zones, loading, error } = useZones()
  const zone = zones.find((z) => z.id === zoneId)

  if (!zone) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 px-3 py-2.5">
        <DataState loading={loading} error={error} />
        <p className="text-xs text-muted-foreground">
          Select a zone, gate, or incident to inspect its live metrics.
        </p>
      </div>
    )
  }

  const meta = riskMeta[zone.risk]
  const TrendIcon = zone.trend === 'up' ? ArrowUp : zone.trend === 'down' ? ArrowDown : Minus

  const stats = [
    { icon: Gauge, label: 'Density', value: `${zone.density}%` },
    { icon: Navigation, label: 'Flow', value: `${zone.flow.toLocaleString()}` },
    { icon: Users, label: 'Occupancy', value: zone.occupancy.toLocaleString() },
    { icon: TriangleAlert, label: 'Incidents', value: `${zone.incidents}` },
  ]

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-card', meta.border)}>
      <div className={cn('flex items-center justify-between gap-2 px-3 py-2', meta.bg)}>
        <div className="flex items-center gap-2">
          <span className={cn('size-2 rounded-full', meta.dot)} />
          <div>
            <p className="text-sm font-semibold leading-none">{zone.name}</p>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{zone.sector}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase', meta.text)}>
            <TrendIcon className="size-3" />
            {riskMeta[zone.risk].label}
          </span>
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear selection"
            className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-background/60 hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 divide-x divide-border border-t border-border">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="px-2 py-2 text-center">
              <Icon className="mx-auto size-3.5 text-muted-foreground" />
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{s.value}</p>
              <p className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
            </div>
          )
        })}
      </div>
      <div className="px-3 pb-2"><DataState loading={loading} error={error} /></div>
    </div>
  )
}
