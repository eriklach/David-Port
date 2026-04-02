'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const STATS = [
  { value: '100%', label: 'Field-First' },
  { value: '6',    label: 'Disciplines' },
  { value: '∞',    label: 'Shots Fired' },
]

function StatCard({ value, label, index }: { value: string; label: string; index: number }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: 'easeOut' }}
      className="border border-dm-border p-6 md:p-8"
    >
      <p className="font-display text-5xl md:text-6xl tracking-wider text-dm-white leading-none mb-2">
        {value}
      </p>
      <p className="font-body text-xs tracking-[0.3em] text-dm-muted uppercase">{label}</p>
    </motion.div>
  )
}

export default function About() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="bg-dm-black py-24 md:py-36 lg:py-44 border-b border-dm-border">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        {/* Top label row */}
        <div className="flex items-center gap-4 mb-12 md:mb-16">
          <span className="font-body text-[10px] tracking-[0.4em] text-dm-muted uppercase">
            01 — Who We Are
          </span>
          <div className="flex-1 h-px bg-dm-border" />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: headline */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              className="font-display leading-[0.9] tracking-wider text-dm-white uppercase"
              style={{ fontSize: 'clamp(48px, 8vw, 110px)' }}
            >
              BUILT FOR
              <br />
              THE&nbsp;
              <span className="text-dm-secondary">FIELD.</span>
            </h2>

            {/* Placeholder image area */}
            <div className="mt-8 relative overflow-hidden aspect-[4/3]">
              {/*
                DROP IMAGE HERE:
                <Image src="/media/about.jpg" alt="Draupnir Media in the field" fill className="object-cover" />
              */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, #141410 0%, #0f0f0d 50%, #0c0c0a 100%)`,
                }}
              />
              <div className="absolute bottom-4 left-4 font-body text-[9px] tracking-[0.3em] text-dm-border uppercase">
                [ Drop field photo here — about.jpg ]
              </div>
            </div>
          </motion.div>

          {/* Right: body text + stats */}
          <div className="flex flex-col gap-8 lg:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            >
              <p className="font-body font-light text-dm-secondary text-lg md:text-xl leading-relaxed mb-6">
                Draupnir Media is a full-service outdoor and sports media agency. We
                create photography, film, and brand content for athletes, events, and
                the companies that equip them.
              </p>
              <p className="font-body font-light text-dm-muted text-base leading-relaxed">
                We got into this because we live it. Every shoot is a mission — whether
                it&apos;s on a snowfield, a climbing wall, or inside a combat gym. We
                understand the culture because we&apos;re part of it. That authenticity
                shows up in every frame.
              </p>
            </motion.div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mt-4">
              {STATS.map((s, i) => (
                <StatCard key={s.label} {...s} index={i} />
              ))}
            </div>

            {/* CTA link */}
            <motion.a
              href="#work"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="self-start flex items-center gap-3 font-body text-xs tracking-[0.3em] text-dm-secondary hover:text-dm-white transition-colors duration-300 uppercase group mt-2"
            >
              <span>View Our Work</span>
              <span className="block w-8 h-px bg-current transition-all duration-300 group-hover:w-12" />
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  )
}
