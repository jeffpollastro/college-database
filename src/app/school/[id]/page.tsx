'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, School } from '@/lib/supabase'

export default function SchoolDetail() {
  const params = useParams()
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [incomeBracket, setIncomeBracket] = useState('0-30k')
  const [isInCompare, setIsInCompare] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('compareSchools')
    if (stored && params.id) {
      const ids = JSON.parse(stored) as string[]
      setIsInCompare(ids.includes(params.id as string))
    }
  }, [params.id])

  const toggleCompare = () => {
    const stored = localStorage.getItem('compareSchools')
    let ids = stored ? JSON.parse(stored) as string[] : []
    const schoolId = params.id as string

    if (ids.includes(schoolId)) {
      ids = ids.filter(id => id !== schoolId)
      setIsInCompare(false)
    } else {
      if (ids.length >= 4) {
        alert('You can compare up to 4 schools at a time')
        return
      }
      ids.push(schoolId)
      setIsInCompare(true)
    }
    localStorage.setItem('compareSchools', JSON.stringify(ids))
  }

  useEffect(() => {
    async function fetchSchool() {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching school:', error)
      } else {
        setSchool(data)
      }
      setLoading(false)
    }

    if (params.id) {
      fetchSchool()
    }
  }, [params.id])

  const formatMoney = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A'
    return '$' + amount.toLocaleString()
  }

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return (value * 100).toFixed(0) + '%'
  }

  const getGapForBracket = (bracket: string): number | null => {
    if (!school) return null
    const gaps: Record<string, number | null> = {
      '0-30k': school.gap_0_30k,
      '30-48k': school.gap_30_48k,
      '48-75k': school.gap_48_75k,
      '75-110k': school.gap_75_110k,
      '110k+': school.gap_110k_plus,
    }
    return gaps[bracket]
  }

  const getSeverityColor = (gap: number | null) => {
    if (gap === null) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (gap < 0) return 'bg-green-100 text-green-800 border-green-300'
    if (gap <= 2500) return 'bg-green-100 text-green-800 border-green-300'
    if (gap <= 7500) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (gap <= 15000) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  const getGapLabel = (gap: number | null) => {
    if (gap === null) return 'Unknown'
    if (gap < 0) return 'Money Back'
    if (gap === 0) return 'Free'
    if (gap <= 2500) return 'Very Affordable'
    if (gap <= 7500) return 'Moderate'
    if (gap <= 15000) return 'Expensive'
    return 'Very Expensive'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-700">Loading school details...</div>
      </main>
    )
  }

  if (!school) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">School Not Found</h1>
          <Link href="/" className="text-[#CF7A3C] hover:underline">Back to Search</Link>
        </div>
      </main>
    )
  }

  const currentGap = getGapForBracket(incomeBracket)
  const trueCost = (currentGap || 0) + (school.annual_travel_cost || 0)
  const fourYearGap = currentGap !== null ? currentGap * 4 : null
  const fourYearTrueCost = trueCost * 4

  return (
    <main className="min-h-screen bg-[#F5F0E6]">
      <div className="bg-[#3D3530]">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <img
            src="/banner_header.png"
            alt="The Crown Hub"
            className="w-full max-h-24 object-contain object-left"
          />
        </div>
      </div>
      <div className="bg-[#CF7A3C] text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Back to Search
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{school.name}</h1>
              <p className="text-white/90">{school.city}, {school.state}</p>
              <p className="text-white/80 text-sm mt-1">
                {school.control === 1 ? 'Public' : 'Private'} - {school.size?.toLocaleString()} students
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {school.no_loan_policy && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  No-Loan Policy
                </span>
              )}
              <button
                onClick={toggleCompare}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isInCompare
                    ? 'bg-[#5FBBC4] text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isInCompare ? '✓ In Compare List' : '+ Add to Compare'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calculate costs for your family income:
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

        <div className={'rounded-lg shadow-md p-6 mb-6 border-2 ' + getSeverityColor(currentGap)}>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700 mb-1">Your Annual Gap</div>
            <div className="text-4xl font-bold mb-2">
              {currentGap !== null && currentGap < 0
                ? '+' + formatMoney(Math.abs(currentGap))
                : formatMoney(currentGap)
              }
            </div>
            <div className="text-lg font-medium mb-4">{getGapLabel(currentGap)}</div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <div className="text-sm text-gray-700">+ Travel from Poconos</div>
                <div className="text-xl font-semibold">{formatMoney(school.annual_travel_cost)}/yr</div>
              </div>
              <div>
                <div className="text-sm text-gray-700">= True Annual Cost</div>
                <div className="text-xl font-bold">{formatMoney(trueCost)}/yr</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">How The Gap Is Calculated</h2>
          <p className="text-sm text-gray-700 mb-4">
            The Gap is what your family actually pays out-of-pocket after all grants and scholarships are applied.
            It's the difference between the school's total cost and the financial aid you're expected to receive.
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Published Cost of Attendance</span>
                <span className="font-semibold">{formatMoney(school.cost_of_attendance)}</span>
              </div>
              <div className="text-xs text-gray-700 -mt-2 mb-2">
                (Tuition, room & board, books, fees, and living expenses)
              </div>

              {currentGap !== null && school.cost_of_attendance && (
                <div className="flex justify-between items-center text-green-700">
                  <span>Estimated Grant Aid for Your Income</span>
                  <span className="font-semibold">− {formatMoney(school.cost_of_attendance - currentGap)}</span>
                </div>
              )}

              <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Your Gap (What You Pay)</span>
                <span className="font-bold text-lg">
                  {currentGap !== null && currentGap < 0
                    ? <span className="text-green-700">+{formatMoney(Math.abs(currentGap))}</span>
                    : formatMoney(currentGap)
                  }
                </span>
              </div>

              {currentGap !== null && currentGap < 0 && (
                <div className="text-sm text-green-700 bg-green-50 p-2 rounded mt-2">
                  <strong>Good news!</strong> At your income level, this school provides more aid than the cost of attendance.
                  The extra {formatMoney(Math.abs(currentGap))} can help cover personal expenses, transportation, or other costs.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            <p><strong>Important:</strong> The Gap does NOT include loans. Loans are money you must pay back,
            so we don't count them as aid. This number shows what you'd need to cover through savings,
            work-study, or borrowing.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">4-Year Cost Projection</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-700">4-Year Gap Total</div>
              <div className="text-2xl font-bold">
                {fourYearGap !== null && fourYearGap < 0 
                  ? '+' + formatMoney(Math.abs(fourYearGap))
                  : formatMoney(fourYearGap)
                }
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-700">4-Year Travel</div>
              <div className="text-2xl font-bold">{formatMoney((school.annual_travel_cost || 0) * 4)}</div>
            </div>
            <div className="bg-[#CF7A3C]/10 rounded-lg p-3">
              <div className="text-sm text-[#CF7A3C]">4-Year True Cost</div>
              <div className="text-2xl font-bold text-[#3D3530]">{formatMoney(fourYearTrueCost)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Gap by Family Income</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Family Income</th>
                  <th className="text-right py-2">Annual Gap</th>
                  <th className="text-right py-2">4-Year Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { bracket: '0-30k', label: '$0 - $30,000' },
                  { bracket: '30-48k', label: '$30,001 - $48,000' },
                  { bracket: '48-75k', label: '$48,001 - $75,000' },
                  { bracket: '75-110k', label: '$75,001 - $110,000' },
                  { bracket: '110k+', label: '$110,001+' },
                ].map(({ bracket, label }) => {
                  const gap = getGapForBracket(bracket)
                  const isSelected = bracket === incomeBracket
                  return (
                    <tr key={bracket} className={'border-b ' + (isSelected ? 'bg-[#CF7A3C]/10 font-medium' : '')}>
                      <td className="py-2">{label}</td>
                      <td className="text-right py-2">
                        {gap !== null && gap < 0 
                          ? <span className="text-green-600">+{formatMoney(Math.abs(gap))}</span>
                          : formatMoney(gap)
                        }
                      </td>
                      <td className="text-right py-2">
                        {gap !== null && gap < 0 
                          ? <span className="text-green-600">+{formatMoney(Math.abs(gap * 4))}</span>
                          : formatMoney(gap !== null ? gap * 4 : null)
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Admissions</h2>
          {school.admission_rate || school.sat_read_25 || school.act_25 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {school.admission_rate && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">{(school.admission_rate * 100).toFixed(0)}%</div>
                    <div className="text-sm text-gray-700">Admission Rate</div>
                  </div>
                )}
                {school.sat_read_25 && school.sat_math_25 && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {school.sat_read_25 + school.sat_math_25} - {school.sat_read_75 + school.sat_math_75}
                    </div>
                    <div className="text-sm text-gray-700">SAT Range (middle 50%)</div>
                  </div>
                )}
                {school.act_25 && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">{school.act_25} - {school.act_75}</div>
                    <div className="text-sm text-gray-700">ACT Range (middle 50%)</div>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-700">
                <p>"Middle 50%" means 25% of admitted students scored below this range and 25% scored above it. Being below the range does not mean automatic rejection.</p>
              </div>
            </>
          ) : (
            <p className="text-gray-700 text-sm">Admission data not reported. This school may have open enrollment or test-optional admissions.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Student Outcomes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{formatPercent(school.grad_rate_4yr)}</div>
              <div className="text-sm text-gray-700">4-Year Grad Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{formatPercent(school.grad_rate_pell)}</div>
              <div className="text-sm text-gray-700">Pell Grad Rate</div>
              <div className="text-xs text-gray-700">(low-income students)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{formatMoney(school.median_debt)}</div>
              <div className="text-sm text-gray-700">Median Debt</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{formatMoney(school.median_earnings_10yr)}</div>
              <div className="text-sm text-gray-700">Earnings (10yr)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Getting There from the Poconos</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-700">Travel Type</div>
              <div className="text-lg font-medium">{school.travel_type === 'FLY' ? 'Fly' : 'Drive'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-700">Annual Travel Budget</div>
              <div className="text-lg font-medium">{formatMoney(school.annual_travel_cost)}</div>
              <div className="text-xs text-gray-700">(estimated 5 trips/year)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Learn More</h2>
          <div className="flex flex-wrap gap-3">
            {school.npc_url && (
              <a
                href={school.npc_url.startsWith('http') ? school.npc_url : 'https://' + school.npc_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#CF7A3C] text-white px-4 py-2 rounded-md hover:bg-[#B86A2F]"
              >
                Net Price Calculator
              </a>
            )}
            {school.website_url && (
              <a
                href={school.website_url.startsWith('http') ? school.website_url : 'https://' + school.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                School Website
              </a>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#3D3530] to-[#4D4540] rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Make This Happen</h2>
          <p className="text-white/80 mb-6">
            Ready to make {school.name} a reality for your family? Here's your action plan:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-white/10 rounded-lg p-4">
              <div className="bg-[#CF7A3C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold">Get Your Personalized Estimate</h3>
                <p className="text-white/80 text-sm mt-1">
                  Use the school's Net Price Calculator for a more accurate estimate based on your specific situation.
                  Have your family's tax info ready.
                </p>
                {school.npc_url && (
                  <a
                    href={school.npc_url.startsWith('http') ? school.npc_url : 'https://' + school.npc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 bg-[#CF7A3C] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#B86A2F]"
                  >
                    Open Net Price Calculator →
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 rounded-lg p-4">
              <div className="bg-[#CF7A3C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold">File Your FAFSA Early</h3>
                <p className="text-white/80 text-sm mt-1">
                  The Free Application for Federal Student Aid opens October 1st each year. Filing early gives you the best
                  chance at aid. It's free and required for most financial aid.
                </p>
                <a
                  href="https://studentaid.gov/h/apply-for-aid/fafsa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-[#CF7A3C] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#B86A2F]"
                >
                  Go to FAFSA →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 rounded-lg p-4">
              <div className="bg-[#CF7A3C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold">Plan for Your Gap</h3>
                <p className="text-white/80 text-sm mt-1">
                  {currentGap !== null && currentGap <= 0
                    ? "Great news - this school may cost you nothing or even provide extra funds! Still, having a small savings cushion helps with unexpected expenses."
                    : `You'll need to cover about ${formatMoney(fourYearTrueCost)} over 4 years. Options include: savings, work-study jobs, payment plans, or carefully considered loans as a last resort.`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 rounded-lg p-4">
              <div className="bg-[#CF7A3C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold">Get Free Guidance from The Crown Hub</h3>
                <p className="text-white/80 text-sm mt-1">
                  We're here to help Pocono families navigate the college process. From FAFSA help to application essays,
                  our team can guide you through every step - at no cost.
                </p>
                <a
                  href="https://thecrownhub.org/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-[#5FBBC4] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#4AA8B1]"
                >
                  Connect with The Crown Hub →
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 text-center">
            <p className="text-white/80 text-sm">
              <strong className="text-white">Remember:</strong> College is an investment in your future.
              Don't let The Gap discourage you - with the right plan, it's achievable.
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-[#3D3530] text-[#F5F0E6]/70 py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>A tool by <strong className="text-white">The Crown Hub</strong> to help Pocono families find affordable colleges.</p>
          <p className="mt-2">Data from U.S. Department of Education College Scorecard. Updated annually.</p>
        </div>
      </footer>
    </main>
  )
}
