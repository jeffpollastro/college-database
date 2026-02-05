'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, School } from '@/lib/supabase'

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
      <main className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">
        <div className="text-[#3D3530]">Loading comparison...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F5F0E6]">
      <div className="bg-[#3D3530]">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <img
            src="/banner_header.png"
            alt="The Crown Hub"
            className="w-full max-h-24 object-contain object-left"
          />
        </div>
      </div>
      <div className="bg-[#CF7A3C] text-white py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Back to Search
          </Link>
          <h1 className="text-3xl font-bold">Compare Schools</h1>
          <p className="text-white/90 mt-2">See how your options stack up side-by-side</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a school to compare
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchSchools()}
                  placeholder="Search by school name..."
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#CF7A3C]"
                />
                <button
                  onClick={searchSchools}
                  disabled={searching}
                  className="bg-[#CF7A3C] text-white px-4 py-2 rounded-md hover:bg-[#B86A2F] disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((school) => (
                    <button
                      key={school.id}
                      onClick={() => addSchool(school)}
                      className="w-full text-left px-4 py-2 hover:bg-[#CF7A3C]/10 border-b last:border-b-0"
                    >
                      <div className="font-medium">{school.name}</div>
                      <div className="text-sm text-gray-700">{school.city}, {school.state}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family Income
              </label>
              <select
                value={incomeBracket}
                onChange={(e) => setIncomeBracket(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#CF7A3C]"
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
                className="text-red-600 hover:text-red-700 text-sm underline"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {schools.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-700 text-6xl mb-4">⚖️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No schools to compare yet</h2>
            <p className="text-gray-700 mb-4">
              Search for schools above or add them from the search results page.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#CF7A3C] text-white px-6 py-2 rounded-md hover:bg-[#B86A2F]"
            >
              Find Schools to Compare
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4 font-semibold text-gray-700 w-48">Metric</th>
                    {schools.map((school) => (
                      <th key={school.id} className="p-4 text-center min-w-[200px]">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => removeSchool(school.id)}
                            className="text-red-400 hover:text-red-600 text-xs mb-2 self-end"
                          >
                            ✕ Remove
                          </button>
                          <Link href={`/school/${school.id}`} className="font-semibold text-[#CF7A3C] hover:underline">
                            {school.name}
                          </Link>
                          <span className="text-sm text-gray-700">{school.city}, {school.state}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-[#CF7A3C]/10">
                    <td className="p-4 font-medium">Your Gap (Annual)</td>
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
                  <tr className="border-b">
                    <td className="p-4 font-medium">+ Travel from Poconos</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatMoney(school.annual_travel_cost)}
                        <div className="text-xs text-gray-700">{school.travel_type === 'FLY' ? 'Fly' : 'Drive'}</div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-[#CF7A3C]/10">
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
                  <tr className="border-b">
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

                  <tr className="border-b bg-gray-50">
                    <td colSpan={schools.length + 1} className="p-4 font-semibold text-gray-700">
                      Cost Details
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Cost of Attendance</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatMoney(school.cost_of_attendance)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">No-Loan Policy</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.no_loan_policy ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-700">No</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b bg-gray-50">
                    <td colSpan={schools.length + 1} className="p-4 font-semibold text-gray-700">
                      Admissions
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Admission Rate</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.admission_rate ? `${(school.admission_rate * 100).toFixed(0)}%` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">SAT Range</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.sat_read_25 && school.sat_math_25
                          ? `${school.sat_read_25 + school.sat_math_25} - ${school.sat_read_75 + school.sat_math_75}`
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">ACT Range</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.act_25 ? `${school.act_25} - ${school.act_75}` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b bg-gray-50">
                    <td colSpan={schools.length + 1} className="p-4 font-semibold text-gray-700">
                      Student Outcomes
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">4-Year Grad Rate</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatPercent(school.grad_rate_4yr)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Pell Grad Rate</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatPercent(school.grad_rate_pell)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Median Debt</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatMoney(school.median_debt)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Median Earnings (10yr)</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {formatMoney(school.median_earnings_10yr)}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b bg-gray-50">
                    <td colSpan={schools.length + 1} className="p-4 font-semibold text-gray-700">
                      School Info
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Type</td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        {school.control === 1 ? 'Public' : 'Private'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
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

        <div className="mt-6 text-center text-sm text-gray-700">
          <p>Compare up to 4 schools at once. Costs shown are for the selected income bracket.</p>
        </div>
      </div>

      <footer className="bg-[#3D3530] text-[#F5F0E6]/70 py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p>A tool by <strong className="text-white">The Crown Hub</strong> to help Pocono families find affordable colleges.</p>
          <p className="mt-2">Data from U.S. Department of Education College Scorecard. Updated annually.</p>
        </div>
      </footer>
    </main>
  )
}
