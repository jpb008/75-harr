/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dark-violet neutral scale — hue-biased toward the accent instead
        // of a stock grey, used for backgrounds, borders, and body text.
        ink: {
          950: '#120a1f',
          900: '#180f28',
          850: '#1c1230',
          800: '#251937',
          700: '#362650',
          600: '#4a3568',
          400: '#6f5c8f',
          300: '#8977a8',
          200: '#b3a0d6',
          100: '#e2d9f5',
          50: '#f4eeff',
        },
        // Primary accent.
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
