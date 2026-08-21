export type RiskLevel = 'safe' | 'caution' | 'warning' | 'danger'

export const riskMeta: Record<
  RiskLevel,
  { label: string; token: string; text: string; bg: string; border: string; dot: string }
> = {
  safe: {
    label: 'Safe',
    token: 'safe',
    text: 'text-safe',
    bg: 'bg-safe/10',
    border: 'border-safe/30',
    dot: 'bg-safe',
  },
  caution: {
    label: 'Caution',
    token: 'caution',
    text: 'text-caution',
    bg: 'bg-caution/10',
    border: 'border-caution/30',
    dot: 'bg-caution',
  },
  warning: {
    label: 'Elevated',
    token: 'warning',
    text: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    dot: 'bg-warning',
  },
  danger: {
    label: 'Critical',
    token: 'danger',
    text: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    dot: 'bg-danger',
  },
}

export type Zone = {
  id: string
  name: string
  sector: string
  risk: RiskLevel
  density: number // percentage
  flow: number // people/min
  capacity: number // percent of capacity
  occupancy: number
  trend: 'up' | 'down' | 'stable'
  // schematic map geometry (0-100 coordinate space)
  x: number
  y: number
  w: number
  h: number
  incidents: number
}

export const zones: Zone[] = [
  {
    id: 'zone-a',
    name: 'Zone A',
    sector: 'North Gate',
    risk: 'danger',
    density: 92,
    flow: 2340,
    capacity: 96,
    occupancy: 8640,
    trend: 'up',
    x: 30,
    y: 8,
    w: 40,
    h: 22,
    incidents: 2,
  },
  {
    id: 'zone-b',
    name: 'Zone B',
    sector: 'Main Concourse',
    risk: 'warning',
    density: 74,
    flow: 1610,
    capacity: 78,
    occupancy: 6120,
    trend: 'up',
    x: 22,
    y: 34,
    w: 56,
    h: 26,
    incidents: 1,
  },
  {
    id: 'zone-c',
    name: 'Zone C',
    sector: 'East Stands',
    risk: 'caution',
    density: 58,
    flow: 940,
    capacity: 61,
    occupancy: 3980,
    trend: 'stable',
    x: 80,
    y: 30,
    w: 15,
    h: 40,
    incidents: 0,
  },
  {
    id: 'zone-d',
    name: 'Zone D',
    sector: 'West Stands',
    risk: 'caution',
    density: 52,
    flow: 780,
    capacity: 55,
    occupancy: 3410,
    trend: 'down',
    x: 5,
    y: 30,
    w: 15,
    h: 40,
    incidents: 0,
  },
  {
    id: 'zone-e',
    name: 'Zone E',
    sector: 'South Plaza',
    risk: 'safe',
    density: 34,
    flow: 520,
    capacity: 38,
    occupancy: 2150,
    trend: 'stable',
    x: 22,
    y: 64,
    w: 56,
    h: 24,
    incidents: 0,
  },
]

export type Gate = {
  id: string
  name: string
  status: 'open' | 'restricted' | 'closed'
  load: number
  x: number
  y: number
}

export const gates: Gate[] = [
  { id: 'g1', name: 'Gate 1', status: 'open', load: 62, x: 30, y: 8 },
  { id: 'g2', name: 'Gate 2', status: 'restricted', load: 94, x: 70, y: 8 },
  { id: 'g4', name: 'Gate 4', status: 'closed', load: 0, x: 50, y: 90 },
  { id: 'g5', name: 'Gate 5', status: 'open', load: 44, x: 5, y: 50 },
  { id: 'g6', name: 'Gate 6', status: 'open', load: 51, x: 95, y: 50 },
]

export type Hotspot = { id: string; x: number; y: number; intensity: number }
export const hotspots: Hotspot[] = [
  { id: 'h1', x: 42, y: 16, intensity: 0.95 },
  { id: 'h2', x: 58, y: 14, intensity: 0.82 },
  { id: 'h3', x: 50, y: 44, intensity: 0.6 },
]

export type FlowArrow = { id: string; x1: number; y1: number; x2: number; y2: number }
export const flowArrows: FlowArrow[] = [
  { id: 'f1', x1: 50, y1: 78, x2: 50, y2: 52 },
  { id: 'f2', x1: 40, y1: 50, x2: 45, y2: 26 },
  { id: 'f3', x1: 60, y1: 50, x2: 55, y2: 26 },
  { id: 'f4', x1: 85, y1: 60, x2: 68, y2: 46 },
]

export type Incident = {
  id: string
  title: string
  description: string
  severity: RiskLevel
  zoneId: string
  location: string
  time: string
  status: 'active' | 'monitoring' | 'dispatched' | 'resolved'
}

