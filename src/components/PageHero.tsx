import Link from 'next/link'
import type { ReactNode } from 'react'

interface PageHeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  children?: ReactNode
}

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel = 'Back to Search',
  children,
}: PageHeroProps) {
  return (
    <div className="bg-gradient-to-br from-brand to-brand-dark">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-ink/70 hover:text-ink text-sm font-medium mb-4 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {backLabel}
          </Link>
        )}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            {eyebrow && (
              <div className="text-ink/70 text-xs font-bold uppercase tracking-widest mb-1.5">
                {eyebrow}
              </div>
            )}
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-ink">{title}</h1>
            {subtitle && <p className="text-ink/80 mt-2 max-w-2xl leading-relaxed">{subtitle}</p>}
          </div>
          {children && <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">{children}</div>}
        </div>
      </div>
    </div>
  )
}
