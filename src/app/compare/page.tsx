'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { supabase, School } from '@/lib/supabase'
import SiteHeader from '@/components/SiteHeader'
import PageHero from '@/components/PageHero'
import SiteFooter from '@/components/SiteFooter'

const SchoolMap = dynamic(() => import('@/components/SchoolMap'), { ssr: false })

export default function ComparePage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [incomeBracket, setIncomeBracket] = useState('0-30k')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<School[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadCompareList()
  }, [])

  const loadCompareList = async () => {
    const stored = localStorage.getItem('compareSchools')
    if (stored) {
      const ids = JSON.parse(stored) as string[]
      if (ids.length > 0) {
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .in('id', ids)

        if (!error && data) {
          setSchools(data)
        }
      }
    }
    setLoading(false)
  }

  const removeSchool = (id: string) => {
    const stored = localStorage.getItem('compareSchools')
    if (stored) {
      const ids = JSON.parse(stored) as string[]
      const newIds = ids.filter(i => i !== id)
      localStorage.setItem('compareSchools', JSON.stringify(newIds))
    }
    setSchools(schools.filter(s => s.id !== id))
  }

  const clearAll = () => {
    localStorage.setItem('compareSchools', JSON.stringify([]))
    setSchools([])
  }

  const searchSchools = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)

    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .limit(10)

    if (!error && data) {
      setSearchResults(data)
    }
    setSearching(false)
  }

  const addSchool = (school: School) => {
    if (schools.find(s => s.id === school.id)) return
    if (schools.length >= 4) {
      alert('You can compare up to 4 schools at a time')
      return
    }

    const stored = localStorage.getItem('compareSchools')
    const ids = stored ? JSON.parse(stored) as string[] : []
    ids.push(school.id)
    localStorage.setItem('compareSchools', JSON.stringify(ids))

    setSchools([...schools, school])
    setSearchQuery('')
    setSearchResults([])
  }

  const formatMoney = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A'
    return '$' + amount.toLocaleString()
  }

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return (value * 100).toFixed(0) + '%'
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

  const getGapColor = (gap: number | null) => {
    if (gap === null) return 'text-gray-700'
    if (gap < 0) return 'text-green-600'
    if (gap <= 2500) return 'text-green-600'
    if (gap <= 7500) return 'text-yellow-600'
    if (gap <= 15000) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatGap = (gap: number | null) => {
    if (gap === null) return 'N/A'
    if (gap < 0) return '+' + formatMoney(Math.abs(gap))
    return formatMoney(gap)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-ink-soft">Loading comparison…</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader />
      <PageHero
        eyebrow="Crown Roots Foundation"
        title="Compare Schools"
        subtitle="See how your options stack up side-by-side."
        backHref="/"
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-2xl shadow-sm border border-ink/5 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-ink-soft mb-2">
                Add a school to compare
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchSchools()}
                  placeholder="Search by school name..."
                  className="flex-1 h-11 border border-ink/15 rounded-xl px-4 bg-surface focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                />
                <button
                  onClick={searchSchools}
                  disabled={searching}
                  className="h-11 bg-brand text-ink font-semibold px-4 rounded-xl hover:bg-brand-dark disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {searching ? 'Searching…' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 border border-ink/10 rounded-xl bg-surface shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((school) => (
                    <button
                      key={school.id}
                      onClick={() => addSchool(school)}
                      className="w-full text-left px-4 py-2 hover:bg-brand/10 border-b border-ink/5 last:border-b-0 cursor-pointer"
                    >
                      <div className="font-medium text-ink">{school.name}</div>
                      <div className="text-sm text-ink-soft">{school.city}, {school.state}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-soft mb-2">
                Family Income
              </label>
              <select
                value={incomeBracket}
                onChange={(e) => setIncomeBracket(e.target.value)}
                className="h-11 border border-ink/15 rounded-xl px-4 bg-surface focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
              >
                <option value="0-30k">$0 - $30,000</option>
                <option value="30-48k">$30,001 - $48,000</option>
                <option value="48-75k">$48,001 - $75,000</option>
                <option value="75-110k">$75,001 - $110,000</option>
                <option value="110k+">$110,001+</option>
              </select>
            </div>

            {schools.length > 0 && (
              <button
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 text-sm underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Map showing all compared schools */}
        {schools.length > 0 && schools.some(s => s.latitude != null) && (
          <div className="bg-surface rounded-2xl shadow-sm border border-ink/5 p-4 mb-6">
            <h2 className="font-heading text-base font-semibold text-ink mb-3">School Locations</h2>
            <SchoolMap
              schools={schools}
              incomeBracket={incomeBracket as '0-30k' | '30-48k' | '48-75k' | '75-110k' | '110k+'}
              height="360px"
            />
          </div>
        )}

        {schools.length === 0 ? (
          <div className="bg-surface rounded-2xl shadow-sm border border-ink/5 p-12 text-center">
            <svg className="mx-auto mb-4 text-ink-soft" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v18M5 8l-3 6a3 3 0 0 0 6 0l-3-6ZM19 8l-3 6a3 3 0 0 0 6 0l-3-6ZM3 8h18M8 21h8" />
            </svg>
            <h2 className="font-heading text-xl font-semibold text-ink mb-2">No schools to compare yet</h2>
            <p className="text-ink-soft mb-4">
              Search for schools above or add them from the search results page.
            </p>
            <Link
              href="/"
              className="inline-block bg-brand text-ink font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
            >
              Find Schools to Compare
            </Link>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream border-b border-ink/10">
                    <th className="text-left p-4 font-semibold text-ink-soft w-48">Metric</th>
                    {schools.map((school) => (
                      <th key={school.id} className="p-4 text-center min-w-[200px]">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => removeSchool(school.id)}
                            className="text-red-400 hover:text-red-600 text-xs mb-2 self-end cursor-pointer"
                          >
                            ✕ Remove
                          </button>
                          <Link href={`/school/${school.id}`} className="font-semibold text-brand-dark hover:underline">
                            {school.name}
                          </Link>
                          <span className="text-sm text-ink-soft">{school.city}, {school.state}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-ink/10 bg-brand/10">
                    <td className="p-4 font-medium text-ink">Your Gap (Annual)</td>
                    {schools.map((school) => {
                      const gap = getGapForBracket(school)
                      return (
                        <td key={school.id} className="p-4 text-center">
                          <span className={`text-2xl font-bold ${getGapColor(gap)}`}>
                            {formatGap(gap)}
                          </span>
                          {gap !== null && gap < 0 && (
                            <div className="text-xs text-green-600 mt-1">Money Back</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">+ Travel from Poconos</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatMoney(school.annual_travel_cost)}
                        <div className="text-xs text-ink-soft">{school.travel_type === 'FLY' ? 'Fly' : 'Drive'}</div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-ink/10 bg-brand/10">
                    <td className="p-4 font-medium">= True Annual Cost</td>
                    {schools.map((school) => {
                      const gap = getGapForBracket(school)
                      const trueCost = (gap || 0) + (school.annual_travel_cost || 0)
                      return (
                        <td key={school.id} className="p-4 text-center">
                          <span className={`text-xl font-bold ${getGapColor(trueCost)}`}>
                            {trueCost < 0 ? '+' + formatMoney(Math.abs(trueCost)) : formatMoney(trueCost)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">4-Year True Cost</td>
                    {schools.map((school) => {
                      const gap = getGapForBracket(school)
                      const trueCost = ((gap || 0) + (school.annual_travel_cost || 0)) * 4
                      return (
                        <td key={school.id} className="p-4 text-center">
                          <span className={`text-lg font-bold ${getGapColor(trueCost)}`}>
                            {trueCost < 0 ? '+' + formatMoney(Math.abs(trueCost)) : formatMoney(trueCost)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>

                  <tr className="border-b border-ink/10 bg-cream">
                    <td colSpan={schools.length + 1} className="p-4 font-semibold text-ink-soft">
                      Cost Details
                    </td>
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">Cost of Attendance</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatMoney(school.cost_of_attendance)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">No-Loan Policy</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.no_loan_policy ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-ink-soft">No</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-ink/10 bg-cream">
                    <td colSpan={schools.length + 1} className="p-4 font-semibold text-ink-soft">
                      Admissions
                    </td>
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">Admission Rate</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.admission_rate ? `${(school.admission_rate * 100).toFixed(0)}%` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">SAT Range</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.sat_read_25 && school.sat_math_25
                          ? `${school.sat_read_25 + school.sat_math_25} - ${school.sat_read_75 + school.sat_math_75}`
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">ACT Range</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.act_25 ? `${school.act_25} - ${school.act_75}` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-ink/10 bg-cream">
                    <td colSpan={schools.length + 1} className="p-4 font-semibold text-ink-soft">
                      Student Outcomes
                    </td>
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">4-Year Grad Rate</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatPercent(school.grad_rate_4yr)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">Pell Grad Rate</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatPercent(school.grad_rate_pell)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">Median Debt</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatMoney(school.median_debt)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">Median Earnings (10yr)</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatMoney(school.median_earnings_10yr)}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-ink/10 bg-cream">
                    <td colSpan={schools.length + 1} className="p-4 font-semibold text-ink-soft">
                      School Info
                    </td>
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">Type</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.control === 1 ? 'Public' : 'Private'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-ink/10">
                    <td className="p-4 font-medium">Size</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.size?.toLocaleString()} students
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-ink-soft">
          <p>Compare up to 4 schools at once. Costs shown are for the selected income bracket.</p>
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}
