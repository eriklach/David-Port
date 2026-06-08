'use client'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── Replace YOUR_VIDEO_ID with the actual YouTube video ID ───────────────
// e.g. for https://www.youtube.com/watch?v=dQw4w9WgXcQ  →  use "dQw4w9WgXcQ"
const YOUTUBE_ID = 'YOUR_VIDEO_ID'

export default function SizzleReel() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [loaded, setLoaded] = useState(false)

  return (
    <section ref={ref} className="bg-dm-black pt-6 pb-0">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full bg-black"
        style={{ paddingBottom: '56.25%' /* 16:9 */ }}
      >
        {/* Placeholder overlay — shown until iframe loads */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-dm-dark border border-dm-border">
            <div className="text-center">
              <p className="font-display text-3xl tracking-widest text-dm-muted uppercase mb-2">
                Sizzle Reel
              </p>
              <p className="font-body text-[10px] tracking-[0.35em] text-dm-border uppercase">
                [ Add YouTube ID to SizzleReel.tsx → YOUTUBE_ID ]
              </p>
            </div>
          </div>
        )}

        {YOUTUBE_ID !== 'YOUR_VIDEO_ID' && (
          <iframe
            className="absolute inset-0 w-full h-full border-0"
            src={`https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1&color=white`}
            title="Draupnir Media Sizzle Reel"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setLoaded(true)}
          />
        )}
      </motion.div>
    </section>
  )
}
