'use client'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const SERVICES_OPTIONS = [
  'Photography',
  'Videography',
  'Web Design',
  'Branding',
  'Editing',
  'Copywriting',
  'Full Package',
]

export default function Contact() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const [selected, setSelected]   = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const toggle = (s: string) => {
    setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire to form backend (Resend, Formspree, etc.)
    setSubmitted(true)
  }

  return (
    <section id="contact" className="bg-dm-dark border-b border-dm-border py-24 md:py-36 lg:py-48">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">

        {/* Hero text */}
        <div className="mb-16 md:mb-20">
          <span className="block font-body text-[10px] tracking-[0.4em] text-dm-muted uppercase mb-4">
            05 — Let&apos;s Go
          </span>
          <motion.h2
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display tracking-wider text-dm-white uppercase leading-[0.88]"
            style={{ fontSize: 'clamp(52px, 10vw, 140px)' }}
          >
            LET&apos;S
            <br />
            <span className="text-dm-secondary">CREATE.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: contact info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-8"
          >
            <p className="font-body font-light text-dm-secondary text-base md:text-lg leading-relaxed max-w-md">
              Whether you&apos;re launching a brand, covering an event, or building your
              athlete presence — we want to hear about it. Tell us what you need and
              we&apos;ll build something worth watching.
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <p className="font-body text-[9px] tracking-[0.38em] text-dm-muted uppercase mb-1">
                  Email
                </p>
                <a
                  href="mailto:hello@draupnirmedia.com"
                  className="font-body text-dm-primary hover:text-dm-white transition-colors duration-200 text-base tracking-wide"
                >
                  hello@draupnirmedia.com
                </a>
              </div>
              <div>
                <p className="font-body text-[9px] tracking-[0.38em] text-dm-muted uppercase mb-1">
                  Based In
                </p>
                <p className="font-body text-dm-secondary text-sm tracking-wide">
                  British Columbia, Canada — Available Worldwide
                </p>
              </div>
            </div>

            {/* Social links */}
            <div>
              <p className="font-body text-[9px] tracking-[0.38em] text-dm-muted uppercase mb-4">
                Follow
              </p>
              <div className="flex gap-5">
                {['Instagram', 'Vimeo', 'LinkedIn'].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="font-body text-xs tracking-[0.22em] text-dm-secondary hover:text-dm-white transition-colors duration-200 uppercase"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: contact form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            {submitted ? (
              <div className="flex flex-col gap-4 py-10">
                <p className="font-display text-4xl md:text-5xl tracking-wider text-dm-white uppercase">
                  GOT IT.
                </p>
                <p className="font-body text-dm-secondary leading-relaxed">
                  Thanks for reaching out — we&apos;ll be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Name + email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="font-body text-[9px] tracking-[0.32em] text-dm-muted uppercase">
                      Name
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      className="bg-transparent border border-dm-border text-dm-primary font-body text-sm px-4 py-3 placeholder:text-dm-border focus:outline-none focus:border-dm-secondary transition-colors duration-200"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="font-body text-[9px] tracking-[0.32em] text-dm-muted uppercase">
                      Email
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="bg-transparent border border-dm-border text-dm-primary font-body text-sm px-4 py-3 placeholder:text-dm-border focus:outline-none focus:border-dm-secondary transition-colors duration-200"
                    />
                  </label>
                </div>

                {/* Service checkboxes */}
                <div className="flex flex-col gap-3">
                  <span className="font-body text-[9px] tracking-[0.32em] text-dm-muted uppercase">
                    I need...
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(s)}
                        className={`font-body text-[9px] tracking-[0.22em] px-3.5 py-2 border transition-all duration-200 uppercase ${
                          selected.includes(s)
                            ? 'border-dm-white/60 text-dm-white bg-dm-white/8'
                            : 'border-dm-border text-dm-muted hover:border-dm-secondary hover:text-dm-secondary'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <label className="flex flex-col gap-2">
                  <span className="font-body text-[9px] tracking-[0.32em] text-dm-muted uppercase">
                    Tell us about your project
                  </span>
                  <textarea
                    rows={5}
                    placeholder="What are you building? What does success look like?"
                    className="bg-transparent border border-dm-border text-dm-primary font-body text-sm px-4 py-3 placeholder:text-dm-border focus:outline-none focus:border-dm-secondary transition-colors duration-200 resize-none"
                  />
                </label>

                <button
                  type="submit"
                  className="self-start bg-dm-white text-dm-black font-body font-semibold text-[10px] tracking-[0.3em] px-10 py-4 hover:bg-dm-primary transition-colors duration-300 uppercase"
                >
                  Send It
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
