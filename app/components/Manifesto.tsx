'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef    = useRef(null)
  const inView     = useInView(textRef, { once: true, margin: '-100px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Subtle parallax — background moves slower than scroll
  const bgY   = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-dm-dark border-b border-dm-border py-32 md:py-48 lg:py-60"
    >
      {/* Parallax background layer */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-[-20%] pointer-events-none"
      >
        {/*
          DROP FULL-BLEED PARALLAX IMAGE HERE:
          <Image src="/media/manifesto-bg.jpg" alt="" fill className="object-cover opacity-20" />
        */}
        <div
          className="w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 20% 30%, #181814 0%, transparent 60%),
              radial-gradient(ellipse 70% 80% at 80% 70%, #141412 0%, transparent 55%),
              #0d0d0c
            `,
          }}
        />
        {/* Subtle diagonal lines texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #ffffff 0px,
              #ffffff 1px,
              transparent 1px,
              transparent 60px
            )`,
          }}
        />
      </motion.div>

      {/* Text content */}
      <motion.div
        ref={textRef}
        style={{ y: textY }}
        className="relative z-10 max-w-screen-lg mx-auto px-6 lg:px-12 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-body text-[10px] tracking-[0.45em] text-dm-muted uppercase mb-10 md:mb-14"
        >
          Our Philosophy
        </motion.p>

        {/* Large pull quote */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-display leading-[0.9] tracking-wider uppercase"
          style={{ fontSize: 'clamp(42px, 8.5vw, 115px)' }}
        >
          <span className="text-dm-white">WE EXIST AT THE</span>
          <br />
          <span className="text-dm-white">INTERSECTION OF</span>
          <br />
          <span className="text-dm-secondary">SPORT &amp; STORY.</span>
        </motion.h2>

        {/* Horizontal rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-24 h-px bg-dm-border mx-auto my-10 md:my-14 origin-center"
        />

        {/* Body paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="font-body font-light text-dm-secondary text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
        >
          Every athlete has a story that deserves to be told well. We bring the visual
          language of cinema to the world of outdoor sports — crafting media that moves,
          inspires, and endures long after the moment has passed.
        </motion.p>

        {/* Attribution */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="font-body text-[10px] tracking-[0.35em] text-dm-border mt-8 uppercase"
        >
          — Draupnir Media, est. 2025
        </motion.p>
      </motion.div>
    </section>
  )
}
