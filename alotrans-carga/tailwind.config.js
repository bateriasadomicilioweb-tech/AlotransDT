/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#16294a',
          blue: '#2b7fc7',
          orange: '#ff6a00',
        }
      }
    },
  },
  plugins: [],
}
