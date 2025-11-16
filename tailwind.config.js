/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',   // blue-600
        secondary: '#9333ea', // purple-600
        accent: '#f59e0b',    // amber-500
        background: '#f9fafb',
        dark: '#111827',
      },
    },
  },
  plugins: [],
}
