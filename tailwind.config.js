/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
  extend: {
    colors: {
      primary: '#ccff00', // Neon Green/Yellow
      bg: '#0a0a0c',
      card: '#141417',
    },
  },
},
  plugins: [],
};
