import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system tokens
        primary: {
          DEFAULT: '#1D4ED8',
          hover:   '#1E40AF',
          light:   '#EFF6FF',
        },
        accent: '#6366F1',
        success: '#16A34A',
        warning: '#F59E0B',
        error:   '#DC2626',
        heading: '#0F172A',
        body:    '#475569',
        muted:   '#94A3B8',
        border:  '#E2E8F0',
        // legacy brand alias
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#1D4ED8',
          600: '#1D4ED8',
          700: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      maxWidth: {
        frame:     '1440px',
        container: '1200px',
      },
      spacing: {
        'frame-margin': '120px',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #1D4ED8 0%, #6366F1 100%)',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee:  'marquee 35s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out',
      },
      boxShadow: {
        card:    '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)',
        'card-hover': '0 8px 24px -4px rgba(29,78,216,.12)',
      },
    },
  },
  plugins: [],
}

export default config
