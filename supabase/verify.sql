-- CrowdShield database verification queries.
-- Run this after schema.sql in the Supabase SQL Editor.
-- These queries only read data; they do not modify the database.

-- Confirm that all required tables exist.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'events',
    'zones',
    'incidents',
    'recommendations',
    'kpis',
    'trend_snapshots'
  )
order by table_name;

-- Confirm that the seeded demo event and related rows exist.
select
  (select count(*) from public.events) as event_count,
  (select count(*) from public.zones) as zone_count,
  (select count(*) from public.incidents) as incident_count,
  (select count(*) from public.recommendations) as recommendation_count,
  (select count(*) from public.kpis) as kpi_count,
  (select count(*) from public.trend_snapshots) as trend_snapshot_count;

-- Display the event and its zones for a quick visual check.
select
  e.name as event_name,
  e.venue,
  e.status,
  z.name as zone_name,
  z.risk,
  z.density,
  z.capacity,
  z.occupancy
from public.events e
join public.zones z on z.event_id = e.id
where e.id = 'event-metro-final'
order by z.id;

-- Confirm that Row Level Security is enabled on every application table.
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'events',
    'zones',
    'incidents',
    'recommendations',
    'kpis',
    'trend_snapshots'
  )
order by tablename;
