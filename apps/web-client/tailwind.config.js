/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        triage: {
          immediate: "#dc2626",
          delayed: "#eab308",
          minimal: "#16a34a",
          expectant: "#1f2937",
        },
      },
    },
  },
  plugins: [],
};
