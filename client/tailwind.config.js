/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0b0d14',
          surface: '#131722',
          card: '#1a1f2e',
          border: '#2a3142',
          pink: '#FF80AB',
          pinkLight: '#FF4081',
          pinkDark: '#F50057',
          pinkSoft: '#FCE4EC',
          wine: '#EC407A',
          wineHover: '#D81B60',
          purple: '#E91E63',
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
