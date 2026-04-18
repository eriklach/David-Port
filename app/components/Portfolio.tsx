'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

interface Project {
  id: string
  title: string
  subtitle: string
  category: string
  bgStyle: React.CSSProperties
  speed: number
  zIndex: number
  aspect: string
  imageSrc?: string   // set once image is in /public/media/projects/
}

// LEFT column — 4 items
const LEFT: Project[] = [
  {
    id: '01',
    title: 'Kendo Nationals',
    subtitle: 'Tournament Coverage — Event Photography',
    category: 'Photo · Video',
    bgStyle: { background: 'linear-gradient(145deg, #0d0d10 0%, #131318 60%, #090909 100%)' },
    speed: 0.10,
    zIndex: 10,
    aspect: 'aspect-[4/3]',
    imageSrc: '/media/projects/01.jpeg',
  },
  {
    id: '03',
    title: 'Steel Mace',
    subtitle: 'Athlete Content — Fitness Brand',
    category: 'Photo · Branding',
    bgStyle: { background: 'linear-gradient(135deg, #0f0f0f 0%, #181818 55%, #0a0a0a 100%)' },
    speed: 0.16,
    zIndex: 30,
    aspect: 'aspect-[3/4]',
    imageSrc: '/media/projects/03.jpeg',
  },
  {
    id: '05',
    title: 'SportChek × HOKA',
    subtitle: 'Brand Activation — In-Store Event',
    category: 'Photo · Event',
    bgStyle: { background: 'linear-gradient(155deg, #0d0c0a 0%, #161410 55%, #0a0908 100%)' },
    speed: 0.08,
    zIndex: 30,
    aspect: 'aspect-[4/3]',
    imageSrc: '/media/projects/05.jpeg',
  },
  {
    id: '07',
    title: 'Fly Human Fly',
    subtitle: 'HOKA Energy Session — Brand Activation',
    category: 'Photo · Event',
    bgStyle: { background: 'linear-gradient(145deg, #0d0c0a 0%, #161410 55%, #0a0908 100%)' },
    speed: 0.14,
    zIndex: 50,
    aspect: 'aspect-[4/3]',
    imageSrc: '/media/projects/07.jpeg',
  },
]

// RIGHT column — 4 items
const RIGHT: Project[] = [
  {
    id: '02',
    title: 'Iron Circuit',
    subtitle: 'Fitness Event — Arena Coverage',
    category: 'Photography',
    bgStyle: { background: 'linear-gradient(155deg, #0c0c0e 0%, #141416 55%, #090909 100%)' },
    speed: 0.20,
    zIndex: 20,
    aspect: 'aspect-[2/3]',
    imageSrc: '/media/projects/02.jpeg',
  },
  {
    id: '04',
    title: 'Fly Human Fly',
    subtitle: 'SportChek × HOKA — Brand Activation',
    category: 'Photo · Event',
    bgStyle: { background: 'linear-gradient(145deg, #0d0c0a 0%, #161410 55%, #0a0908 100%)' },
    speed: 0.13,
    zIndex: 20,
    aspect: 'aspect-[4/3]',
    imageSrc: '/media/projects/04.jpeg',
  },
  {
    id: '06',
    title: 'Kendo Open',
    subtitle: 'Tournament Coverage — Action Photography',
    category: 'Photo · Video',
    bgStyle: { background: 'linear-gradient(135deg, #0d0d10 0%, #131318 55%, #090909 100%)' },
    speed: 0.18,
    zIndex: 40,
    aspect: 'aspect-[3/4]',
    imageSrc: '/media/projects/06.jpeg',
  },
  {
    id: '08',
    title: 'All Heart',
    subtitle: 'Strength Competition — Event Coverage',
    category: 'Photography',
    bgStyle: { background: 'linear-gradient(155deg, #0c0c0e 0%, #141416 55%, #090909 100%)' },
    speed: 0.11,
    zIndex: 50,
    aspect: 'aspect-[3/4]',
    imageSrc: '/media/projects/08.jpeg',
  },
]

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
      className={`relative overflow-hidden group cursor-pointer ${project.aspect}`}
      style={{ zIndex: project.zIndex }}
    >
      {/*
        ── DROP YOUR REAL IMAGE/VIDEO HERE ──────────────────────────────────
        <Image
          src={`/media/projects/${project.id}.jpg`}
          alt={project.title}
          fill
          className="object-cover"
          sizes="60vw"
        />
        Or for video:
        <video autoPlay muted loop playsInline
          src={`/media/projects/${project.id}.mp4`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      */}

      {/* Inner parallaxing layer — scaled so edges never show */}
      <motion.div
        style={{ y: innerY }}
        className="absolute inset-0 scale-[1.4] will-change-transform"
      >
        {project.imageSrc ? (
          <Image
            src={project.imageSrc}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        ) : (
          <>
            <div className="absolute inset-0" style={project.bgStyle} />
            <div className="absolute bottom-3 left-3 font-body text-[8px] tracking-[0.3em] text-white/15 uppercase">
              [ {project.id}.jpg — drop in /public/media/projects/ ]
            </div>
          </>
        )}
      </motion.div>

      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Info — slides up on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
        <span className="block font-body text-[8px] tracking-[0.38em] text-white/55 uppercase mb-1.5">
          {project.category}
        </span>
        <h3
          className="font-display tracking-wider text-white uppercase leading-none mb-1"
          style={{ fontSize: 'clamp(18px, 2.5vw, 36px)' }}
        >
          {project.title}
        </h3>
        <p className="font-body font-light text-white/45 text-xs tracking-wide">
          {project.subtitle}
        </p>
      </div>
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

      {/* ── COLLAGE — two overlapping columns ── */}
      {/*
        Left column:  58% wide, starts flush left
        Right column: 58% wide, overlaps left by ~16%, starts ~18vh lower
        Z-index weaves so columns alternate in front/behind each other
        Each image parallaxes independently at a unique rate
      */}
      <div className="relative flex items-start w-full overflow-visible pb-20">

        {/* Left column */}
        <div
          className="flex flex-col gap-3 shrink-0"
          style={{ width: '58%' }}
        >
          {LEFT.map((project) => (
            <CollageCard key={project.id} project={project} />
          ))}
        </div>

        {/* Right column — overlaps left, offset down */}
        <div
          className="flex flex-col gap-3 shrink-0"
          style={{
            width: '58%',
            marginLeft: '-16%',
            paddingTop: '18vh',
          }}
        >
          {RIGHT.map((project) => (
            <CollageCard key={project.id} project={project} />
          ))}
        </div>
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
