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
    },
  },
  plugins: [],
}
