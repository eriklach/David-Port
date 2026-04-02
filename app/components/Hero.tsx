'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Parallax: background slides up slightly as user scrolls
  const bgY      = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const opacity  = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  return (
    <section
      ref={ref}
      id="hero"
      className="relative h-[100svh] min-h-[640px] overflow-hidden bg-dm-black"
    >
      {/* ── Background (video or image drops here) ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-[1.12]">
        {/*
          DROP YOUR HERO VIDEO HERE:
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/media/hero.mp4"
            poster="/media/hero-poster.jpg"
          />
        */}
        {/* Placeholder cinematic gradient */}
        <div className="video-placeholder absolute inset-0" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 60% at 25% 35%, #1d1d18 0%, transparent 65%),
              radial-gradient(ellipse 60% 70% at 75% 65%, #181818 0%, transparent 55%)
            `,
          }}
        />
      </motion.div>

      {/* Dark gradient overlays — bottom-heavy for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-dm-black via-dm-black/25 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-dm-black/55 via-transparent to-transparent pointer-events-none" />

      {/* ── Main content ── */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
          className="font-body text-[10px] tracking-[0.45em] text-dm-muted uppercase mb-5"
        >
          Outdoor &nbsp;·&nbsp; Sports &nbsp;·&nbsp; Adventure
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-display leading-[0.87] tracking-[0.06em] text-dm-white uppercase select-none"
          style={{ fontSize: 'clamp(72px, 16vw, 220px)' }}
        >
          DRAUPNIR
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, delay: 1.0, ease: 'easeOut' }}
          className="w-full max-w-[52rem] h-px bg-dm-border my-3 origin-center"
        />

        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display leading-[0.87] tracking-[0.14em] text-dm-secondary uppercase select-none"
          style={{ fontSize: 'clamp(36px, 7.5vw, 100px)' }}
        >
          MEDIA
        </motion.h2>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="font-body font-light text-dm-secondary mt-7 max-w-sm md:max-w-md text-sm md:text-base tracking-wide leading-relaxed"
        >
          We don&apos;t just document the moment.
          <br />
          We build the visual identity of your sport.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4 }}
          className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <a
            href="#work"
            className="bg-dm-white text-dm-black font-body font-semibold text-[10px] tracking-[0.28em] px-8 py-4 hover:bg-dm-primary transition-colors duration-300 uppercase"
          >
            See Our Work
          </a>
          <a
            href="#contact"
            className="border border-dm-white/30 text-dm-white font-body font-light text-[10px] tracking-[0.28em] px-8 py-4 hover:border-dm-white/70 hover:bg-dm-white/5 transition-all duration-300 uppercase"
          >
            Work With Us
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="font-body text-[9px] tracking-[0.38em] text-dm-muted uppercase">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-dm-muted/60 to-transparent animate-bounce-slow" />
      </motion.div>
    </section>
  )
}
