'use client'

import type { Incident } from '@/lib/crowdshield-data'

export type AuditLogEntry = {
  id: string
  timestamp: string
  operator: string
  role: string
  action: string
  details: string
  severity: 'info' | 'success' | 'warning' | 'danger'
}

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '14:32:10',
    operator: 'Cmdr. A. Rhodes',
    role: 'Security / Police',
    action: 'DISPATCH_TEAM',
    details: 'Dispatched 2 security units to Zone A · Gate 2',
    severity: 'warning',
  },
  {
    id: 'log-2',
    timestamp: '14:30:55',
    operator: 'Cmdr. A. Rhodes',
    role: 'Security / Police',
    action: 'INCIDENT_ACKNOWLEDGED',
    details: 'Acknowledged bottleneck incident inc-2 in Zone A',
    severity: 'info',
  },
  {
    id: 'log-3',
    timestamp: '14:15:00',
    operator: 'System Admin',
    role: 'Administrator',
    action: 'SYSTEM_BOOT',
    details: 'Sector-wide monitoring initialized for Metro Arena',
    severity: 'success',
  },
]
