import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dm-black':   '#0a0a0a',
        'dm-dark':    '#111111',
        'dm-surface': '#1c1c1c',
        'dm-border':  '#252525',
        'dm-muted':   '#575250',
        'dm-secondary': '#9b9691',
        'dm-primary': '#ede8df',
        'dm-white':   '#f5f1e8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        'marquee':      'marquee 35s linear infinite',
        'bounce-slow':  'bounce-slow 2.5s ease-in-out infinite',
        'fade-up':      'fade-up 0.8s ease-out forwards',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)',   opacity: '0.8' },
          '50%':      { transform: 'translateY(8px)', opacity: '0.3' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