export const incidents: Incident[] = [
  {
    id: 'inc-1',
    title: 'Critical density surge',
    description: 'Crowd density exceeded 90% near North Gate with rising inflow.',
    severity: 'danger',
    zoneId: 'zone-a',
    location: 'Zone A · North Gate',
    time: '14:32:07',
    status: 'active',
  },
  {
    id: 'inc-2',
    title: 'Bottleneck detected',
    description: 'Restricted exit capacity forming a bottleneck at Gate 2.',
    severity: 'danger',
    zoneId: 'zone-a',
    location: 'Zone A · Gate 2',
    time: '14:30:41',
    status: 'dispatched',
  },
  {
    id: 'inc-3',
    title: 'Gate capacity threshold',
    description: 'Gate 2 approaching maximum throughput capacity (94%).',
    severity: 'warning',
    zoneId: 'zone-b',
    location: 'Main Concourse · Gate 2',
    time: '14:28:15',
    status: 'monitoring',
  },
  {
    id: 'inc-4',
    title: 'Unusual crowd movement',
    description: 'Counter-flow movement detected against primary crowd direction.',
    severity: 'warning',
    zoneId: 'zone-b',
    location: 'Main Concourse',
    time: '14:24:52',
    status: 'monitoring',
  },
  {
    id: 'inc-5',
    title: 'Security deployment required',
    description: 'Recommended additional personnel for East Stands perimeter.',
    severity: 'caution',
    zoneId: 'zone-c',
    location: 'Zone C · East Stands',
    time: '14:19:03',
    status: 'dispatched',
  },
  {
    id: 'inc-6',
    title: 'Density normalized',
    description: 'South Plaza crowd levels returned to safe operating range.',
    severity: 'safe',
    zoneId: 'zone-e',
    location: 'Zone E · South Plaza',
    time: '14:11:38',
    status: 'resolved',
  },
]

export type Recommendation = {
  zoneId: string
  risk: RiskLevel
  affected: string
  reason: string
  actions: string[]
  confidence: number
}

export const recommendations: Record<string, Recommendation> = {
  'zone-a': {
    zoneId: 'zone-a',
    risk: 'danger',
    affected: 'Zone A — North Gate',
    reason:
      'High crowd density combined with increasing inflow and restricted exit capacity at Gate 2.',
    actions: [
      'Open Gate 4 to relieve exit pressure',
      'Redirect incoming crowd toward North Exit',
      'Deploy 2 additional security units to Gate 2',
    ],
    confidence: 94,
  },
  'zone-b': {
    zoneId: 'zone-b',
    risk: 'warning',
    affected: 'Zone B — Main Concourse',
    reason: 'Counter-flow movement and rising throughput approaching concourse capacity.',
    actions: [
      'Deploy stewards to reinforce one-way flow',
      'Slow entry rate from Gate 1 by 15%',
      'Broadcast wayfinding guidance to South Plaza',
    ],
    confidence: 88,
  },
  'zone-c': {
    zoneId: 'zone-c',
    risk: 'caution',
    affected: 'Zone C — East Stands',
    reason: 'Steady density within limits; localized clustering near perimeter.',
    actions: ['Maintain current staffing levels', 'Monitor perimeter clustering'],
    confidence: 81,
  },
  'zone-d': {
    zoneId: 'zone-d',
    risk: 'caution',
    affected: 'Zone D — West Stands',
    reason: 'Density trending down; no immediate action required.',
    actions: ['Continue passive monitoring', 'Keep Gate 5 at open status'],
    confidence: 83,
  },
  'zone-e': {
    zoneId: 'zone-e',
    risk: 'safe',
    affected: 'Zone E — South Plaza',
    reason: 'Crowd levels within safe operating range with healthy dispersal.',
    actions: ['No action required', 'Available as overflow relief zone'],
    confidence: 91,
  },
}

export type Kpi = {
  id: string
  label: string
  value: string
  unit?: string
  delta: string
  trend: 'up' | 'down' | 'stable'
  risk: RiskLevel
  spark: number[]
}

export const kpis: Kpi[] = [
  {
    id: 'density',
    label: 'Overall Crowd Density',
    value: '78',
    unit: '%',
    delta: '+6.2%',
    trend: 'up',
    risk: 'warning',
    spark: [52, 55, 58, 61, 64, 69, 72, 74, 76, 78],
  },
  {
    id: 'flow',
    label: 'Crowd Flow Rate',
    value: '2,340',
    unit: '/min',
    delta: '+312',
    trend: 'up',
    risk: 'caution',
    spark: [1800, 1920, 2010, 2100, 2050, 2180, 2260, 2300, 2320, 2340],
  },
  {
    id: 'risk',
    label: 'Overall Risk Score',
    value: '82',
    unit: '/100',
    delta: '+9',
    trend: 'up',
    risk: 'danger',
    spark: [58, 60, 63, 66, 68, 71, 74, 78, 80, 82],
  },
  {
    id: 'alerts',
    label: 'Active Alerts',
    value: '4',
    delta: '+2',
    trend: 'up',
    risk: 'danger',
    spark: [1, 1, 2, 2, 2, 3, 3, 4, 4, 4],
  },
]

export const densityTrend = [42, 48, 51, 55, 58, 63, 66, 70, 72, 74, 76, 78]
export const flowTrend = [1200, 1450, 1600, 1720, 1680, 1900, 2050, 2120, 2200, 2260, 2300, 2340]
export const riskTrend = [45, 48, 52, 55, 60, 63, 66, 70, 74, 77, 80, 82]

export const timeLabels = [
  '13:30',
  '13:40',
  '13:50',
  '14:00',
  '14:10',
  '14:20',
  '14:30',
]

export const navItems = [
  'Overview',
  'Live Map',
  'Crowd Analytics',
  'Risk Zones',
  'Incidents',
  'Alerts',
  'Recommendations',
] as const
