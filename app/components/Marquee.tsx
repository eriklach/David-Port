const ITEMS = [
  'PHOTOGRAPHY',
  'VIDEOGRAPHY',
  'WEB DESIGN',
  'BRANDING',
  'EDITING',
  'COPYWRITING',
  'SPORT',
  'ADVENTURE',
]

export default function Marquee() {
  // Duplicate items for seamless infinite loop (translateX -50%)
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="relative overflow-hidden bg-dm-dark border-y border-dm-border py-4 select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-display text-sm tracking-[0.22em] text-dm-muted px-6">
              {item}
            </span>
            <span className="text-dm-border text-xs" aria-hidden="true">
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
