'use client'

import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react'
import type { Group, Mesh } from 'three'
import {
  Crosshair,
  DoorOpen,
  Flame,
  Layers,
  Maximize,
  Minimize,
  Navigation,
  RotateCcw,
  ShieldAlert,
  TriangleAlert,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  flowArrows,
  gates,
  riskMeta,
  type Incident,
  type RiskLevel,
  type Zone,
} from '@/lib/crowdshield-data'
import { useIncidents, useZones } from '@/lib/hooks'
import { DataState } from '@/components/crowdshield/data-state'

const riskColors: Record<RiskLevel, string> = {
  safe: '#35d28a',
  caution: '#e5bd42',
  warning: '#ef8a42',
  danger: '#ed4f4f',
}

type LayerKey = 'density' | 'risk' | 'flow' | 'incidents' | 'gates'

const layerDefs = [
  { key: 'density' as const, label: 'Density', icon: Flame },
  { key: 'risk' as const, label: 'Risk', icon: ShieldAlert },
  { key: 'flow' as const, label: 'Crowd Flow', icon: Navigation },
  { key: 'incidents' as const, label: 'Incidents', icon: TriangleAlert },
  { key: 'gates' as const, label: 'Gates', icon: DoorOpen },
]

const toWorld = (x: number, y: number): [number, number] => [
  (x - 50) * 0.12,
  (y - 50) * 0.12,
]

function ZoneMesh({
  zone,
  selected,
  dimmed,
  showRisk,
  showDensity,
  onSelect,
}: {
  zone: Zone
  selected: boolean
  dimmed: boolean
  showRisk: boolean
  showDensity: boolean
  onSelect: () => void
}) {
  const group = useRef<Group>(null)
  const [x, z] = toWorld(zone.x + zone.w / 2, zone.y + zone.h / 2)
  const color = riskColors[zone.risk]
  const width = zone.w * 0.12
  const depth = zone.h * 0.12
  const height = showRisk ? 0.14 + zone.density / 350 : 0.08

  useFrame(({ clock }) => {
    if (group.current) {
      const hoverOffset = selected ? Math.sin(clock.elapsedTime * 3) * 0.03 : 0
      group.current.position.y = hoverOffset
    }
  })

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect()
  }

  const isHighRisk = zone.risk === 'danger' || zone.risk === 'warning'

  return (
    <group
      ref={group}
      position={[x, 0, z]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={showRisk ? color : '#334155'}
          transparent
          opacity={dimmed ? 0.18 : selected ? 0.85 : 0.55}
          emissive={showRisk ? color : '#000000'}
          emissiveIntensity={selected ? 0.6 : isHighRisk ? 0.35 : 0.15}
        />
      </mesh>
      <mesh position={[0, height + 0.018, 0]}>
        <boxGeometry args={[width, 0.02, depth]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={dimmed ? 0.25 : 0.9} />
      </mesh>

      {(selected || isHighRisk) && (
        <Html position={[0, height + 0.35, 0]} center distanceFactor={14} zIndexRange={[10, 0]}>
          <div
            className={cn(
              'pointer-events-none flex flex-col items-center rounded-md border px-2 py-1 shadow-lg backdrop-blur transition-all',
              zone.risk === 'danger'
                ? 'border-danger/60 bg-danger/90 text-white'
                : zone.risk === 'warning'
                ? 'border-warning/60 bg-warning/90 text-black'
                : 'border-border bg-card/90 text-foreground',
            )}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
              {zone.name} · {riskMeta[zone.risk].label}
            </span>
            <span className="font-mono text-[9px] opacity-90">
              Density: {zone.density}% | Flow: {zone.flow.toLocaleString()}/m
            </span>
          </div>
        </Html>
      )}

      {showDensity && <CrowdField zone={zone} color={color} height={height} dimmed={dimmed} />}
    </group>
  )
}

function CrowdField({
  zone,
  color,
  height,
  dimmed,
}: {
  zone: Zone
  color: string
  height: number
  dimmed: boolean
}) {
  const points = useMemo(() => {
    const count = Math.round(8 + zone.density / 3)
    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 9301 + zone.x * 11 + zone.y * 17) % 233280
      const seed2 = (seed * 9301 + 49297) % 233280
      return [
        ((seed / 233280) - 0.5) * zone.w * 0.1,
        ((seed2 / 233280) - 0.5) * zone.h * 0.1,
      ] as const
    })
  }, [zone])

  return (
    <group position={[0, height + 0.06, 0]}>
      {points.map(([x, z], index) => (
        <CrowdMarker
          key={index}
          position={[x, 0, z]}
          color={color}
          dimmed={dimmed}
          phase={index / points.length}
        />
      ))}
    </group>
  )
}

