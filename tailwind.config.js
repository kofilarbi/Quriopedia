/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        sand: '#F0EBE1',
        warmGray: '#8B8178',
        amber: { DEFAULT: '#E8A838', dark: '#D4922A' },
        terracotta: { DEFAULT: '#C4614A', dark: '#B0503B' },
        navy: { DEFAULT: '#0F1621', surface: '#1A2332' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
