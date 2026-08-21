'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { type AuditLogEntry, initialAuditLogs } from '@/lib/operator-actions'
import { useAuth } from '@/lib/auth-context'
import type { Incident } from '@/lib/crowdshield-data'

type OperatorContextType = {
  executedZones: Record<string, boolean>
  incidentOverrides: Record<string, Incident['status']>
  auditLogs: AuditLogEntry[]
  executeRecommendation: (zoneId: string, zoneName: string) => boolean
  updateIncidentStatus: (incidentId: string, title: string, status: Incident['status']) => boolean
  clearAuditLogs: () => void
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined)

export function OperatorProvider({ children }: { children: ReactNode }) {
  const { user, canExecuteActions } = useAuth()
  const [executedZones, setExecutedZones] = useState<Record<string, boolean>>({})
  const [incidentOverrides, setIncidentOverrides] = useState<Record<string, Incident['status']>>({})
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs)

  const executeRecommendation = (zoneId: string, zoneName: string): boolean => {
    if (!canExecuteActions) return false

    const now = new Date().toLocaleTimeString('en-GB', { hour12: false })
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: now,
      operator: user.name,
      role: user.role,
      action: 'EXECUTE_RECOMMENDATION',
      details: `Executed AI command protocol for ${zoneName}`,
      severity: 'success',
    }

    setExecutedZones((prev) => ({ ...prev, [zoneId]: true }))
    setAuditLogs((prev) => [newEntry, ...prev])
    return true
  }

  const updateIncidentStatus = (
    incidentId: string,
    title: string,
    status: Incident['status'],
  ): boolean => {
    if (!canExecuteActions) return false

    const now = new Date().toLocaleTimeString('en-GB', { hour12: false })
    const severityMap: Record<Incident['status'], AuditLogEntry['severity']> = {
      active: 'danger',
      dispatched: 'info',
      monitoring: 'warning',
      resolved: 'success',
    }

    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: now,
      operator: user.name,
      role: user.role,
      action: `INCIDENT_${status.toUpperCase()}`,
      details: `Updated incident "${title}" status to ${status}`,
      severity: severityMap[status],
    }

    setIncidentOverrides((prev) => ({ ...prev, [incidentId]: status }))
    setAuditLogs((prev) => [newEntry, ...prev])
    return true
  }

  const clearAuditLogs = () => setAuditLogs([])

  return (
    <OperatorContext.Provider
      value={{
        executedZones,
        incidentOverrides,
        auditLogs,
        executeRecommendation,
        updateIncidentStatus,
        clearAuditLogs,
      }}
    >
      {children}
    </OperatorContext.Provider>
  )
}

export function useOperator() {
  const context = useContext(OperatorContext)
  if (!context) {
    throw new Error('useOperator must be used within an OperatorProvider')
  }
  return context
}