function CrowdMarker({
  position,
  color,
  dimmed,
  phase,
}: {
  position: [number, number, number]
  color: string
  dimmed: boolean
  phase: number
}) {
  const marker = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (marker.current)
      marker.current.position.y = Math.sin(clock.elapsedTime * 2.5 + phase * 8) * 0.035
  })
  return (
    <mesh ref={marker} position={position}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={dimmed ? 0.2 : 0.9}
      />
    </mesh>
  )
}

function FlowTrail({ from, to }: { from: [number, number] } & { to: [number, number] }) {
  const marker = useRef<Mesh>(null)
  const [startX, startZ] = toWorld(...from)
  const [endX, endZ] = toWorld(...to)
  useFrame(({ clock }) => {
    const progress = (clock.elapsedTime * 0.32) % 1
    if (marker.current)
      marker.current.position.set(
        startX + (endX - startX) * progress,
        0.18,
        startZ + (endZ - startZ) * progress,
      )
  })
  return (
    <>
      <Line
        points={[
          [startX, 0.035, startZ],
          [endX, 0.035, endZ],
        ]}
        color="#54a8ff"
        transparent
        opacity={0.5}
        dashed
        dashSize={0.16}
        gapSize={0.12}
      />
      <mesh ref={marker}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#8bc5ff" emissive="#54a8ff" emissiveIntensity={1.3} />
      </mesh>
    </>
  )
}

function GateMarker({
  x,
  y,
  name,
  status,
}: {
  x: number
  y: number
  name: string
  status: 'open' | 'restricted' | 'closed'
}) {
  const [worldX, worldZ] = toWorld(x, y)
  const color = status === 'open' ? '#35d28a' : status === 'restricted' ? '#ef8a42' : '#ed4f4f'
  return (
    <group position={[worldX, 0.22, worldZ]}>
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.28, 0.34, 0.28]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
      </mesh>
      <Html position={[0, 0.28, 0]} center distanceFactor={16}>
        <span className="pointer-events-none rounded bg-card/80 px-1 py-0.5 font-mono text-[8px] font-medium text-foreground backdrop-blur">
          {name}
        </span>
      </Html>
    </group>
  )
}

function IncidentMarker({
  x,
  y,
  title,
  severity,
  onClick,
}: {
  x: number
  y: number
  title: string
  severity: RiskLevel
  onClick: () => void
}) {
  const [worldX, worldZ] = toWorld(x, y)
  const marker = useRef<Group>(null)
  const color = riskColors[severity]

  useFrame(({ clock }) => {
    if (marker.current) marker.current.rotation.y = clock.elapsedTime * 1.5
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <group
      ref={marker}
      position={[worldX, 0.42, worldZ]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} />
      </mesh>
      <Html position={[0, 0.35, 0]} center distanceFactor={13}>
        <button
          type="button"
          onClick={onClick}
          className="pointer-events-auto flex items-center gap-1 rounded border border-danger/50 bg-danger/90 px-1.5 py-0.5 text-white shadow backdrop-blur hover:bg-danger transition-colors cursor-pointer"
        >
          <TriangleAlert className="size-3 shrink-0" />
          <span className="font-mono text-[9px] font-bold whitespace-nowrap">{title}</span>
        </button>
      </Html>
    </group>
  )
}

function VenueScene({
  selectedZone,
  onSelectZone,
  layers,
  zones,
  incidents,
}: {
  selectedZone: string | null
  onSelectZone: (id: string | null) => void
  layers: Record<LayerKey, boolean>
  zones: Zone[]
  incidents: Incident[]
}) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)

  // Smooth camera target focus transition when a zone is selected
  useFrame(() => {
    if (controlsRef.current) {
      const activeZone = zones.find((z) => z.id === selectedZone)
      const targetX = activeZone ? (activeZone.x + activeZone.w / 2 - 50) * 0.12 : 0
      const targetZ = activeZone ? (activeZone.y + activeZone.h / 2 - 50) * 0.12 : 0

      controlsRef.current.target.x += (targetX - controlsRef.current.target.x) * 0.08
      controlsRef.current.target.z += (targetZ - controlsRef.current.target.z) * 0.08
      controlsRef.current.update()
    }
  })

  return (
    <>
      <color attach="background" args={['#101a2d']} />
      <fog attach="fog" args={['#101a2d', 11, 22]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 4]} intensity={2.2} color="#b9d6ff" />
      <pointLight position={[0, 4, 0]} intensity={3} color="#377dff" distance={12} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#142139" roughness={0.86} metalness={0.14} />
      </mesh>
      <gridHelper args={[12, 24, '#2b405d', '#1d2d47']} position={[0, 0, 0]} />
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[3.8, 0.08, 2.4]} />
        <meshStandardMaterial color="#1c5b51" emissive="#0c493d" emissiveIntensity={0.42} />
      </mesh>
      {zones.map((zone) => (
        <ZoneMesh
          key={zone.id}
          zone={zone}
          selected={selectedZone === zone.id}
          dimmed={Boolean(selectedZone && selectedZone !== zone.id)}
          showRisk={layers.risk}
          showDensity={layers.density}
          onSelect={() => onSelectZone(selectedZone === zone.id ? null : zone.id)}
        />
      ))}
      {layers.flow &&
        flowArrows.map((flow) => (
          <FlowTrail key={flow.id} from={[flow.x1, flow.y1]} to={[flow.x2, flow.y2]} />
        ))}
      {layers.gates &&
        gates.map((gate) => (
          <GateMarker
            key={gate.id}
            x={gate.x}
            y={gate.y}
            name={gate.name}
            status={gate.status}
          />
        ))}
      {layers.incidents &&
        incidents
          .filter((incident) => incident.status !== 'resolved')
          .map((incident, index) => {
            const zone = zones.find((item) => item.id === incident.zoneId)
            return zone ? (
              <IncidentMarker
                key={incident.id}
                x={zone.x + zone.w - 4 - (index % 2) * 4}
                y={zone.y + zone.h - 4}
                title={incident.title}
                severity={incident.severity}
                onClick={() => onSelectZone(zone.id)}
              />
            ) : null
          })}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={16}
        minPolarAngle={0.45}
        maxPolarAngle={1.3}
        target={[0, 0, 0]}
      />
    </>
  )
}

