'use client'

import { useState, type ReactNode } from 'react'
import { Sidebar, type DashboardView } from '@/components/crowdshield/sidebar'
import { TopNav } from '@/components/crowdshield/top-nav'
import { KpiCards } from '@/components/crowdshield/kpi-cards'
import { VenueMap } from '@/components/crowdshield/venue-map'
import { Analytics } from '@/components/crowdshield/analytics'
import { ZoneDetail } from '@/components/crowdshield/zone-detail'
import { AiRecommendation } from '@/components/crowdshield/ai-recommendation'
import { IncidentFeed } from '@/components/crowdshield/incident-feed'
import { AuditLog } from '@/components/crowdshield/audit-log'

const viewCopy: Record<DashboardView, { title: string; description: string }> = {
  Overview: {
    title: 'Operational Overview',
    description: 'Live venue status, decision support, and active incident context.',
  },
  'Live Map': {
    title: 'Live Venue Map',
    description: 'Monitor zone density, gate status, movement flow, and incident locations.',
  },
  'Crowd Analytics': {
    title: 'Crowd Analytics',
    description: 'Track density, flow, risk signals, and zone-level changes over time.',
  },
  'Risk Zones': {
    title: 'Risk Zone Monitor',
    description: 'Inspect the highest-priority areas and their current operational metrics.',
  },
  Incidents: {
    title: 'Incident Command',
    description: 'Review the full incident queue and keep zone context close at hand.',
  },
  Alerts: {
    title: 'Active Alerts',
    description: 'Focus on current operational warnings and their venue impact.',
  },
  Recommendations: {
    title: 'Decision Recommendations',
    description: 'Review AI-supported actions alongside live zone and venue context.',
  },
}

function ViewHeader({ view }: { view: DashboardView }) {
  const copy = viewCopy[view]

  return (
    <div className="mb-3 flex items-end justify-between gap-3 border-b border-border pb-3 lg:mb-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Command view
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">{copy.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
      </div>
      <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-safe/30 bg-safe/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-safe sm:inline-flex">
        <span className="size-1.5 rounded-full bg-safe" />
        Live context
      </span>
    </div>
  )
}

