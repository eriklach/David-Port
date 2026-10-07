'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── Contact details — edit these to change where enquiries go ────────────
const CONTACT_EMAIL = 'hello@draupnirmedia.com'
const INSTAGRAM_URL = 'https://www.instagram.com/draupnir.media/'
const LOCATION      = 'Toronto, Canada — Available Worldwide'

export default function Contact() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="contact" className="bg-dm-dark border-b border-dm-border py-24 md:py-36 lg:py-48">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">

        {/* Hero text */}
        <div className="mb-16 md:mb-20">
          <span className="block font-body text-[10px] tracking-[0.4em] text-dm-muted uppercase mb-4">
            05 — Contact
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
            <span className="text-dm-secondary">CREATE</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: pitch + call-to-action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-10"
          >
            <p className="font-body font-light text-dm-secondary text-base md:text-lg leading-relaxed max-w-md">
              Launching a brand? Covering an event? Tell us what you need and
              we&apos;ll build something worth watching.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="bg-dm-white text-dm-black font-body font-semibold text-xs md:text-sm tracking-[0.18em] px-8 py-5 hover:bg-dm-primary transition-colors duration-300 uppercase"
              >
                {CONTACT_EMAIL}
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 border border-dm-white/30 text-dm-white font-body font-light text-xs md:text-sm tracking-[0.18em] px-8 py-5 hover:border-dm-white/70 hover:bg-dm-white/5 transition-all duration-300 uppercase"
              >
                DM Us
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  ↗
                </span>
              </a>
            </div>
          </motion.div>

          {/* Right: contact details */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="flex flex-col gap-6 lg:pt-2"
          >
            <div>
              <p className="font-body text-[9px] tracking-[0.38em] text-dm-muted uppercase mb-1">
                Email
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-body text-dm-primary hover:text-dm-white transition-colors duration-200 text-base tracking-wide"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
            <div>
              <p className="font-body text-[9px] tracking-[0.38em] text-dm-muted uppercase mb-1">
                Based In
              </p>
              <p className="font-body text-dm-secondary text-sm tracking-wide">
                {LOCATION}
              </p>
            </div>
            <div>
              <p className="font-body text-[9px] tracking-[0.38em] text-dm-muted uppercase mb-1">
                Follow
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs tracking-[0.22em] text-dm-secondary hover:text-dm-white transition-colors duration-200 uppercase"
              >
                Instagram
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
