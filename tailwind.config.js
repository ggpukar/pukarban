/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nepalRed: '#DC143C',
        nepalBlue: '#003893',
        gold: '#FFD700',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite',
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}