export function VenueMap({
  selectedZone,
  onSelectZone,
}: {
  selectedZone: string | null
  onSelectZone: (id: string | null) => void
}) {
  const { zones, loading: zonesLoading, error: zonesError } = useZones()
  const { incidents, loading: incidentsLoading, error: incidentsError } = useIncidents()
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    density: true,
    risk: true,
    flow: true,
    incidents: true,
    gates: true,
  })
  const [zoomLevel, setZoomLevel] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const toggle = (key: LayerKey) => setLayers((current) => ({ ...current, [key]: !current[key] }))

  // Operator Keyboard Shortcuts: Esc to reset focus/selection, F to toggle fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSelectZone(null)
        setZoomLevel(0)
      } else if (e.key === 'f' || e.key === 'F') {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          setFullscreen((current) => !current)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSelectZone])

  return (
    <section
      aria-label="Live 3D venue map"
      className={cn(
        'relative flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-border bg-card lg:min-h-0 lg:flex-1',
        fullscreen && 'fixed inset-3 z-50 h-auto',
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Crosshair className="size-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Live Venue Map</h2>
          <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
            3D · live model
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Zoom in"
            onClick={() => setZoomLevel((level) => Math.min(3, level + 1))}
          >
            <ZoomIn />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Zoom out"
            onClick={() => setZoomLevel((level) => Math.max(-3, level - 1))}
          >
            <ZoomOut />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Reset view"
            onClick={() => {
              setZoomLevel(0)
              onSelectZone(null)
            }}
          >
            <RotateCcw />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label={fullscreen ? 'Exit fullscreen' : 'Expand map'}
            onClick={() => setFullscreen((value) => !value)}
          >
            {fullscreen ? <Minimize /> : <Maximize />}
          </Button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <div className="absolute left-3 top-3 z-10 rounded bg-card/90 px-2 py-1 backdrop-blur">
          <DataState loading={zonesLoading || incidentsLoading} error={zonesError ?? incidentsError} />
        </div>
        <Canvas
          key={zoomLevel}
          camera={{
            position: [
              8.2 - zoomLevel * 0.7,
              9.5 - zoomLevel * 0.7,
              10.5 - zoomLevel * 0.7,
            ],
            fov: 42,
          }}
          dpr={[1, 1.75]}
          gl={{ antialias: true }}
        >
          <VenueScene
            selectedZone={selectedZone}
            onSelectZone={onSelectZone}
            layers={layers}
            zones={zones}
            incidents={incidents}
          />
        </Canvas>
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-border bg-card/90 p-2.5 backdrop-blur">
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Risk legend
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {(Object.keys(riskMeta) as RiskLevel[]).map((risk) => (
              <div key={risk} className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-sm"
                  style={{ backgroundColor: riskColors[risk] }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {riskMeta[risk].label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="pointer-events-none absolute bottom-3 right-3 rounded-md border border-border bg-card/90 px-2 py-1 font-mono text-[9px] text-muted-foreground backdrop-blur">
          CLICK ZONE / INCIDENT TO FOCUS · ESC TO RESET
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-2">
        <span className="mr-1 flex items-center gap-1.5 text-muted-foreground">
          <Layers className="size-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-wider">Layers</span>
        </span>
        {layerDefs.map((layer) => {
          const Icon = layer.icon
          const enabled = layers[layer.key]
          return (
            <button
              key={layer.key}
              type="button"
              onClick={() => toggle(layer.key)}
              aria-pressed={enabled}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors',
                enabled
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border bg-background/40 text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" />
              {layer.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
