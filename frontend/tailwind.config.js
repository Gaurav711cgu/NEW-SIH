/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#020b14',
          900: '#041527',
          800: '#0a2540',
          700: '#144272',
          600: '#1a5276',
        },
        ice: {
          100: '#e0f7fa',
          200: '#b2ebf2',
          400: '#4dd0e1',
          500: '#00e5ff',
          600: '#00b8d4',
        },
        steel: {
          400: '#94a3b8',
          600: '#475569',
          800: '#1e293b',
          900: '#0f172a',
        },
        health: {
          nominal: '#22c55e',
          degraded: '#f59e0b',
          critical: '#ef4444',
          offline: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