export default function Page() {
  const [nav, setNav] = useState<DashboardView>('Overview')
  // Highest-risk zone is selected by default so the operator sees the critical situation first.
  const [selectedZone, setSelectedZone] = useState<string | null>('zone-a')

  const recZone = selectedZone ?? 'zone-a'

  const overview: ReactNode = (
    <>
      <KpiCards />
      <div className="mt-3 grid gap-3 lg:mt-4 lg:grid-cols-12 lg:gap-4">
        <div className="flex flex-col gap-3 lg:col-span-8 lg:gap-4">
          <div className="flex min-h-[440px] flex-col lg:h-[520px]">
            <VenueMap selectedZone={selectedZone} onSelectZone={setSelectedZone} />
          </div>
          <Analytics selectedZone={selectedZone} onSelectZone={setSelectedZone} />
        </div>
        <div className="flex flex-col gap-3 lg:col-span-4 lg:gap-4">
          <ZoneDetail zoneId={selectedZone} onClear={() => setSelectedZone(null)} />
          <AiRecommendation zoneId={recZone} />
          <div className="flex min-h-[320px] flex-col lg:min-h-[340px]">
            <IncidentFeed selectedZone={selectedZone} onSelectZone={setSelectedZone} />
          </div>
          <div className="flex min-h-[220px] flex-col">
            <AuditLog />
          </div>
        </div>
      </div>
    </>
  )

  const views: Record<DashboardView, ReactNode> = {
    Overview: overview,
    'Live Map': (
      <>
        <ViewHeader view="Live Map" />
        <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
          <div className="flex min-h-[580px] flex-col lg:col-span-8">
            <VenueMap selectedZone={selectedZone} onSelectZone={setSelectedZone} />
          </div>
          <div className="flex flex-col gap-3 lg:col-span-4 lg:gap-4">
            <ZoneDetail zoneId={selectedZone} onClear={() => setSelectedZone(null)} />
            <AiRecommendation zoneId={recZone} />
            <div className="flex min-h-[280px] flex-col">
              <IncidentFeed selectedZone={selectedZone} onSelectZone={setSelectedZone} />
            </div>
            <div className="flex min-h-[200px] flex-col">
              <AuditLog />
            </div>
          </div>
        </div>
      </>
    ),
    'Crowd Analytics': (
      <>
        <ViewHeader view="Crowd Analytics" />
        <KpiCards />
        <div className="mt-3 grid gap-3 lg:mt-4 lg:grid-cols-12 lg:gap-4">
          <div className="lg:col-span-8">
            <Analytics selectedZone={selectedZone} onSelectZone={setSelectedZone} />
          </div>
          <div className="flex flex-col gap-3 lg:col-span-4 lg:gap-4">
            <ZoneDetail zoneId={selectedZone} onClear={() => setSelectedZone(null)} />
            <AiRecommendation zoneId={recZone} />
            <AuditLog />
          </div>
        </div>
      </>
    ),
    'Risk Zones': (
      <>
        <ViewHeader view="Risk Zones" />
        <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
          <div className="flex min-h-[520px] flex-col lg:col-span-8">
            <VenueMap selectedZone={selectedZone} onSelectZone={setSelectedZone} />
          </div>
          <div className="flex flex-col gap-3 lg:col-span-4 lg:gap-4">
            <ZoneDetail zoneId={selectedZone} onClear={() => setSelectedZone(null)} />
            <AiRecommendation zoneId={recZone} />
            <AuditLog />
          </div>
        </div>
        <div className="mt-3 lg:mt-4">
          <Analytics selectedZone={selectedZone} onSelectZone={setSelectedZone} />
        </div>
      </>
    ),
    Incidents: (
      <>
        <ViewHeader view="Incidents" />
        <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
          <div className="flex min-h-[620px] flex-col lg:col-span-8">
            <IncidentFeed selectedZone={selectedZone} onSelectZone={setSelectedZone} />
          </div>
          <div className="flex flex-col gap-3 lg:col-span-4 lg:gap-4">
            <ZoneDetail zoneId={selectedZone} onClear={() => setSelectedZone(null)} />
            <AiRecommendation zoneId={recZone} />
            <AuditLog />
          </div>
        </div>
      </>
    ),
    Alerts: (
      <>
        <ViewHeader view="Alerts" />
        <KpiCards />
        <div className="mt-3 grid gap-3 lg:mt-4 lg:grid-cols-12 lg:gap-4">
          <div className="flex min-h-[520px] flex-col lg:col-span-7">
            <IncidentFeed selectedZone={selectedZone} onSelectZone={setSelectedZone} />
          </div>
          <div className="flex min-h-[520px] flex-col lg:col-span-5">
            <VenueMap selectedZone={selectedZone} onSelectZone={setSelectedZone} />
          </div>
        </div>
      </>
    ),
    Recommendations: (
      <>
        <ViewHeader view="Recommendations" />
        <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
          <div className="lg:col-span-7">
            <AiRecommendation zoneId={recZone} />
          </div>
          <div className="lg:col-span-5">
            <ZoneDetail zoneId={selectedZone} onClear={() => setSelectedZone(null)} />
          </div>
        </div>
        <div className="mt-3 grid gap-3 lg:mt-4 lg:grid-cols-12 lg:gap-4">
          <div className="flex min-h-[440px] flex-col lg:col-span-7">
            <VenueMap selectedZone={selectedZone} onSelectZone={setSelectedZone} />
          </div>
          <div className="lg:col-span-5">
            <AuditLog />
          </div>
        </div>
      </>
    ),
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar active={nav} onSelect={setNav} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />

        <main className="flex-1 overflow-y-auto p-3 md:p-4">
          <div
            key={nav}
            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            {views[nav]}
          </div>
        </main>
      </div>
    </div>
  )
}
