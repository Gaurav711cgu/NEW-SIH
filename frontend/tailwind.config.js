/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#09090b', // zinc-950
          900: '#18181b', // zinc-900
          800: '#27272a', // zinc-800
          700: '#3f3f46', // zinc-700
          600: '#52525b', // zinc-600
        },
        abyss: {
          950: '#09090b',
          900: '#18181b',
          800: '#27272a',
          700: '#3f3f46',
        },
        ice: {
          100: '#f4f4f5', // zinc-100
          200: '#e4e4e7', // zinc-200
          400: '#a1a1aa', // zinc-400
          500: '#a1a1aa', // enhanced from #71717a for WCAG AA 4.5:1 contrast
          600: '#52525b', // zinc-600
        },
        steel: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#a1a1aa', // enhanced from #71717a for WCAG AA 4.5:1 contrast
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        health: {
          nominal: '#10b981', // emerald-500
          degraded: '#f59e0b', // amber-500
          critical: '#ef4444', // red-500
          offline: '#71717a', // zinc-500
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
