'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SERVICES = [
  {
    num: '01',
    title: 'Photography',
    desc: 'Editorial, event, and action coverage.',
    tags: ['Editorial', 'Events', 'Action', 'Campaign'],
  },
  {
    num: '02',
    title: 'Videography',
    desc: 'Brand films, event recaps, social content.',
    tags: ['Brand Film', 'Sport Recap', 'Documentary', 'Social'],
  },
  {
    num: '03',
    title: 'Editing',
    desc: 'Colour grading, retouching, sound, cuts.',
    tags: ['Colour Grade', 'Retouch', 'Cut', 'Sound'],
  },
  {
    num: '04',
    title: 'Branding',
    desc: 'Identity systems — logos, colour, type, assets.',
    tags: ['Identity', 'Logo', 'Style Guide', 'Assets'],
  },
  {
    num: '05',
    title: 'Web Design',
    desc: 'High-performance sites built for conversion.',
    tags: ['Portfolio', 'Brand Site', 'E-commerce', 'Landing'],
  },
]

function ServiceRow({
  num, title, desc, tags, index,
}: {
  num: string; title: string; desc: string; tags: string[]; index: number
}) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: 'easeOut' }}
      className="group grid grid-cols-[3rem_1fr] md:grid-cols-[4rem_1fr_auto] gap-4 md:gap-8 items-start py-8 md:py-10 border-b border-dm-border hover:bg-dm-surface/30 transition-colors duration-300 px-2 md:px-4 cursor-default"
    >
      {/* Number */}
      <span className="font-display text-dm-border text-xl tracking-widest pt-1 group-hover:text-dm-muted transition-colors duration-300">
        {num}
      </span>

      {/* Title + desc */}
      <div className="flex flex-col gap-3">
        <h3
          className="font-display tracking-wider text-dm-white uppercase group-hover:text-dm-primary transition-colors duration-200"
          style={{ fontSize: 'clamp(28px, 4vw, 52px)', lineHeight: 1 }}
        >
          {title}
        </h3>
        <p className="font-body font-light text-dm-muted text-sm md:text-base leading-relaxed max-w-xl">
          {desc}
        </p>
      </div>

      {/* Tags — hidden on small screens, shown md+ */}
      <div className="hidden md:flex flex-col gap-2 items-end pt-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="font-body text-[9px] tracking-[0.25em] text-dm-border uppercase group-hover:text-dm-muted transition-colors duration-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.li>
  )
}

export default function Services() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="services" className="bg-dm-dark border-b border-dm-border py-24 md:py-36">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="flex items-end justify-between mb-12 md:mb-16 gap-6">
          <div>
            <span className="block font-body text-[10px] tracking-[0.4em] text-dm-muted uppercase mb-4">
              02 — What We Do
            </span>
            <motion.h2
              ref={ref}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display tracking-wider text-dm-white uppercase leading-none"
              style={{ fontSize: 'clamp(44px, 7.5vw, 100px)' }}
            >
              SERVICES
            </motion.h2>
          </div>
          <p className="hidden md:block font-body font-light text-dm-muted text-sm max-w-xs text-right leading-relaxed">
            A full toolkit for outdoor and sports media — from lens to launch.
          </p>
        </div>

        {/* Service list */}
        <ul>
          {SERVICES.map((s, i) => (
            <ServiceRow key={s.num} {...s} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
