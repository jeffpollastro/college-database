'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { supabase, School } from '@/lib/supabase'
import SiteHeader from '@/components/SiteHeader'
import PageHero from '@/components/PageHero'
import SiteFooter from '@/components/SiteFooter'

const SchoolMap = dynamic(() => import('@/components/SchoolMap'), { ssr: false })

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Stroudsburg, PA as the default proximity origin
const STROUDSBURG: [number, number] = [41.0048, -75.198]

const US_STATES = [
  { code: 'any', name: 'All States' },
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington DC' },
]

export default function Home() {
  const [incomeBracket, setIncomeBracket] = useState('0-30k')
  const [maxGap, setMaxGap] = useState<string>('any')
  const [stateFilter, setStateFilter] = useState<string>('any')
  const [noLoanOnly, setNoLoanOnly] = useState(false)
  const [hbcuOnly, setHbcuOnly] = useState(false)
  const [schoolName, setSchoolName] = useState('')
  const [schoolNames, setSchoolNames] = useState<{ id: string; name: string }[]>([])
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [compareList, setCompareList] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [useProximity, setUseProximity] = useState(false)
  const [proximityCenter, setProximityCenter] = useState<[number, number]>(STROUDSBURG)
  const [proximityLabel, setProximityLabel] = useState('Stroudsburg, PA')
  const [proximityRadius, setProximityRadius] = useState(150)
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('compareSchools')
    if (stored) {
      setCompareList(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    supabase.from('schools').select('id, name').order('name').then(({ data }) => {
      if (data) setSchoolNames(data)
    })
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleCompare = (schoolId: string) => {
    let newList: string[]
    if (compareList.includes(schoolId)) {
      newList = compareList.filter(id => id !== schoolId)
    } else {
      if (compareList.length >= 4) {
        alert('You can compare up to 4 schools at a time')
        return
      }
      newList = [...compareList, schoolId]
    }
    setCompareList(newList)
    localStorage.setItem('compareSchools', JSON.stringify(newList))
  }

  const handleNameChange = (value: string) => {
    setSchoolName(value)
    setHighlightedIndex(-1)
    if (!value.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const words = value.toLowerCase().split(/\s+/).filter(Boolean)
    const matches = schoolNames
      .filter(s => words.every(w => s.name.toLowerCase().includes(w)))
      .slice(0, 8)
    setSuggestions(matches)
    setShowSuggestions(matches.length > 0)
  }

  const selectSuggestion = (name: string) => {
    setSchoolName(name)
    setSuggestions([])
    setShowSuggestions(false)
    setHighlightedIndex(-1)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') searchSchools()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        selectSuggestion(suggestions[highlightedIndex].name)
      } else {
        searchSchools()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const gapColumn: Record<string, string> = {
    '0-30k': 'gap_0_30k',
    '30-48k': 'gap_30_48k',
    '48-75k': 'gap_48_75k',
    '75-110k': 'gap_75_110k',
    '110k+': 'gap_110k_plus',
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setProximityCenter([pos.coords.latitude, pos.coords.longitude])
        setProximityLabel('Your Location')
        setGettingLocation(false)
      },
      () => {
        setGettingLocation(false)
        alert('Could not get your location. Using Stroudsburg, PA as default.')
      }
    )
  }

  const searchSchools = async () => {
    setLoading(true)
    setSearched(true)

    const gapCol = gapColumn[incomeBracket]

    let query = supabase
      .from('schools')
      .select('*')
      .not(gapCol, 'is', null)
      .order(gapCol, { ascending: true })

    // Proximity mode fetches more records for client-side distance filtering
    if (useProximity) {
      query = query.limit(3000)
    } else {
      query = query.limit(100)
    }

    if (maxGap !== 'any') {
      query = query.lte(gapCol, parseInt(maxGap))
    }

    if (noLoanOnly) {
      query = query.eq('no_loan_policy', true)
    }

    if (hbcuOnly) {
      query = query.eq('hbcu', true)
    }

    if (stateFilter !== 'any') {
      query = query.eq('state', stateFilter)
    }

    if (schoolName.trim()) {
      query = query.ilike('name', `%${schoolName.trim()}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error:', error)
      setSchools([])
    } else {
      let results = data || []
      // Client-side distance filter
      if (useProximity) {
        results = results.filter(s => {
          if (s.latitude == null || s.longitude == null) return false
          return haversineDistance(proximityCenter[0], proximityCenter[1], s.latitude, s.longitude) <= proximityRadius
        })
      }
      setSchools(results)
    }

    setLoading(false)
  }

  const getGapForBracket = (school: School): number | null => {
    const gaps: Record<string, number | null> = {
      '0-30k': school.gap_0_30k,
      '30-48k': school.gap_30_48k,
      '48-75k': school.gap_48_75k,
      '75-110k': school.gap_75_110k,
      '110k+': school.gap_110k_plus,
    }
    return gaps[incomeBracket]
  }

  const getSeverityColor = (severity: string | null, gap: number | null) => {
    // Negative gap = money back, always green
    if (gap !== null && gap < 0) {
      return 'bg-green-100 text-green-800 border-green-300'
    }
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatMoney = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A'
    return '$' + amount.toLocaleString()
  }

  const getPlainLanguageSummary = (school: School, gap: number | null): string => {
    const parts: string[] = []

    // Cost assessment
    if (gap !== null && gap < 0) {
      // Negative gap = student receives money back
      parts.push(`Students at your income level typically receive MORE aid than the cost of attendance - you could get about ${formatMoney(Math.abs(gap))} back per year for living expenses.`)
    } else if (gap === 0 || (gap === null && school.no_loan_policy)) {
      parts.push(`This school is essentially free for your family's income level.`)
    } else if (gap !== null && gap <= 2500) {
      parts.push(`Very affordable - your family would only need to cover about ${formatMoney(gap)} per year.`)
    } else if (gap !== null && gap <= 7500) {
      parts.push(`Moderately affordable at ${formatMoney(gap)} per year, but plan carefully for this cost.`)
    } else if (gap !== null && gap <= 15000) {
      parts.push(`Significant cost - your family would need to find ${formatMoney(gap)} per year through savings or loans.`)
    } else if (gap !== null) {
      parts.push(`Warning: This school would require ${formatMoney(gap)} per year out of pocket - this level of cost leads many students to drop out.`)
    }

    // No-loan policy highlight
    if (school.no_loan_policy) {
      parts.push(`They have a no-loan policy, meaning financial aid comes as grants you don't repay.`)
    }

    // Graduation rate assessment
    const gradRate = school.grad_rate_4yr ? school.grad_rate_4yr * 100 : null
    const pellRate = school.grad_rate_pell ? school.grad_rate_pell * 100 : null

    if (gradRate !== null && pellRate !== null) {
      const gap_diff = gradRate - pellRate
      if (pellRate >= 80) {
        parts.push(`${pellRate.toFixed(0)}% of low-income students graduate in 4 years - excellent support for students like yours.`)
      } else if (pellRate >= 60) {
        parts.push(`${pellRate.toFixed(0)}% of low-income students graduate in 4 years - decent but not exceptional.`)
      } else if (pellRate >= 40) {
        parts.push(`Only ${pellRate.toFixed(0)}% of low-income students graduate in 4 years - a warning sign.`)
      } else if (pellRate > 0) {
        parts.push(`Caution: Only ${pellRate.toFixed(0)}% of low-income students graduate here - most don't finish.`)
      }

      if (gap_diff > 15) {
        parts.push(`Low-income students graduate at a much lower rate than wealthy students here (${gap_diff.toFixed(0)}% gap).`)
      }
    }

    // Travel context
    if (school.travel_type === 'FLY' && school.annual_travel_cost) {
      if (gap !== null && gap < 0) {
        parts.push(`Note: You would need to budget ${formatMoney(school.annual_travel_cost)}/year for travel, but the excess aid could help cover this.`)
      } else if (gap === 0 || (gap !== null && gap < 3000)) {
        parts.push(`Even with ${formatMoney(school.annual_travel_cost)}/year in travel costs, this is still a great deal.`)
      }
    }

    return parts.join(' ')
  }

  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader />
      <PageHero
        eyebrow="Crown Roots Foundation"
        title="Find Colleges You Can Actually Afford"
        subtitle="See your real out-of-pocket cost before you apply — built for Pocono families."
      />

      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-2xl shadow-sm border border-ink/5 p-6 md:p-8 mb-8">
          <h2 className="font-heading text-xl font-semibold text-ink mb-5">Find Affordable Colleges</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Income Bracket */}
            <div>
              <label className="flex items-end min-h-[2.5rem] text-sm font-medium text-ink-soft mb-1.5">
                Your Family Income
              </label>
              <select
                value={incomeBracket}
                onChange={(e) => setIncomeBracket(e.target.value)}
                className="w-full h-11 border border-ink/15 rounded-xl px-3 bg-surface focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
              >
                <option value="0-30k">$0 - $30,000</option>
                <option value="30-48k">$30,001 - $48,000</option>
                <option value="48-75k">$48,001 - $75,000</option>
                <option value="75-110k">$75,001 - $110,000</option>
                <option value="110k+">$110,001+</option>
              </select>
            </div>

            {/* Max Gap */}
            <div>
              <label className="flex items-end min-h-[2.5rem] text-sm font-medium text-ink-soft mb-1.5">
                Maximum Gap (What You Pay)
              </label>
              <select
                value={maxGap}
                onChange={(e) => setMaxGap(e.target.value)}
                className="w-full h-11 border border-ink/15 rounded-xl px-3 bg-surface focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
              >
                <option value="any">Show All</option>
                <option value="0">$0 (Free!)</option>
                <option value="2500">Under $2,500/year</option>
                <option value="5000">Under $5,000/year</option>
                <option value="7500">Under $7,500/year</option>
                <option value="10000">Under $10,000/year</option>
                <option value="15000">Under $15,000/year</option>
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="flex items-end min-h-[2.5rem] text-sm font-medium text-ink-soft mb-1.5">
                State
              </label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full h-11 border border-ink/15 rounded-xl px-3 bg-surface focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
              >
                {US_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* No Loan + HBCU Filters */}
            <div className="flex flex-col justify-center gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noLoanOnly}
                  onChange={(e) => setNoLoanOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand"
                />
                <span className="text-sm text-ink-soft">No-loan policy only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hbcuOnly}
                  onChange={(e) => setHbcuOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand"
                />
                <span className="text-sm text-ink-soft">HBCUs only</span>
              </label>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={searchSchools}
                disabled={loading}
                className="w-full h-11 bg-brand text-ink font-semibold rounded-xl hover:bg-brand-dark disabled:bg-brand/40 disabled:text-ink/50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loading ? 'Searching…' : 'Search Schools'}
              </button>
            </div>
          </div>

          {/* School Name Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink-soft mb-1.5">
              Search by School Name (optional)
            </label>
            <div className="relative" ref={suggestionsRef}>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onFocus={() => schoolName.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="e.g., Hunter College, Penn State, UCLA..."
                className="w-full h-11 border border-ink/15 rounded-xl px-3 bg-surface focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                autoComplete="off"
              />
              {showSuggestions && (
                <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-surface border border-ink/10 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s, i) => (
                    <li
                      key={s.id}
                      onMouseDown={() => selectSuggestion(s.name)}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      className={`px-4 py-2 text-sm cursor-pointer ${
                        i === highlightedIndex
                          ? 'bg-brand text-ink'
                          : 'text-ink-soft hover:bg-cream'
                      }`}
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Proximity Search */}
          <div className="mb-6 border border-plum/20 rounded-xl p-4 bg-plum/5">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useProximity}
                  onChange={(e) => setUseProximity(e.target.checked)}
                  className="w-4 h-4 rounded accent-plum"
                />
                <span className="text-sm font-medium text-ink">Search by distance from a location</span>
              </label>
            </div>
            {useProximity && (
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <div className="text-xs text-ink-soft mb-1">Origin</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-plum bg-surface border border-plum/30 px-3 py-1.5 rounded-lg">
                      {proximityLabel}
                    </span>
                    <button
                      onClick={useMyLocation}
                      disabled={gettingLocation}
                      className="text-xs bg-plum text-white px-3 py-1.5 rounded-lg hover:bg-plum-light disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {gettingLocation ? 'Locating…' : 'Use My Location'}
                    </button>
                    {proximityLabel !== 'Stroudsburg, PA' && (
                      <button
                        onClick={() => { setProximityCenter(STROUDSBURG); setProximityLabel('Stroudsburg, PA') }}
                        className="text-xs text-ink-soft hover:text-ink underline cursor-pointer"
                      >
                        Reset to Stroudsburg
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-ink-soft mb-1">Within</label>
                  <select
                    value={proximityRadius}
                    onChange={(e) => setProximityRadius(parseInt(e.target.value))}
                    className="border border-ink/15 rounded-lg px-3 py-1.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-plum transition-colors"
                  >
                    <option value={50}>50 miles</option>
                    <option value={100}>100 miles</option>
                    <option value={150}>150 miles</option>
                    <option value={200}>200 miles</option>
                    <option value={300}>300 miles</option>
                    <option value={500}>500 miles</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-mint/25 border border-mint rounded-xl p-4 text-sm text-ink">
            <strong>What is &ldquo;The Gap&rdquo;?</strong> It&apos;s the amount your family would need to pay or borrow each year after all grants and scholarships.
            Schools with <span className="text-mint-ink font-semibold">$0 gap</span> are truly free for your income level.
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <h2 className="font-heading text-xl font-semibold text-ink">
                {schools.length > 0 ? `Found ${schools.length} Schools` : 'No Schools Found'}
              </h2>
              <div className="flex items-center gap-4">
                {schools.length > 0 && (
                  <>
                    <span className="text-sm text-ink-soft">Sorted by lowest gap first</span>
                    {/* List / Map toggle */}
                    <div className="flex rounded-full border border-ink/15 overflow-hidden text-sm bg-surface">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1.5 cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-cream'}`}
                      >
                        List
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-1.5 cursor-pointer transition-colors ${viewMode === 'map' ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-cream'}`}
                      >
                        Map
                      </button>
                    </div>
                  </>
                )}
                <button
                  onClick={() => {
                    setSearched(false)
                    setSchools([])
                    setSchoolName('')
                    setSuggestions([])
                    setShowSuggestions(false)
                    setMaxGap('any')
                    setStateFilter('any')
                    setNoLoanOnly(false)
                    setHbcuOnly(false)
                  }}
                  className="text-sm text-brand-dark hover:text-ink underline cursor-pointer"
                >
                  Clear & Start Over
                </button>
              </div>
            </div>

            {/* Map view */}
            {viewMode === 'map' && schools.length > 0 && (
              <div className="mb-6">
                <SchoolMap
                  schools={schools}
                  incomeBracket={incomeBracket as '0-30k' | '30-48k' | '48-75k' | '75-110k' | '110k+'}
                  proximityCenter={useProximity ? proximityCenter : undefined}
                  proximityRadiusMiles={useProximity ? proximityRadius : undefined}
                  height="520px"
                />
              </div>
            )}

            {schools.length === 0 && !loading && (
              <div className="bg-surface rounded-2xl shadow-sm border border-ink/5 p-8 text-center text-ink-soft">
                <p>No schools match your criteria. Try adjusting your filters.</p>
              </div>
            )}

            {/* List view */}
            <div className={`space-y-4 ${viewMode === 'map' ? 'hidden' : ''}`}>
              {schools.map((school) => {
                const gap = getGapForBracket(school)
                const trueCost = (gap || 0) + (school.annual_travel_cost || 0)

                return (
                  <div key={school.id} className="bg-surface rounded-2xl shadow-sm border border-ink/5 hover:shadow-md transition-shadow duration-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      {/* School Info */}
                      <div className="flex-1">
                        <div className="flex items-start flex-wrap gap-2">
                          <h3 className="font-heading text-lg font-semibold text-ink">{school.name}</h3>
                          {school.no_loan_policy && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              No-Loan Policy
                            </span>
                          )}
                          {school.hbcu && (
                            <span className="bg-plum text-white text-xs px-2 py-1 rounded-full">
                              HBCU
                            </span>
                          )}
                        </div>
                        <p className="text-ink-soft mt-1">{school.city}, {school.state}</p>
                        <p className="text-sm text-ink-soft">
                          {school.control === 1 ? 'Public' : 'Private'} · {school.size?.toLocaleString()} students
                        </p>
                      </div>

                      {/* Gap Display */}
                      <div className={`text-center px-6 py-3 rounded-xl border-2 ${getSeverityColor(school.gap_severity, gap)}`}>
                        <div className="text-2xl font-bold">
                          {gap !== null && gap < 0 ? `+${formatMoney(Math.abs(gap))}` : formatMoney(gap)}
                        </div>
                        <div className="text-sm">{gap !== null && gap < 0 ? 'Money Back / year' : 'The Gap / year'}</div>
                      </div>
                    </div>

                    {/* Plain Language Summary */}
                    <div className="mt-4 p-4 bg-cream rounded-xl text-sm text-ink-soft leading-relaxed">
                      <span className="font-medium text-ink">What this means: </span>
                      {getPlainLanguageSummary(school, gap)}
                    </div>

                    {/* Details Row */}
                    <div className="mt-4 pt-4 border-t border-ink/10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-ink-soft">Travel from Poconos:</span>
                        <div className="font-medium text-ink">{school.travel_type === 'FLY' ? 'Fly' : 'Drive'} · {formatMoney(school.annual_travel_cost)}/yr</div>
                      </div>
                      <div>
                        <span className="text-ink-soft">True Annual Cost:</span>
                        <div className="font-bold text-lg text-clay-dark">{formatMoney(trueCost)}</div>
                      </div>
                      <div>
                        <span className="text-ink-soft">Admission Rate:</span>
                        <div className="font-medium text-ink">{school.admission_rate ? `${(school.admission_rate * 100).toFixed(0)}%` : 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-ink-soft">SAT Range:</span>
                        <div className="font-medium text-ink">{school.sat_read_25 && school.sat_math_25 ? `${school.sat_read_25 + school.sat_math_25}-${school.sat_read_75 + school.sat_math_75}` : 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-ink-soft">4-Year Grad Rate:</span>
                        <div className="font-medium text-ink">{school.grad_rate_4yr ? `${(school.grad_rate_4yr * 100).toFixed(0)}%` : 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-ink-soft">Pell Grad Rate:</span>
                        <div className="font-medium text-ink">{school.grad_rate_pell ? `${(school.grad_rate_pell * 100).toFixed(0)}%` : 'N/A'}</div>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/school/${school.id}`}
                        className="text-sm font-medium bg-brand text-ink px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors"
                      >
                        View Full Details →
                      </Link>
                      <button
                        onClick={() => toggleCompare(school.id)}
                        className={`text-sm px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          compareList.includes(school.id)
                            ? 'bg-plum text-white hover:bg-plum-light'
                            : 'bg-plum/10 text-plum hover:bg-plum/20'
                        }`}
                      >
                        {compareList.includes(school.id) ? '✓ In Compare List' : '+ Add to Compare'}
                      </button>
                      {school.npc_url && (
                        <a
                          href={school.npc_url.startsWith('http') ? school.npc_url : `https://${school.npc_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-brand/10 text-brand-dark px-3 py-1.5 rounded-lg hover:bg-brand/20 transition-colors"
                        >
                          Net Price Calculator →
                        </a>
                      )}
                      {school.website_url && (
                        <a
                          href={school.website_url.startsWith('http') ? school.website_url : `https://${school.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-ink/5 text-ink-soft px-3 py-1.5 rounded-lg hover:bg-ink/10 transition-colors"
                        >
                          School Website →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-plum text-white py-3 px-4 shadow-2xl z-50 rounded-t-2xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-plum-light px-3 py-1 rounded-full font-bold">
                {compareList.length}
              </span>
              <span>school{compareList.length !== 1 ? 's' : ''} selected for comparison</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCompareList([])
                  localStorage.setItem('compareSchools', JSON.stringify([]))
                }}
                className="text-white/70 hover:text-white text-sm underline cursor-pointer"
              >
                Clear All
              </button>
              <Link
                href="/compare"
                className="bg-brand text-ink px-4 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
              >
                Compare Now →
              </Link>
            </div>
          </div>
        </div>
      )}

      <SiteFooter reserveBottomBar={compareList.length > 0} />
    </main>
  )
}
