'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { School } from '@/lib/supabase'

type GapBracket = '0-30k' | '30-48k' | '48-75k' | '75-110k' | '110k+'

interface SchoolMapProps {
  schools: School[]
  incomeBracket: GapBracket
  proximityCenter?: [number, number]
  proximityRadiusMiles?: number
  height?: string
  singleSchool?: boolean
}

const GAP_COLUMNS: Record<GapBracket, keyof School> = {
  '0-30k': 'gap_0_30k',
  '30-48k': 'gap_30_48k',
  '48-75k': 'gap_48_75k',
  '75-110k': 'gap_75_110k',
  '110k+': 'gap_110k_plus',
}

function getGap(school: School, bracket: GapBracket): number | null {
  const val = school[GAP_COLUMNS[bracket]]
  return typeof val === 'number' ? val : null
}

function markerColor(school: School, bracket: GapBracket): string {
  const gap = getGap(school, bracket)
  if (gap === null || gap === undefined) return '#9ca3af'
  if (gap < 0) return '#22c55e'
  if (gap <= 2500) return '#22c55e'
  if (gap <= 7500) return '#eab308'
  if (gap <= 15000) return '#f97316'
  return '#ef4444'
}

function formatMoney(amount: number | null): string {
  if (amount === null || amount === undefined) return 'N/A'
  return '$' + amount.toLocaleString()
}

// Fits the map viewport to the visible school pins whenever they change
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 10)
      return
    }
    const lats = points.map(p => p[0])
    const lngs = points.map(p => p[1])
    map.fitBounds(
      [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
      { padding: [50, 50], maxZoom: 12 }
    )
  }, [points.length]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// Miles to meters (Leaflet Circle uses meters)
const milesToMeters = (miles: number) => miles * 1609.34

export default function SchoolMap({
  schools,
  incomeBracket,
  proximityCenter,
  proximityRadiusMiles,
  height = '480px',
  singleSchool = false,
}: SchoolMapProps) {
  const located = schools.filter(
    s => s.latitude != null && s.longitude != null
  ) as (School & { latitude: number; longitude: number })[]

  const points: [number, number][] = located.map(s => [s.latitude, s.longitude])

  // Default US center when no schools are loaded yet
  const defaultCenter: [number, number] = proximityCenter ?? [39.5, -98.35]
  const defaultZoom = proximityCenter ? 7 : 4

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!singleSchool}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Fit bounds whenever school locations change */}
        {points.length > 0 && <FitBounds points={points} />}

        {/* Proximity radius ring */}
        {proximityCenter && proximityRadiusMiles && (
          <Circle
            center={proximityCenter}
            radius={milesToMeters(proximityRadiusMiles)}
            pathOptions={{ color: '#6B4380', fillColor: '#6B4380', fillOpacity: 0.05, weight: 2, dashArray: '6 4' }}
          />
        )}

        {/* Proximity center pin */}
        {proximityCenter && (
          <CircleMarker
            center={proximityCenter}
            radius={7}
            pathOptions={{ color: '#6B4380', fillColor: '#6B4380', fillOpacity: 1, weight: 2 }}
          >
            <Popup>
              <div className="text-sm font-medium">Your Location</div>
            </Popup>
          </CircleMarker>
        )}

        {/* School pins */}
        {located.map(school => {
          const gap = getGap(school, incomeBracket)
          const color = markerColor(school, incomeBracket)
          return (
            <CircleMarker
              key={school.id}
              center={[school.latitude, school.longitude]}
              radius={singleSchool ? 10 : 7}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-semibold text-gray-900 text-sm leading-tight">{school.name}</div>
                  <div className="text-gray-600 text-xs mt-0.5">{school.city}, {school.state}</div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium" style={{ color }}>
                      {gap !== null && gap < 0
                        ? `+${formatMoney(Math.abs(gap))} back`
                        : `${formatMoney(gap)} gap`}
                    </span>
                    <span className="text-gray-500 text-xs"> / year</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <a
                      href={`/school/${school.id}`}
                      className="text-xs bg-[#CF7A3C] text-white px-2 py-1 rounded hover:bg-[#B86A2F]"
                    >
                      Details →
                    </a>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-4 text-xs text-gray-600 flex-wrap">
        <span className="font-medium text-gray-700">Gap:</span>
        {[
          { color: '#22c55e', label: '$0–$2,500 (Low)' },
          { color: '#eab308', label: '$2,501–$7,500 (Med)' },
          { color: '#f97316', label: '$7,501–$15K (High)' },
          { color: '#ef4444', label: '$15K+ (Critical)' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
        {located.length < schools.length && (
          <span className="ml-auto text-gray-400">
            {schools.length - located.length} school{schools.length - located.length !== 1 ? 's' : ''} missing location data
          </span>
        )}
      </div>
    </div>
  )
}
