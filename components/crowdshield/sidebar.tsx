'use client'

import {
  LayoutDashboard,
  Map,
  ChartColumn,
  ShieldAlert,
  TriangleAlert,
  Bell,
  Sparkles,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type DashboardView =
  | 'Overview'
  | 'Live Map'
  | 'Crowd Analytics'
  | 'Risk Zones'
  | 'Incidents'
  | 'Alerts'
  | 'Recommendations'

const items: { label: DashboardView; icon: LucideIcon; badge?: number }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Live Map', icon: Map },
  { label: 'Crowd Analytics', icon: ChartColumn },
  { label: 'Risk Zones', icon: ShieldAlert, badge: 1 },
  { label: 'Incidents', icon: TriangleAlert, badge: 4 },
  { label: 'Alerts', icon: Bell, badge: 4 },
  { label: 'Recommendations', icon: Sparkles },
]

export function Sidebar({
  active,
  onSelect,
}: {
  active: DashboardView
  onSelect: (label: DashboardView) => void
}) {
  return (
    <aside className="hidden md:flex w-16 lg:w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3 lg:px-4">
        <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div className="hidden lg:block leading-tight">
          <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            CrowdShield
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Command Center
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2 lg:p-3">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.label === active
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item.label)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
                'justify-center lg:justify-start',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 hidden h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary lg:block" />
              )}
              <Icon className="size-[18px] shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
              {item.badge ? (
                <span className="ml-auto hidden lg:grid min-w-5 place-items-center rounded-full bg-danger/15 px-1.5 text-[10px] font-semibold text-danger">
                  {item.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="hidden lg:flex items-center gap-2 rounded-md bg-sidebar-accent/50 px-3 py-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-safe opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-safe" />
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            All systems nominal
          </span>
        </div>
        <div className="lg:hidden flex justify-center">
          <span className="size-2 rounded-full bg-safe" />
        </div>
      </div>
    </aside>
  )
}
