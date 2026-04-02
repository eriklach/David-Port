'use client'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'WORK',     href: '#work' },
  { label: 'SERVICES', href: '#services' },
  { label: 'TEAM',     href: '#team' },
  { label: 'CONTACT',  href: '#contact' },
]

// Draupnir ring mark — Norse ring motif
function RingMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`w-5 h-5 ${className}`} aria-hidden="true">
      <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="5"  fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  )
}

export default function Navigation() {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [activeLink, setActiveLink] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-dm-black/92 backdrop-blur-md border-b border-dm-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group"
            aria-label="Draupnir Media — home"
          >
            <RingMark className="text-dm-secondary group-hover:text-dm-primary transition-colors duration-300" />
            <span className="font-display text-2xl tracking-[0.18em] text-dm-white leading-none">
              DRAUPNIR
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setActiveLink(label)}
                className={`font-body text-xs tracking-[0.22em] transition-colors duration-300 ${
                  activeLink === label
                    ? 'text-dm-white'
                    : 'text-dm-secondary hover:text-dm-white'
                }`}
              >
                {label}
              </a>
            ))}
            <a
              href="#contact"
              className="ml-2 border border-dm-white/25 px-5 py-2.5 font-body text-xs tracking-[0.2em] text-dm-white hover:bg-dm-white hover:text-dm-black transition-all duration-300"
            >
              GET IN TOUCH
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-end gap-[5px] w-10 h-10 -mr-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span
              className={`block h-px bg-dm-white transition-all duration-300 ${
                menuOpen ? 'w-6 rotate-45 translate-y-[7px]' : 'w-6'
              }`}
            />
            <span
              className={`block h-px bg-dm-white transition-all duration-300 ${
                menuOpen ? 'opacity-0 w-4' : 'w-4'
              }`}
            />
            <span
              className={`block h-px bg-dm-white transition-all duration-300 ${
                menuOpen ? 'w-6 -rotate-45 -translate-y-[7px]' : 'w-5'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 z-40 bg-dm-black flex flex-col justify-between px-8 pt-28 pb-12 transition-all duration-500 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-2">
          {NAV_LINKS.map(({ label, href }, i) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="font-display text-[13vw] leading-tight tracking-wider text-dm-white border-b border-dm-border py-4 hover:text-dm-secondary transition-colors duration-200"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {label}
            </a>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="self-start border border-dm-white/30 px-8 py-3 font-body text-xs tracking-[0.25em] text-dm-white"
          >
            GET IN TOUCH
          </a>
          <p className="font-body text-xs tracking-widest text-dm-muted">
            © 2025 DRAUPNIR MEDIA
          </p>
        </div>
      </div>
    </>
  )
}
