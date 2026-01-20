'use client'

import { useState } from 'react'
import { supabase, School } from '@/lib/supabase'

export default function Home() {
  const [incomeBracket, setIncomeBracket] = useState('0-30k')
  const [maxGap, setMaxGap] = useState<string>('any')
  const [noLoanOnly, setNoLoanOnly] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

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

  const getSeverityColor = (severity: string | null) => {
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                      <div className={`text-center px-6 py-3 rounded-lg border-2 ${getSeverityColor(school.gap_severity)}`}>
                        <div className="text-2xl font-bold">{formatMoney(gap)}</div>
                        <div className="text-sm">The Gap / year</div>
                      </div>
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
                    <div className="mt-4 flex gap-2">
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

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p>A tool by <strong className="text-white">The Crown Hub</strong> to help Pocono families find affordable colleges.</p>
          <p className="mt-2">Data from U.S. Department of Education College Scorecard. Updated annually.</p>
        </div>
      </footer>
    </main>
  )
}
