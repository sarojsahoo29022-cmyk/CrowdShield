'use client'

import { CheckCircle2, Clock, MapPin, ShieldAlert, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { riskMeta, type Incident } from '@/lib/crowdshield-data'
import { useIncidents } from '@/lib/hooks'
import { useAuth } from '@/lib/auth-context'
import { useOperator } from '@/lib/operator-context'
import { DataState } from '@/components/crowdshield/data-state'

const statusStyles: Record<Incident['status'], string> = {
  active: 'bg-danger/15 text-danger',
  dispatched: 'bg-info/15 text-info',
  monitoring: 'bg-caution/15 text-caution',
  resolved: 'bg-safe/15 text-safe',
}

export function IncidentFeed({
  selectedZone,
  onSelectZone,
}: {
  selectedZone: string | null
  onSelectZone: (id: string | null) => void
}) {
  const { incidents: rawIncidents, loading, error } = useIncidents()
  const { canExecuteActions } = useAuth()
  const { incidentOverrides, updateIncidentStatus } = useOperator()

  // Apply operator live action overrides to incidents
  const incidents = rawIncidents.map((inc) => ({
    ...inc,
    status: incidentOverrides[inc.id] ?? inc.status,
  }))

  const activeCount = incidents.filter((i) => i.status !== 'resolved').length

  return (
    <section
      aria-label="Live incident feed"
      className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-4 text-warning" />
          <h2 className="text-sm font-semibold tracking-tight">Live Incidents</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-danger">
          <span className="size-1.5 rounded-full bg-danger" />
          {activeCount} active
        </span>
      </div>

      <div className="px-3 pt-2">
        <DataState loading={loading} error={error} />
      </div>

      <ul className="flex-1 divide-y divide-border overflow-y-auto">
        {incidents.length === 0 && (
          <li className="px-3 py-6 text-center text-xs text-muted-foreground">
            No incidents are currently reported.
          </li>
        )}
        {incidents.map((inc) => {
          const meta = riskMeta[inc.severity]
          const isSel = selectedZone === inc.zoneId
          const isResolved = inc.status === 'resolved'

          return (
            <li key={inc.id} className="relative group">
              <div
                className={cn(
                  'flex w-full flex-col gap-1.5 px-3 py-2.5 text-left transition-colors hover:bg-accent/40',
                  isSel && 'bg-accent/60',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('mt-0.5 h-8 w-0.5 shrink-0 rounded-full', meta.dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectZone(isSel ? null : inc.zoneId)}
                        className="flex items-center gap-2 min-w-0 text-left cursor-pointer hover:underline"
                      >
                        <span className={cn('inline-block size-1.5 rounded-full', meta.dot)} />
                        <p className="truncate text-sm font-medium">{inc.title}</p>
                      </button>

                      <span
                        className={cn(
                          'ml-auto shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider',
                          statusStyles[inc.status],
                        )}
                      >
                        {inc.status}
                      </span>
                    </div>

                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {inc.description}
                    </p>

                    <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {inc.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {inc.time}
                        </span>
                      </div>

                      {/* Operator Action Buttons */}
                      {canExecuteActions && !isResolved && (
                        <div className="flex items-center gap-1.5">
                          {inc.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => updateIncidentStatus(inc.id, inc.title, 'dispatched')}
                              className="rounded border border-info/40 bg-info/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-info hover:bg-info/20 transition-colors cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => updateIncidentStatus(inc.id, inc.title, 'resolved')}
                            className="rounded border border-safe/40 bg-safe/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-safe hover:bg-safe/20 transition-colors cursor-pointer"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
