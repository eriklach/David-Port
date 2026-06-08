function RingMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`w-4 h-4 ${className}`} aria-hidden="true">
      <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="5"  fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  )
}

const FOOTER_LINKS = [
  { label: 'Work',      href: '#work' },
  { label: 'Services',  href: '#services' },
  { label: 'Team',      href: '#team' },
  { label: 'Contact',   href: '#contact' },
]

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#' },
  { label: 'Vimeo',     href: '#' },
  { label: 'LinkedIn',  href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-dm-black py-12 md:py-16">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-dm-border">
          {/* Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <RingMark className="text-dm-muted group-hover:text-dm-secondary transition-colors duration-300" />
            <span className="font-display text-xl tracking-[0.18em] text-dm-white">
              DRAUPNIR
            </span>
          </a>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-6 md:gap-8">
            {FOOTER_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="font-body text-xs tracking-[0.22em] text-dm-muted hover:text-dm-white transition-colors duration-300 uppercase"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Social */}
          <div className="flex gap-5">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="font-body text-xs tracking-[0.2em] text-dm-muted hover:text-dm-white transition-colors duration-200 uppercase"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-body text-[10px] tracking-[0.28em] text-dm-border uppercase">
            © {new Date().getFullYear()} Draupnir Media. All rights reserved.
          </p>
          <p className="font-body text-[10px] tracking-[0.24em] text-dm-border uppercase">
            BC, Canada &nbsp;·&nbsp; Available Worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}
