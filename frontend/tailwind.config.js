/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#004ac6",
        "primary-container": "#2563eb",
        surface: "#faf8ff",
        "surface-container": "#ededf9",
        "surface-container-low": "#f3f3fe",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#191b23",
        "outline-variant": "#c3c6d7",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
