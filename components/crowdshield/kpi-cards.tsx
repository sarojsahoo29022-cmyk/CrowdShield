'use client'

import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { riskMeta, type Kpi } from '@/lib/crowdshield-data'
import { useKpis } from '@/lib/hooks'
import { DataState } from '@/components/crowdshield/data-state'

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 100
  const h = 28
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return [x, y]
  })
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8 w-full">
      <path d={area} fill={color} fillOpacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const meta = riskMeta[kpi.risk]
  const TrendIcon = kpi.trend === 'up' ? ArrowUp : kpi.trend === 'down' ? ArrowDown : Minus
  const color = `var(--${meta.token})`
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {kpi.label}
        </p>
        <span className={cn('size-2 shrink-0 rounded-full', meta.dot)} aria-hidden />
      </div>

      <div className="mt-2 flex items-end gap-1.5">
        <span className="font-mono text-2xl font-semibold leading-none tabular-nums">
          {kpi.value}
        </span>
        {kpi.unit && (
          <span className="mb-0.5 font-mono text-xs text-muted-foreground">{kpi.unit}</span>
        )}
        <span
          className={cn(
            'mb-0.5 ml-auto inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-[10px] font-medium',
            meta.bg,
            meta.text,
          )}
        >
          <TrendIcon className="size-3" />
          {kpi.delta}
        </span>
      </div>

      <div className="mt-2">
        <Sparkline data={kpi.spark} color={color} />
      </div>
    </div>
  )
}

export function KpiCards() {
  const { kpis, loading, error } = useKpis()
  return (
    <div>
      <DataState loading={loading} error={error} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>
    </div>
  )
}
