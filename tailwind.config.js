/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hijautua: "#204B38",
        hijaulakeabu: "#A3B5A1",
        kuninglidah: "#F9D923",
        textterang: "#F9FAF9",
        textgelap: "#1A1A1A",
        gelapagelap: "#0D1B16",
        tomboltext: "#204B38", // reserved
      },
    },
  },
  plugins: [],
  darkMode: "class", // untuk toggle manual dark/light nanti
}
