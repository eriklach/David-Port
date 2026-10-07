'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

// Ordered so neighbouring images come from different shoots.
// Distributed across columns in reading order: i % 3 → column.
const IMAGES = [
  'hoka/HokaxGoodwood-22.jpg',
  'ugg/UGGSeasonEdits-5.jpg',
  'sportcheck/PUMAxSportChek-8.jpg',
  'steamwhistle/SWxTrinity-7-7.jpg',
  'volvo/VolvoxIDS-08.jpg',
  'hoka/HokaxGoodwood-25.jpg',
  'ugg/UGGSeasonEdits-10.jpg',
  'sportcheck/PUMAxSportChek-9.jpg',
  'steamwhistle/SWxTrinity-7-24.jpg',
  'volvo/VolvoxIDS-18.jpg',
  'hoka/HokaxGoodwood-34.jpg',
  'ugg/UGGSeasonEdits-11.jpg',
  'sportcheck/PUMAxSportChek-10.jpg',
  'steamwhistle/SWxTrinity-7-31.jpg',
  'hoka/HokaxGoodwood-35.jpg',
  'ugg/UGGSeasonEdits-19.jpg',
  'hoka/HokaxGoodwood-41.jpg',
  'ugg/UGGSeasonEdits-30.jpg',
  'hoka/HokaxGoodwood-46.jpg',
  'ugg/UGGSeasonEdits-34.jpg',
  'hoka/HokaxGoodwood-49.jpg',
  'ugg/UGGSeasonEdits-36.jpg',
]

// Card crops per column. All sources are 2:3 portrait; mixing in 4:5 crops
// adds rhythm while keeping column heights equal (in card widths, w):
//   col 1: 4×1.5w + 4×1.25w          = 11w
//   col 2: 7×1.5w          + 0.5w top = 11w
//   col 3: 5×1.5w + 2×1.25w + 1w top  = 11w
const TALL  = 'aspect-[2/3]'
const SHORT = 'aspect-[4/5]'
const COLUMN_ASPECTS = [
  [TALL, SHORT, TALL, SHORT, TALL, SHORT, TALL, SHORT],
  [TALL, TALL, TALL, TALL, TALL, TALL, TALL],
  [TALL, TALL, SHORT, TALL, TALL, SHORT, TALL],
]
// Top offsets as % of section width (padding % resolves against width), = 0 / 0.5w / 1w
const COLUMN_OFFSETS = ['0%', '20%', '40%']
const SPEEDS = [0.10, 0.16, 0.08, 0.14, 0.12, 0.18, 0.07]

interface Project {
  src: string
  speed: number
  zIndex: number
  aspect: string
}

const COLUMNS: Project[][] = [[], [], []]
IMAGES.forEach((file, i) => {
  const col = i % 3
  COLUMNS[col].push({
    src: `/media/projects/${file}`,
    speed: SPEEDS[i % SPEEDS.length],
    zIndex: i + 1, // later (lower) cards sit above earlier ones — weaves the overlaps
    aspect: COLUMN_ASPECTS[col][COLUMNS[col].length],
  })
})

// ─── Parallax card ──────────────────────────────────────────────────────────
function CollageCard({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const innerY = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${project.speed * 100}%`, `${project.speed * 100}%`]
  )

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden cursor-pointer ${project.aspect}`}
      style={{ zIndex: project.zIndex }}
    >
      {/* Inner parallaxing layer — scaled so edges never show */}
      <motion.div
        style={{ y: innerY }}
        className="absolute inset-0 scale-[1.4] will-change-transform"
      >
        <Image
          src={project.src}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 40vw"
        />
      </motion.div>
    </div>
  )
}

// ─── Main section ───────────────────────────────────────────────────────────
export default function Portfolio() {
  const headerRef = useRef(null)
  const inView    = useInView(headerRef, { once: true, margin: '-60px' })

  return (
    <section id="work" className="bg-dm-black">

      {/* Section label */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-20 md:pt-28 pb-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="block font-body text-[10px] tracking-[0.4em] text-dm-muted uppercase mb-4">
              01 — Selected Work
            </span>
            <motion.h2
              ref={headerRef}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display tracking-wider text-dm-white uppercase leading-none"
              style={{ fontSize: 'clamp(44px, 7.5vw, 100px)' }}
            >
              THE WORK
            </motion.h2>
          </div>
          <p className="hidden md:block font-body font-light text-dm-muted text-sm max-w-xs text-right leading-relaxed">
            Experiences, events, and brand activations — captured and crafted.
          </p>
        </div>
      </div>

      {/* ── COLLAGE — three overlapping columns ── */}
      {/*
        Each column is 40% wide and overlaps its neighbour by 10%.
        Columns step down (0 / 20% / 40% of width) and end at the same height.
        Each image parallaxes independently at its own rate.
      */}
      <div className="relative flex items-start w-full overflow-visible pb-20">
        {COLUMNS.map((column, c) => (
          <div
            key={c}
            className="flex flex-col gap-3 shrink-0"
            style={{
              width: '40%',
              marginLeft: c === 0 ? 0 : '-10%',
              paddingTop: COLUMN_OFFSETS[c],
            }}
          >
            {column.map((project) => (
              <CollageCard key={project.src} project={project} />
            ))}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pb-20 flex justify-center">
        <a
          href="#contact"
          className="flex items-center gap-4 font-body text-xs tracking-[0.3em] text-dm-secondary hover:text-dm-white transition-colors duration-300 uppercase group"
        >
          <span>Start Your Project</span>
          <span className="block w-10 h-px bg-current transition-all duration-300 group-hover:w-14" />
        </a>
      </div>
    </section>
  )
}
