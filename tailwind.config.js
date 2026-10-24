/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1120', // Main background
          900: '#111827', // Secondary background
          850: '#151F32',
          800: '#182235', // Panel background
          750: '#1C2940',
          700: '#202C40', // Elevated cards
          600: '#2A3B57', // Subtle border
          500: '#3D5276',
        },
        ruby: {
          400: '#F87171', // Secondary accent
          500: '#F04452', // Primary accent
          600: '#DC2626',
          700: '#B91C1C',
        },
        syntax: {
          keyword: '#F87171',
          string: '#34D399',
          number: '#60A5FA',
          operator: '#FBBF24',
          comment: '#64748B',
          identifier: '#E2E8F0',
          builtin: '#C084FC',
        },
        status: {
          success: '#34D399',
          warning: '#FBBF24',
          error: '#FB7185',
          info: '#60A5FA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(11, 17, 32, 0.6), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        'glow-red': '0 0 15px rgba(240, 68, 82, 0.35)',
        'glow-green': '0 0 15px rgba(52, 211, 153, 0.35)',
      }
    },
  },
  plugins: [],
}
