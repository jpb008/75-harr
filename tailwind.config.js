/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Background (ink-*) and accent colors are both user-customizable at
      // runtime via CSS custom properties (see src/index.css / src/lib) and
      // referenced through arbitrary values like bg-[var(--ink-900)], so
      // there's no static color palette to declare here.
      fontFamily: {
        display: ['"Bebas Neue"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
