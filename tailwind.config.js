/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        blue: {
          700: '#0050D8',
          800: '#003fb5',
        },
        red: {
          600: '#D9253A',
        },
        gray: {
          50: '#F0F0F0',
        }
      }
    },
  },
  plugins: [],
};