'use client'

import { Clock, History, Shield, Trash2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOperator } from '@/lib/operator-context'
import type { AuditLogEntry } from '@/lib/operator-actions'

const severityStyles: Record<AuditLogEntry['severity'], string> = {
  info: 'border-info/30 bg-info/10 text-info',
  success: 'border-safe/30 bg-safe/10 text-safe',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/30 bg-danger/10 text-danger',
}

export function AuditLog() {
  const { auditLogs, clearAuditLogs } = useOperator()

  return (
    <section
      aria-label="Operator command audit log"
      className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Command Audit Log</h2>
        </div>
        {auditLogs.length > 0 && (
          <button
            type="button"
            onClick={clearAuditLogs}
            className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Trash2 className="size-3" />
            Clear Log
          </button>
        )}
      </div>

      <div className="flex-1 divide-y divide-border overflow-y-auto p-2">
        {auditLogs.length === 0 ? (
          <p className="p-4 text-center font-mono text-xs text-muted-foreground">
            No command actions logged yet.
          </p>
        ) : (
          auditLogs.map((log) => (
            <div key={log.id} className="flex flex-col gap-1 py-2 px-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider',
                    severityStyles[log.severity],
                  )}
                >
                  {log.action}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {log.timestamp}
                </span>
              </div>
              <p className="text-foreground/90 font-medium">{log.details}</p>
              <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="size-3 text-muted-foreground" />
                  {log.operator}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Shield className="size-3 text-primary" />
                  {log.role}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
