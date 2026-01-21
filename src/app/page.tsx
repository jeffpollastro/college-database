'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, School } from '@/lib/supabase'

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
  const [schoolName, setSchoolName] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [compareList, setCompareList] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('compareSchools')
    if (stored) {
      setCompareList(JSON.parse(stored))
    }
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

  const gapColumn: Record<string, string> = {
    '0-30k': 'gap_0_30k',
    '30-48k': 'gap_30_48k',
    '48-75k': 'gap_48_75k',
    '75-110k': 'gap_75_110k',
    '110k+': 'gap_110k_plus',
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
      .limit(100)

    if (maxGap !== 'any') {
      query = query.lte(gapCol, parseInt(maxGap))
    }

    if (noLoanOnly) {
      query = query.eq('no_loan_policy', true)
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
      setSchools(data || [])
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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">The Crown Hub College Search</h1>
          <p className="text-blue-200">Find colleges that are truly affordable for your family</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Find Affordable Colleges</h2>

          {/* School Name Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by School Name (optional)
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchSchools()}
              placeholder="e.g., Hunter College, Penn State, UCLA..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Income Bracket */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Family Income
              </label>
              <select
                value={incomeBracket}
                onChange={(e) => setIncomeBracket(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Gap (What You Pay)
              </label>
              <select
                value={maxGap}
                onChange={(e) => setMaxGap(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {US_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* No Loan Filter */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noLoanOnly}
                  onChange={(e) => setNoLoanOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">No-loan policy only</span>
              </label>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={searchSchools}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {loading ? 'Searching...' : 'Search Schools'}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
            <strong>What is "The Gap"?</strong> It's the amount your family would need to pay or borrow each year after all grants and scholarships. 
            Schools with <span className="text-green-700 font-semibold">$0 gap</span> are truly free for your income level.
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {schools.length > 0 ? `Found ${schools.length} Schools` : 'No Schools Found'}
              </h2>
              {schools.length > 0 && (
                <span className="text-sm text-gray-500">Sorted by lowest gap first</span>
              )}
            </div>

            {schools.length === 0 && !loading && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
                <p>No schools match your criteria. Try adjusting your filters.</p>
              </div>
            )}

            <div className="space-y-4">
              {schools.map((school) => {
                const gap = getGapForBracket(school)
                const trueCost = (gap || 0) + (school.annual_travel_cost || 0)
                
                return (
                  <div key={school.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      {/* School Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                          {school.no_loan_policy && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                              No-Loan Policy
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{school.city}, {school.state}</p>
                        <p className="text-sm text-gray-500">
                          {school.control === 1 ? 'Public' : 'Private'} · {school.size?.toLocaleString()} students
                        </p>
                      </div>

                      {/* Gap Display */}
                      <div className={`text-center px-6 py-3 rounded-lg border-2 ${getSeverityColor(school.gap_severity, gap)}`}>
                        <div className="text-2xl font-bold">
                          {gap !== null && gap < 0 ? `+${formatMoney(Math.abs(gap))}` : formatMoney(gap)}
                        </div>
                        <div className="text-sm">{gap !== null && gap < 0 ? 'Money Back / year' : 'The Gap / year'}</div>
                      </div>
                    </div>

                    {/* Plain Language Summary */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed">
                      <span className="font-medium text-gray-900">What this means: </span>
                      {getPlainLanguageSummary(school, gap)}
                    </div>

                    {/* Details Row */}
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Travel from Poconos:</span>
                        <div className="font-medium">{school.travel_type} · {formatMoney(school.annual_travel_cost)}/yr</div>
                      </div>
                      <div>
                        <span className="text-gray-500">True Annual Cost:</span>
                        <div className="font-bold text-lg">{formatMoney(trueCost)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">4-Year Grad Rate:</span>
                        <div className="font-medium">{school.grad_rate_4yr ? `${(school.grad_rate_4yr * 100).toFixed(0)}%` : 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Pell Grad Rate:</span>
                        <div className="font-medium">{school.grad_rate_pell ? `${(school.grad_rate_pell * 100).toFixed(0)}%` : 'N/A'}</div>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/school/${school.id}`}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        View Full Details →
                      </Link>
                      <button
                        onClick={() => toggleCompare(school.id)}
                        className={`text-sm px-3 py-1 rounded ${
                          compareList.includes(school.id)
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {compareList.includes(school.id) ? '✓ In Compare List' : '+ Add to Compare'}
                      </button>
                      {school.npc_url && (
                        <a
                          href={school.npc_url.startsWith('http') ? school.npc_url : `https://${school.npc_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                        >
                          Net Price Calculator →
                        </a>
                      )}
                      {school.website_url && (
                        <a
                          href={school.website_url.startsWith('http') ? school.website_url : `https://${school.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
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
        <div className="fixed bottom-0 left-0 right-0 bg-purple-900 text-white py-3 px-4 shadow-lg z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-purple-700 px-3 py-1 rounded-full font-bold">
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
                className="text-purple-200 hover:text-white text-sm underline"
              >
                Clear All
              </button>
              <Link
                href="/compare"
                className="bg-white text-purple-900 px-4 py-2 rounded-md font-semibold hover:bg-purple-100"
              >
                Compare Now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`bg-gray-800 text-gray-400 py-8 px-4 mt-12 ${compareList.length > 0 ? 'pb-24' : ''}`}>
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p>A tool by <strong className="text-white">The Crown Hub</strong> to help Pocono families find affordable colleges.</p>
          <p className="mt-2">Data from U.S. Department of Education College Scorecard. Updated annually.</p>
        </div>
      </footer>
    </main>
  )
}
