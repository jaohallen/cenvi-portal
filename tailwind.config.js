/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-cenvi-green',
    'text-cenvi-green',
    'border-cenvi-green'
  ],
  theme: {
    extend: {
    },
  },
  plugins: [],
};
