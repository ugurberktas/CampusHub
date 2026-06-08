/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bordo: '#800000',
        'bordo-dark': '#6b0000',
      }
    },
  },
  plugins: [],
}
