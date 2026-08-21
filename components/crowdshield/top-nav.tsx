'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, ChevronDown, Menu, RefreshCw, Search, Shield, Signal, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth, ROLE_PROFILES, type UserRole } from '@/lib/auth-context'
import { useEvent, useZones } from '@/lib/hooks'

export function TopNav() {
  const [now, setNow] = useState<Date | null>(null)
  const { data: event } = useEvent()
  const { source, refetch, lastUpdated } = useZones()
  const { user, setRole } = useAuth()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 400)
  }

  const time = now
    ? now.toLocaleTimeString('en-GB', { hour12: false })
    : '--:--:--'
  const date = now
    ? now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : ''

  const lastSyncTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-GB', { hour12: false })
    : time

  const rolesList: UserRole[] = ['Security / Police', 'Event Organizer', 'Administrator']

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/60 px-3 backdrop-blur md:px-4">
      <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open menu">
        <Menu />
      </Button>

      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold tracking-tight">
              {event.venue} — {event.name}
            </h1>
            <span className="hidden items-center gap-1.5 rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 sm:inline-flex">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-danger" />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-danger">
                Live
              </span>
            </span>
          </div>
          <p className="hidden truncate font-mono text-[11px] text-muted-foreground sm:block">
            Capacity {event.capacity.toLocaleString()} · {event.attendance.toLocaleString()} present · Sector-wide monitoring active
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="mr-1 hidden flex-col items-end lg:flex">
          <span className="font-mono text-sm tabular-nums leading-none text-foreground">
            {time}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {date}
          </span>
        </div>

        {/* Real-time Sync Indicator & Manual Trigger */}
        <div className="hidden items-center gap-2 rounded-md border border-border bg-background/50 px-2.5 py-1.5 md:flex">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-safe opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-safe" />
          </span>
          <Signal className="size-3.5 text-safe" />
          <span className="font-mono text-[11px] font-medium text-foreground">
            {source === 'supabase' ? 'Supabase Realtime' : 'Live Sync (5s)'}
          </span>
          <span className="mx-1 h-3 w-px bg-border" />
          <span className="font-mono text-[10px] text-muted-foreground">
            Updated {lastSyncTime}
          </span>
          <button
            type="button"
            onClick={handleManualRefresh}
            title="Sync live telemetry now"
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`size-3 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>

        <Button variant="ghost" size="icon-sm" aria-label="Search">
          <Search />
        </Button>

        <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
          <Bell />
          <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-danger text-[9px] font-bold text-primary-foreground">
            4
          </span>
        </Button>

        {/* Operator Profile & Role Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu((prev) => !prev)}
            className="flex items-center gap-2 rounded-md border border-border bg-background/50 py-1 pl-1 pr-2.5 transition-colors hover:bg-accent/50 cursor-pointer"
          >
            <span className="grid size-7 place-items-center rounded bg-primary/15 font-mono text-xs font-semibold text-primary">
              {user.badge.slice(0, 3)}
            </span>
            <div className="hidden leading-tight text-left sm:block">
              <p className="text-xs font-medium">{user.name}</p>
              <p className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                <Shield className="size-3 text-primary inline" />
                {user.role}
              </p>
            </div>
            <ChevronDown className="size-3 text-muted-foreground ml-1" />
          </button>

          {/* Role Selection Menu */}
          {showRoleMenu && (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-md border border-border bg-card p-1.5 shadow-xl">
              <p className="px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground border-b border-border mb-1">
                Switch Command Role
              </p>
              <div className="space-y-1">
                {rolesList.map((roleName) => {
                  const profile = ROLE_PROFILES[roleName]
                  const isCurrent = user.role === roleName
                  return (
                    <button
                      key={roleName}
                      type="button"
                      onClick={() => {
                        setRole(roleName)
                        setShowRoleMenu(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent',
                        isCurrent && 'bg-accent/70 font-semibold',
                      )}
                    >
                      <div>
                        <p className="text-foreground">{profile.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {profile.role}
                        </p>
                      </div>
                      {isCurrent && <UserCheck className="size-3.5 text-primary" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
