/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line is critical to see the new folders
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}