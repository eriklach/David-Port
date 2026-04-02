'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface TeamMember {
  name: string
  role: string
  specialty: string
  bio: string
  disciplines: string[]
}

const TEAM: TeamMember[] = [
  {
    name: 'David',
    role: 'Founder · Creative Director',
    specialty: 'Photography · Strategy',
    bio: 'Building visual stories that move people. A decade in the field — on snowfields, climbing routes, and competition floors. Every frame is intentional.',
    disciplines: ['Snowboarding', 'Climbing', 'Martial Arts', 'Trail Running'],
  },
  {
    name: 'Field Crew',
    role: 'Lead Videographer',
    specialty: 'Cinematography · Grade',
    bio: 'From handheld grit to smooth cinematic lines, covering every environment from summit to ring.',
    disciplines: ['Film', 'Drone', 'Grade', 'Sound'],
  },
  {
    name: 'Studio',
    role: 'Design & Web',
    specialty: 'Branding · Development',
    bio: 'Identity, digital, and everything in between. Where the visual language of an athlete or brand gets built out into a full system.',
    disciplines: ['Identity', 'Web', 'Print', 'Motion'],
  },
]

// Placeholder gradient per card position
const CARD_GRADIENTS = [
  'linear-gradient(155deg, #141210 0%, #1a1815 60%, #0d0c0b 100%)',
  'linear-gradient(155deg, #0e1210 0%, #14180d 60%, #0a0c09 100%)',
  'linear-gradient(155deg, #0f1014 0%, #14151a 60%, #0b0c10 100%)',
]

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden border border-dm-border hover:border-dm-secondary/40 transition-colors duration-500 cursor-default"
    >
      {/* Photo area */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {/*
          DROP TEAM PHOTO HERE:
          <Image
            src={`/media/team/${member.name.toLowerCase()}.jpg`}
            alt={member.name}
            fill
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ background: CARD_GRADIENTS[index % CARD_GRADIENTS.length] }}
        />

        {/* Placeholder label */}
        <div className="absolute top-4 left-4 font-body text-[8px] tracking-[0.3em] text-dm-border uppercase z-10">
          [ {member.name.toLowerCase()}.jpg ]
        </div>

        {/* Hover info overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dm-black via-dm-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out z-10">
          <p className="font-body font-light text-dm-secondary text-sm leading-relaxed mb-4">
            {member.bio}
          </p>
          <div className="flex flex-wrap gap-2">
            {member.disciplines.map((d) => (
              <span
                key={d}
                className="font-body text-[8px] tracking-[0.25em] text-dm-muted border border-dm-border px-2.5 py-1 uppercase"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Name plate */}
      <div className="p-5 md:p-6 bg-dm-surface border-t border-dm-border">
        <h3 className="font-display text-2xl md:text-3xl tracking-wider text-dm-white uppercase leading-none mb-1">
          {member.name}
        </h3>
        <p className="font-body text-[10px] tracking-[0.28em] text-dm-muted uppercase mb-0.5">
          {member.role}
        </p>
        <p className="font-body text-[10px] tracking-[0.22em] text-dm-border uppercase">
          {member.specialty}
        </p>
      </div>
    </motion.div>
  )
}

export default function Team() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="team" className="bg-dm-black border-b border-dm-border py-24 md:py-36">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12 md:mb-16">
          <div>
            <span className="block font-body text-[10px] tracking-[0.4em] text-dm-muted uppercase mb-4">
              04 — The People
            </span>
            <motion.h2
              ref={ref}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display tracking-wider text-dm-white uppercase leading-none"
              style={{ fontSize: 'clamp(44px, 7.5vw, 100px)' }}
            >
              THE CREW
            </motion.h2>
          </div>
          <p className="hidden md:block font-body font-light text-dm-muted text-sm max-w-xs text-right leading-relaxed">
            We live the sports we shoot. That&apos;s not a tagline — it&apos;s our hiring criteria.
          </p>
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {TEAM.map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} />
          ))}
        </div>

        {/* Join note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-10 font-body text-xs tracking-[0.25em] text-dm-border text-center uppercase"
        >
          Interested in joining the crew?&nbsp;
          <a href="#contact" className="text-dm-muted hover:text-dm-secondary transition-colors duration-200 underline underline-offset-4 decoration-dm-border">
            Get in touch.
          </a>
        </motion.p>
      </div>
    </section>
  )
}
