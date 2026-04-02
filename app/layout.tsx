import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Draupnir Media — Outdoor & Sports Media Agency',
  description:
    'Photography, videography, web design, branding, and copywriting for outdoor sports and adventure. Built for athletes, brands, and events.',
  openGraph: {
    title: 'Draupnir Media',
    description: 'Outdoor & Sports Media Agency',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — loaded at runtime */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Film grain texture overlay */}
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
