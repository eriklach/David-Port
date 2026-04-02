'use client'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

type Category = 'ALL' | 'PHOTO' | 'VIDEO' | 'BRANDING'

interface Project {
  id: string
  title: string
  subtitle: string
  category: string
  type: Category[]
  bgStyle: React.CSSProperties
  size: 'wide' | 'tall' | 'standard'
}

const PROJECTS: Project[] = [
  {
    id: '01',
    title: 'Peak Season',
    subtitle: 'Snowboard Editorial — BC Backcountry',
    category: 'Photo · Video',
    type: ['PHOTO', 'VIDEO'],
    bgStyle: { background: 'linear-gradient(145deg, #0a0e1c 0%, #0d1326 60%, #07090f 100%)' },
    size: 'wide',
  },
  {
    id: '02',
    title: 'Vertical',
    subtitle: 'Sport Climbing Series — Squamish',
    category: 'Photography',
    type: ['PHOTO'],
    bgStyle: { background: 'linear-gradient(155deg, #0c1209 0%, #14190b 55%, #090c06 100%)' },
    size: 'tall',
  },
  {
    id: '03',
    title: 'Iron Circuit',
    subtitle: 'Combat Sports Event — Grappling & Judo',
    category: 'Photo · Video',
    type: ['PHOTO', 'VIDEO'],
    bgStyle: { background: 'linear-gradient(135deg, #120a09 0%, #1b100d 55%, #0c0807 100%)' },
    size: 'standard',
  },
  {
    id: '04',
    title: 'Urban Flow',
    subtitle: 'Parkour Documentary — Vancouver',
    category: 'Documentary Film',
    type: ['VIDEO'],
    bgStyle: { background: 'linear-gradient(145deg, #0f0f0e 0%, #181815 55%, #0b0b0a 100%)' },
    size: 'standard',
  },
  {
    id: '05',
    title: 'Above the Line',
    subtitle: 'Hiking Brand Campaign — Coastal Trail',
    category: 'Photo · Branding',
    type: ['PHOTO', 'BRANDING'],
    bgStyle: { background: 'linear-gradient(155deg, #090d0d 0%, #0e1515 55%, #070b0b 100%)' },
    size: 'wide',
  },
  {
    id: '06',
    title: 'Threshold',
    subtitle: 'Trail Running Event — 50k Race Coverage',
    category: 'Photo · Video',
    type: ['PHOTO', 'VIDEO'],
    bgStyle: { background: 'linear-gradient(135deg, #0c100a 0%, #121a0f 55%, #090d07 100%)' },
    size: 'tall',
  },
]

const FILTERS: Category[] = ['ALL', 'PHOTO', 'VIDEO', 'BRANDING']

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden cursor-pointer ${
        project.size === 'wide' ? 'md:col-span-2' : ''
      } ${project.size === 'tall' ? 'row-span-2' : ''}`}
    >
      {/* Background */}
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
        style={project.bgStyle}
      />

      {/*
        DROP PROJECT IMAGE HERE:
        <Image
          src={`/media/projects/${project.id}.jpg`}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      */}

      {/* Placeholder label */}
      <div className="absolute top-4 left-4 font-body text-[8px] tracking-[0.3em] text-dm-border uppercase z-10">
        [ project-{project.id}.jpg ]
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-dm-black/90 via-dm-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="absolute inset-0 bg-dm-black/20 group-hover:bg-dm-black/0 transition-colors duration-400" />

      {/* Content — slides up on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 p-6 md:p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out"
      >
        <span className="block font-body text-[9px] tracking-[0.35em] text-dm-secondary uppercase mb-2">
          {project.category}
        </span>
        <h3 className="font-display text-3xl md:text-4xl tracking-wider text-dm-white uppercase leading-none mb-1">
          {project.title}
        </h3>
        <p className="font-body font-light text-dm-secondary text-xs tracking-wide">
          {project.subtitle}
        </p>
        <div className="mt-4 flex items-center gap-2 font-body text-[9px] tracking-[0.3em] text-dm-muted uppercase">
          <span>View Case Study</span>
          <span className="block w-6 h-px bg-dm-muted" />
        </div>
      </div>

      {/* ID watermark */}
      <div className="absolute top-4 right-4 font-display text-[10rem] leading-none text-dm-white/[0.03] select-none pointer-events-none">
        {project.id}
      </div>

      {/* Aspect ratio spacer */}
      <div className={`${project.size === 'tall' ? 'aspect-[3/4]' : 'aspect-[4/3]'} md:aspect-auto md:h-72 lg:h-80`} />
    </motion.div>
  )
}

export default function Portfolio() {
  const [filter, setFilter] = useState<Category>('ALL')
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const filtered = filter === 'ALL'
    ? PROJECTS
    : PROJECTS.filter((p) => p.type.includes(filter))

  return (
    <section id="work" className="bg-dm-black border-b border-dm-border py-24 md:py-36">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10 md:mb-14">
          <div>
            <span className="block font-body text-[10px] tracking-[0.4em] text-dm-muted uppercase mb-4">
              03 — Selected Work
            </span>
            <motion.h2
              ref={ref}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display tracking-wider text-dm-white uppercase leading-none"
              style={{ fontSize: 'clamp(44px, 7.5vw, 100px)' }}
            >
              THE WORK
            </motion.h2>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-body text-[9px] tracking-[0.28em] px-4 py-2.5 border transition-all duration-200 ${
                  filter === f
                    ? 'border-dm-white/60 text-dm-white bg-dm-white/8'
                    : 'border-dm-border text-dm-muted hover:border-dm-secondary hover:text-dm-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* View all CTA */}
        <div className="mt-14 flex justify-center">
          <a
            href="#contact"
            className="flex items-center gap-4 font-body text-xs tracking-[0.3em] text-dm-secondary hover:text-dm-white transition-colors duration-300 uppercase group"
          >
            <span>Start Your Project</span>
            <span className="block w-10 h-px bg-current transition-all duration-300 group-hover:w-14" />
          </a>
        </div>
      </div>
    </section>
  )
}
