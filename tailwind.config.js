/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'orange': {
          50: 'rgba(255, 121, 0, 0.1)',
          100: 'rgba(255, 121, 0, 0.2)',
          500: '#FF7900',
          600: '#FF7900',
          700: '#E66A00',
        },
        'gray': {
          50: '#F2F2F2',
          100: '#F2F2F2',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#B3B3B3',
          500: '#B3B3B3',
          600: '#4D4D4D',
          700: '#4D4D4D',
          800: '#333333',
          900: '#000000',
        },
        'black': '#000000',
        'white': '#FFFFFF',
      },
      fontFamily: {
        'sans': ['Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
