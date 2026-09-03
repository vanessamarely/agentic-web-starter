/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "gdev-blue": "#1a73e8",
        "gdev-green": "#188038",
        "gdev-yellow": "#f9ab00",
        "gdev-red": "#d93025",
      },
      fontFamily: {
        sans: ["Roboto", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "SF Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
