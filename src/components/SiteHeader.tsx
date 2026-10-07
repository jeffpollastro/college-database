import Link from 'next/link'

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="Crown Roots Foundation — College Search home">
          <img
            src="/crown-roots-logo.svg"
            alt="Crown Roots Foundation"
            className="h-[72px] md:h-[88px] w-auto object-contain"
          />
          <span className="h-10 w-px bg-ink/15" aria-hidden="true" />
          <img
            src="/io-logo.svg"
            alt="I/O"
            className="h-10 w-10 md:h-12 md:w-12 object-contain"
          />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-heading text-lg font-bold text-ink tracking-wide">In/Root</span>
            <span className="text-xs font-medium text-ink-soft tracking-wide">College Search Database</span>
          </span>
        </Link>

        <a
          href="https://crownroots.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-brand-dark transition-colors"
        >
          crownroots.org
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </a>
      </div>
    </header>
  )
}
