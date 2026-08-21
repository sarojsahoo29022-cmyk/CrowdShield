-- ============================================================
-- CrowdShield — Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor once.
-- Safe to re-run: table/index/seed statements use IF NOT EXISTS
-- or ON CONFLICT handling.
-- ============================================================

-- ── events ───────────────────────────────────────────────────
-- CrowdShield currently monitors one event. Linking other records
-- to an event keeps the schema ready for more events later.
create table if not exists public.events (
  id         text primary key,
  name       text not null,
  venue      text not null,
  status     text not null check (status in ('scheduled','live','paused','completed')),
  starts_at  timestamptz not null,
  capacity   integer not null check (capacity > 0),
  attendance integer not null check (attendance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── zones ────────────────────────────────────────────────────
create table if not exists public.zones (
  id         text primary key,
  event_id   text references public.events(id),
  name       text not null,
  sector     text not null,
  risk       text not null check (risk in ('safe','caution','warning','danger')),
  density    integer not null,
  flow       integer not null,
  capacity   integer not null,
  occupancy  integer not null,
  trend      text not null check (trend in ('up','down','stable')),
  x          integer not null,
  y          integer not null,
  w          integer not null,
  h          integer not null,
  incidents  integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Makes the script safe for a project where an earlier schema was run.
alter table public.zones add column if not exists event_id text references public.events(id);

-- ── incidents ────────────────────────────────────────────────
create table if not exists public.incidents (
  id          text primary key,
  title       text not null,
  description text not null,
  severity    text not null check (severity in ('safe','caution','warning','danger')),
  zone_id     text references public.zones(id),
  location    text not null,
  time        text not null,
  status      text not null check (status in ('active','monitoring','dispatched','resolved')),
  created_at  timestamptz not null default now()
);

-- ── recommendations ──────────────────────────────────────────
create table if not exists public.recommendations (
  zone_id    text primary key references public.zones(id),
  risk       text not null check (risk in ('safe','caution','warning','danger')),
  affected   text not null,
  reason     text not null,
  actions    text[] not null default '{}',
  confidence integer not null
);

-- ── kpis ─────────────────────────────────────────────────────
create table if not exists public.kpis (
  id       text primary key,
  event_id text references public.events(id),
  label    text not null,
  value    text not null,
  unit     text,
  delta    text not null,
  trend    text not null check (trend in ('up','down','stable')),
  risk     text not null check (risk in ('safe','caution','warning','danger')),
  spark    integer[] not null default '{}'
);

alter table public.kpis add column if not exists event_id text references public.events(id);

-- ── trend_snapshots ──────────────────────────────────────────
-- Stores time-series chart data for analytics.
create table if not exists public.trend_snapshots (
  id           bigint generated always as identity primary key,
  event_id     text references public.events(id),
  recorded_at  timestamptz not null default now(),
  density      integer not null,
  flow         integer not null,
  risk_score   integer not null,
  label        text not null
);

alter table public.trend_snapshots add column if not exists event_id text references public.events(id);

-- Common query paths used by future server-side API routes.
create index if not exists zones_event_id_idx on public.zones(event_id);
create index if not exists incidents_zone_id_idx on public.incidents(zone_id);
create index if not exists incidents_status_idx on public.incidents(status);
create index if not exists kpis_event_id_idx on public.kpis(event_id);
create index if not exists trend_snapshots_event_id_idx on public.trend_snapshots(event_id);
create unique index if not exists trend_snapshots_event_label_key
  on public.trend_snapshots(event_id, label);

-- Row Level Security protects browser-facing database access.
-- There are no public policies: the server-only service-role key
-- will be used in Phase 3.
alter table public.events enable row level security;
alter table public.zones enable row level security;
alter table public.incidents enable row level security;
alter table public.recommendations enable row level security;
alter table public.kpis enable row level security;
alter table public.trend_snapshots enable row level security;

-- ============================================================
-- Seed data (mirrors lib/crowdshield-data.ts)
-- Safe to re-run: uses INSERT ... ON CONFLICT
-- ============================================================

insert into public.events (id,name,venue,status,starts_at,capacity,attendance) values
  ('event-metro-final','Championship Final','Metro Arena','live','2026-08-20T13:30:00Z',42000,38300)
on conflict (id) do nothing;

insert into public.zones (id,event_id,name,sector,risk,density,flow,capacity,occupancy,trend,x,y,w,h,incidents) values
  ('zone-a','event-metro-final','Zone A','North Gate',   'danger', 92,2340,96,8640,'up',    30, 8,40,22,2),
  ('zone-b','event-metro-final','Zone B','Main Concourse','warning',74,1610,78,6120,'up',    22,34,56,26,1),
  ('zone-c','event-metro-final','Zone C','East Stands',  'caution',58, 940,61,3980,'stable',80,30,15,40,0),
  ('zone-d','event-metro-final','Zone D','West Stands',  'caution',52, 780,55,3410,'down',   5,30,15,40,0),
  ('zone-e','event-metro-final','Zone E','South Plaza',  'safe',   34, 520,38,2150,'stable',22,64,56,24,0)
on conflict (id) do nothing;

update public.zones set event_id = 'event-metro-final' where event_id is null;
alter table public.zones alter column event_id set not null;

insert into public.incidents (id,title,description,severity,zone_id,location,time,status) values
  ('inc-1','Critical density surge',      'Crowd density exceeded 90% near North Gate with rising inflow.','danger', 'zone-a','Zone A · North Gate',       '14:32:07','active'),
  ('inc-2','Bottleneck detected',         'Restricted exit capacity forming a bottleneck at Gate 2.',       'danger', 'zone-a','Zone A · Gate 2',            '14:30:41','dispatched'),
  ('inc-3','Gate capacity threshold',     'Gate 2 approaching maximum throughput capacity (94%).',           'warning','zone-b','Main Concourse · Gate 2',    '14:28:15','monitoring'),
  ('inc-4','Unusual crowd movement',      'Counter-flow movement detected against primary crowd direction.', 'warning','zone-b','Main Concourse',             '14:24:52','monitoring'),
  ('inc-5','Security deployment required','Recommended additional personnel for East Stands perimeter.',    'caution','zone-c','Zone C · East Stands',       '14:19:03','dispatched'),
  ('inc-6','Density normalized',          'South Plaza crowd levels returned to safe operating range.',      'safe',   'zone-e','Zone E · South Plaza',       '14:11:38','resolved')
on conflict (id) do nothing;

insert into public.recommendations (zone_id,risk,affected,reason,actions,confidence) values
  ('zone-a','danger', 'Zone A — North Gate',
    'High crowd density combined with increasing inflow and restricted exit capacity at Gate 2.',
    array['Open Gate 4 to relieve exit pressure','Redirect incoming crowd toward North Exit','Deploy 2 additional security units to Gate 2'],94),
  ('zone-b','warning','Zone B — Main Concourse',
    'Counter-flow movement and rising throughput approaching concourse capacity.',
    array['Deploy stewards to reinforce one-way flow','Slow entry rate from Gate 1 by 15%','Broadcast wayfinding guidance to South Plaza'],88),
  ('zone-c','caution','Zone C — East Stands',
    'Steady density within limits; localized clustering near perimeter.',
    array['Maintain current staffing levels','Monitor perimeter clustering'],81),
  ('zone-d','caution','Zone D — West Stands',
    'Density trending down; no immediate action required.',
    array['Continue passive monitoring','Keep Gate 5 at open status'],83),
  ('zone-e','safe',   'Zone E — South Plaza',
    'Crowd levels within safe operating range with healthy dispersal.',
    array['No action required','Available as overflow relief zone'],91)
on conflict (zone_id) do nothing;

insert into public.kpis (id,event_id,label,value,unit,delta,trend,risk,spark) values
  ('density','event-metro-final','Overall Crowd Density','78','%',  '+6.2%','up','warning',array[52,55,58,61,64,69,72,74,76,78]),
  ('flow',   'event-metro-final','Crowd Flow Rate',      '2,340','/min','+312','up','caution',array[1800,1920,2010,2100,2050,2180,2260,2300,2320,2340]),
  ('risk',   'event-metro-final','Overall Risk Score',   '82','/100','+9', 'up','danger', array[58,60,63,66,68,71,74,78,80,82]),
  ('alerts', 'event-metro-final','Active Alerts',        '4',  null,  '+2', 'up','danger', array[1,1,2,2,2,3,3,4,4,4])
on conflict (id) do nothing;

update public.kpis set event_id = 'event-metro-final' where event_id is null;

insert into public.trend_snapshots (event_id,label,density,flow,risk_score) values
  ('event-metro-final','13:30',42,1200,45),('event-metro-final','13:40',48,1450,48),('event-metro-final','13:50',51,1600,52),
  ('event-metro-final','14:00',55,1720,55),('event-metro-final','14:10',58,1680,60),('event-metro-final','14:20',63,1900,63),
  ('event-metro-final','14:25',66,2050,66),('event-metro-final','14:28',70,2120,70),('event-metro-final','14:29',72,2200,74),
  ('event-metro-final','14:30',74,2260,77),('event-metro-final','14:31',76,2300,80),('event-metro-final','14:32',78,2340,82)
on conflict (event_id,label) do update set
  density = excluded.density,
  flow = excluded.flow,
  risk_score = excluded.risk_score;
