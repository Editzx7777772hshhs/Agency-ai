/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vbg: '#0a0b0f',
        vsurface: 'rgba(255,255,255,0.04)',
        vborder: 'rgba(255,255,255,0.08)',
        vaccent: {
          DEFAULT: '#7c5cff',
          soft: '#a78bfa',
          glow: '#5eead4',
        },
        vtext: {
          DEFAULT: '#e7e8ec',
          muted: '#9195a3',
          faint: '#63666f',
        },
        vdanger: '#f4685c',
        vsuccess: '#4ade80',
        vwarn: '#fbbf24',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(124, 92, 255, 0.35)',
        card: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'vgrad': 'radial-gradient(circle at 20% 0%, rgba(124,92,255,0.15), transparent 40%), radial-gradient(circle at 80% 0%, rgba(94,234,212,0.08), transparent 40%)',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
