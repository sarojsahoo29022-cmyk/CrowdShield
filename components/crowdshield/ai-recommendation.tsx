'use client'

import { CheckCircle2, ChevronRight, Lock, Play, ShieldAlert, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { riskMeta } from '@/lib/crowdshield-data'
import { useRecommendation, useZone } from '@/lib/hooks'
import { useAuth } from '@/lib/auth-context'
import { useOperator } from '@/lib/operator-context'
import { DataState } from '@/components/crowdshield/data-state'

export function AiRecommendation({ zoneId }: { zoneId: string }) {
  const { recommendation: rec, loading: recommendationLoading, error: recommendationError } = useRecommendation(zoneId)
  const { zone, loading: zoneLoading, error: zoneError } = useZone(rec.zoneId)
  const { user, canExecuteActions } = useAuth()
  const { executedZones, executeRecommendation } = useOperator()

  const meta = riskMeta[rec.risk]
  const isExecuted = Boolean(executedZones[rec.zoneId])

  const handleExecute = () => {
    executeRecommendation(rec.zoneId, rec.affected)
  }

  return (
    <section
      aria-label="AI command recommendation"
      className={cn('overflow-hidden rounded-lg border bg-card', meta.border)}
    >
      <div className={cn('flex items-center justify-between gap-2 border-b px-3 py-2.5', meta.border, meta.bg)}>
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="size-3.5" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight">AI Command Recommendation</h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Auto
        </span>
      </div>

      <div className="p-3.5">
        <DataState loading={recommendationLoading || zoneLoading} error={recommendationError ?? zoneError} />
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold uppercase tracking-wide', meta.border, meta.bg, meta.text)}>
            <ShieldAlert className="size-3.5" />
            {rec.risk === 'danger' ? 'High Risk' : rec.risk === 'warning' ? 'Elevated Risk' : rec.risk === 'caution' ? 'Moderate Risk' : 'Low Risk'}
          </span>
          <span className="text-sm font-medium">{rec.affected}</span>
        </div>

        {/* Reason */}
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Reason
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">{rec.reason}</p>
        </div>

        {/* Actions */}
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Recommended Actions
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {rec.actions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm">
                <ChevronRight className={cn('mt-0.5 size-4 shrink-0', meta.text)} />
                <span className="text-foreground/90">{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Confidence */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Model Confidence
            </span>
            <span className="font-mono text-xs font-semibold text-foreground">{rec.confidence}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${rec.confidence}%` }}
            />
          </div>
          {zone && (
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              Basis: density {zone.density}% · flow {zone.flow.toLocaleString()}/min · capacity {zone.capacity}%
            </p>
          )}
        </div>

        {/* Operator Execution Controls */}
        <div className="mt-4 flex flex-col gap-2">
          {isExecuted ? (
            <div className="flex items-center gap-2 rounded-md border border-safe/40 bg-safe/10 px-3 py-2 text-safe">
              <CheckCircle2 className="size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">Protocol Executed</p>
                <p className="font-mono text-[10px] opacity-90">Authorized by {user.name} ({user.badge})</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Review Action
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={!canExecuteActions}
                onClick={handleExecute}
              >
                {canExecuteActions ? <Play className="size-3.5 mr-1" /> : <Lock className="size-3.5 mr-1" />}
                {canExecuteActions ? 'Execute' : 'Read Only'}
              </Button>
            </div>
          )}

          {!canExecuteActions && !isExecuted && (
            <p className="font-mono text-[10px] text-muted-foreground text-center">
              Execution requires Security or Admin authorization.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
