'use client'

import { useState } from 'react'
import Link from 'next/link'
import { crownPicks, crownPicksMeta } from '@/data/crownPicks'
import {
  hiddenValueSchools,
  hiddenValueBaseline,
  type IncomeBracket,
} from '@/data/hiddenValueSchools'

type Tab = 'top10' | 'hidden'

const tabText: Record<Tab, string> = {
  top10: 'Ten schools most Crown Roots students can get into and afford.',
  hidden:
    'For students with top grades and test scores: very selective schools that can cost a low-income family little or nothing.',
}

const bracketLabels: Record<IncomeBracket, string> = {
  '0-30k': '$0 - $30,000',
  '30-48k': '$30,001 - $48,000',
  '48-75k': '$48,001 - $75,000',
  '75-110k': '$75,001 - $110,000',
  '110k+': '$110,001+',
}

const money = (n: number) => `$${n.toLocaleString('en-US')}`

function gapClass(gap: number) {
  if (gap <= 2500) return 'text-mint-ink'
  if (gap <= 7500) return 'text-brand-dark'
  if (gap <= 15000) return 'text-clay-dark'
  return 'text-red-700'
}

export default function SchoolPicks({ incomeBracket }: { incomeBracket: IncomeBracket }) {
  const [tab, setTab] = useState<Tab>('top10')
  const [bracket, setBracket] = useState<IncomeBracket | null>(null)
  // Follow the search form's income until the visitor picks one here.
  const activeBracket = bracket ?? incomeBracket
  const hasOlderData = crownPicks.some((p) => p.olderData)
  const sorted = [...hiddenValueSchools].sort((a, b) => a.gap[activeBracket] - b.gap[activeBracket])

  const tabButton = (id: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      id={`picks-tab-${id}`}
      aria-selected={tab === id}
      aria-controls={`picks-panel-${id}`}
      onClick={() => setTab(id)}
      className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold transition-colors ${
        tab === id ? 'bg-ink text-brand-light' : 'bg-surface text-ink hover:bg-brand-light/30'
      }`}
    >
      {label}
    </button>
  )

  return (
    <section className="bg-surface rounded-2xl shadow-sm border border-ink/5 p-6 md:p-8 mb-8" aria-labelledby="school-picks-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="school-picks-heading" className="font-heading text-xl font-semibold text-ink">
          Our School Picks
        </h2>
        <a href="#search" className="text-sm font-semibold text-brand-dark underline underline-offset-2 hover:text-ink">
          Search all schools
        </a>
      </div>

      <div role="tablist" aria-label="Choose a list of schools" className="mt-4 flex sm:inline-flex rounded-xl border-2 border-ink overflow-hidden">
        {tabButton('top10', 'Crown Top 10')}
        {tabButton('hidden', 'Hidden Value Schools')}
      </div>
      <p className="mt-3 text-sm text-ink-soft">{tabText[tab]}</p>

      {tab === 'top10' && (
        <div role="tabpanel" id="picks-panel-top10" aria-labelledby="picks-tab-top10">
          <p className="mt-4 rounded-xl border-l-4 border-brand bg-cream p-4 text-sm text-ink leading-relaxed">
            If you are a student with a <strong>3.2 to 3.7 GPA</strong> and about an <strong>1100 SAT</strong>, from a
            family earning <strong>under $75,000 a year</strong>, these are strong options for Pocono families, along
            with the degrees worth pursuing at each.
          </p>

          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {crownPicks.map((pick) => (
              <li key={pick.unitid}>
                <Link
                  href={`/school/${pick.id}`}
                  className="flex gap-4 h-full rounded-xl border border-ink/10 p-4 hover:border-brand hover:bg-brand-light/15 transition-colors"
                >
                  <span
                    className="shrink-0 w-9 h-9 rounded-full bg-brand text-ink font-heading font-bold flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {pick.rank}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-semibold text-ink">
                        <span className="sr-only">Number {pick.rank}: </span>
                        {pick.name} <span className="font-normal text-ink-soft">({pick.state})</span>
                      </span>
                      <span className="font-heading font-semibold text-brand-dark whitespace-nowrap">
                        {pick.owed}
                        {pick.olderData && <span aria-hidden="true">*</span>}
                        <span className="font-sans font-normal text-xs text-ink-soft"> / year</span>
                      </span>
                    </span>
                    <span className="block mt-1 text-sm text-ink">{pick.why}</span>
                    <span className="block mt-1 text-xs text-ink-soft">
                      <strong className="text-ink">Degrees worth pursuing:</strong> {pick.degrees}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-5 text-xs text-ink-soft leading-relaxed space-y-1.5">
            <p>
              <strong className="text-ink">How to read the price:</strong> it is what one sample family would owe the
              school each year for tuition, fees, housing, and food after grants, before loans. The sample family:
              Pennsylvania residents, household of five, $56,000 income, student with a 3.5 GPA and 1110 SAT living
              on campus. Prices come from each school&rsquo;s own cost calculator and are estimates, not offers. Your
              cost will be different, so run the school&rsquo;s calculator with your own numbers.
            </p>
            {hasOlderData && <p>* Based on older calculator data. Expect the current figure to differ.</p>}
            <p>
              Last reviewed {crownPicksMeta.lastReviewed}.{' '}
              <a
                href={crownPicksMeta.methodUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-dark underline underline-offset-2 hover:text-ink"
              >
                How we choose the Crown Top 10
              </a>
            </p>
          </div>
        </div>
      )}

      {tab === 'hidden' && (
        <div role="tabpanel" id="picks-panel-hidden" aria-labelledby="picks-tab-hidden">
          <p className="mt-4 rounded-xl border-l-4 border-brand bg-cream p-4 text-sm text-ink leading-relaxed">
            These schools are hard to get into, and some admit fewer than one in ten applicants. For a student who
            gets in, their aid can make them cheaper than staying local. East Stroudsburg is shown last for comparison.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label htmlFor="hidden-value-bracket" className="text-sm font-medium text-ink-soft">
              Your family income
            </label>
            <select
              id="hidden-value-bracket"
              value={activeBracket}
              onChange={(e) => setBracket(e.target.value as IncomeBracket)}
              className="h-11 border border-ink/15 rounded-xl px-3 bg-surface focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            >
              {(Object.keys(bracketLabels) as IncomeBracket[]).map((b) => (
                <option key={b} value={b}>
                  {bracketLabels[b]}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-ink text-brand-light text-left">
                  <th scope="col" className="px-3 py-2.5 font-semibold">School</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold whitespace-nowrap">Cost per year</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold hidden sm:table-cell">Admits</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold hidden md:table-cell">Drive</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold hidden md:table-cell">Source</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr key={s.unitid} className="border-b border-ink/10 align-top">
                    <td className="px-3 py-3">
                      <Link href={`/school/${s.id}`} className="font-semibold text-ink hover:text-brand-dark hover:underline">
                        {s.name}
                      </Link>
                      <span className="block text-xs text-ink-soft">
                        {s.location}
                        {s.note ? ` · ${s.note}` : ''}
                        <span className="sm:hidden"> · admits {s.acceptRate}</span>
                      </span>
                    </td>
                    <td className={`px-3 py-3 font-heading font-semibold whitespace-nowrap ${gapClass(s.gap[activeBracket])}`}>
                      {money(s.gap[activeBracket])}
                      {s.sourceLabel !== 'Tuition Tracker' && <span aria-hidden="true">*</span>}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">{s.acceptRate}</td>
                    <td className="px-3 py-3 hidden md:table-cell whitespace-nowrap">{s.drive}</td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-dark underline underline-offset-2 hover:text-ink">
                        {s.sourceLabel}
                      </a>
                    </td>
                  </tr>
                ))}
                <tr className="bg-cream text-ink-soft italic align-top">
                  <td className="px-3 py-3">
                    {hiddenValueBaseline.name} <span className="text-xs">(for comparison)</span>
                    <span className="block text-xs">{hiddenValueBaseline.location}</span>
                  </td>
                  <td className="px-3 py-3 font-heading font-semibold whitespace-nowrap">
                    {money(hiddenValueBaseline.gap[activeBracket])}
                  </td>
                  <td className="px-3 py-3 hidden sm:table-cell">{hiddenValueBaseline.acceptRate}</td>
                  <td className="px-3 py-3 hidden md:table-cell">Local</td>
                  <td className="px-3 py-3 hidden md:table-cell">{hiddenValueBaseline.sourceLabel}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-ink-soft leading-relaxed space-y-1.5">
            <p>
              <strong className="text-ink">How to read the cost:</strong> it is the average net price families in that
              income range paid after grants and scholarships, from Tuition Tracker (federal data, 2023-24). Loans are
              not counted.
            </p>
            <p>
              * Lehigh&rsquo;s figures come from its own net price calculator for 2027-28, because the Lehigh Commitment
              is newer than the published data. They are estimates for one sample family (Pennsylvania, household of
              five), not averages.
            </p>
            <p>Acceptance rates are approximate. Run each school&rsquo;s calculator with your own numbers.</p>
          </div>
        </div>
      )}
    </section>
  )
}
