/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#f4f5f9',
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e2e8f0',
          pink: '#ec4899',
          pinkLight: '#fce7f3',
          pinkDark: '#be185d',
          pinkSoft: '#fdf2f8',
          wine: '#db2777',
          wineHover: '#be185d',
          purple: '#9333ea',
          purpleLight: '#f3e8ff',
          gold: '#f59e0b',
          goldLight: '#fef3c7',
          goldDark: '#b45309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
