/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tactical: {
          950: '#06090e',
          900: '#0b101b',
          850: '#101726',
          800: '#172033',
          700: '#222f49',
          600: '#334466',
          500: '#4b628f',
        },
        hazard: {
          critical: '#ef4444',
          high: '#f97316',
          elevated: '#eab308',
          moderate: '#3b82f6',
          nominal: '#10b981',
        },
        radar: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        sans: ['"Inter Tight"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
