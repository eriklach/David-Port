'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SIZZLE_SRC = '/media/draupnirSizzleTest3.mp4'

export default function SizzleReel() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-dm-black pt-6 pb-0">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full bg-black aspect-video overflow-hidden"
      >
        {/* Muted + playsInline are required for browsers to allow autoplay */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={SIZZLE_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Draupnir Media sizzle reel"
        />
      </motion.div>
    </section>
  )
}
