'use client'
import { useRef } from 'react'
import Image from 'next/image'
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
      {/* ── Background image ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-[1.12]">
        <Image
          src="/media/hero.jpeg"
          alt="Draupnir Media — crowd at a Fly Human Fly street activation"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {/* Dark overlays + blur — keep the headline legible over a busy photo */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-dm-black/45 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-dm-black via-dm-black/40 to-dm-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-dm-black/70 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgba(0,0,0,0.55)_0%,transparent_70%)] pointer-events-none" />

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
          Experiential Marketing &nbsp;·&nbsp; Events &nbsp;·&nbsp; Brand
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
