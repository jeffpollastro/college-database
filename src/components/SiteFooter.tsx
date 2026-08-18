interface SiteFooterProps {
  reserveBottomBar?: boolean
}

export default function SiteFooter({ reserveBottomBar = false }: SiteFooterProps) {
  return (
    <footer className={`bg-ink text-cream/70 py-10 px-4 mt-12 ${reserveBottomBar ? 'pb-28' : ''}`}>
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">
        <span className="inline-flex bg-cream rounded-lg px-4 py-2.5">
          <img
            src="/crown-roots-logo.svg"
            alt="Crown Roots Foundation"
            className="h-[49px] w-auto object-contain"
          />
        </span>
        <div className="text-sm">
          <p>
            A{' '}
            <a
              href="https://crownroots.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream font-semibold hover:text-brand-light underline underline-offset-2"
            >
              Crown Roots Foundation
            </a>{' '}
            tool to help Pocono families find affordable colleges.
          </p>
          <p className="mt-2 text-cream/50">Data from U.S. Department of Education College Scorecard. Updated annually.</p>
        </div>
      </div>
    </footer>
  )
}
