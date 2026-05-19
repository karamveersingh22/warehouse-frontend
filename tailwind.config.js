/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0a0a0f',
          900: '#111118',
          800: '#1a1a24',
          700: '#252535',
          600: '#32324a',
        },
        amber: {
          400: '#fbbf24',
          300: '#fcd34d',
          200: '#fde68a',
        },
        slate: {
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}
