/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '0px',
        'sm': '600px',
        'md': '960px',
        'lg': '1280px',
        'xl': '1920px'
      },
      colors: {
        wedding: {
          background: '#CEB092',
          text: '#2F241C',
          'text-secondary': '#5A4A3D',
          card: '#F7F1EA',
          border: '#B99A7B',
          accent: '#6B4F3A',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        cursive: ['Edu NSW ACT Cursive', 'cursive'],
      },
    },
  },
  plugins: [],
}

