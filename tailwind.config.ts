import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Paithani-sari inspired palette: shenduri (vermilion) maroon + temple gold
        maroon: {
          50: "#FBF1EE",
          100: "#F0D9D4",
          300: "#C77E77",
          500: "#8A2331",
          700: "#6B1420",
          800: "#4E0E17",
          900: "#33090E",
          950: "#210509",
        },
        gold: {
          50: "#FBF6E9",
          100: "#F3E4B8",
          300: "#DDBD6C",
          500: "#C89B3C",
          600: "#AD8330",
          700: "#8C6A26",
        },
        saffron: {
          400: "#F0A94E",
          500: "#E8871E",
          600: "#C86F14",
        },
        peacock: {
          400: "#1A7A72",
          500: "#0F5C56",
          700: "#0A403C",
        },
        cream: {
          50: "#FFFDF9",
          100: "#F7EFE1",
          200: "#F0E4CE",
        },
        ink: "#2A1810",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        number: ["var(--font-number)", "sans-serif"],
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(circle at center, rgba(200,155,60,0.25) 0%, rgba(107,20,32,0) 70%)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        garland: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        flicker: "flicker 2.4s ease-in-out infinite",
        garland: "garland 30s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
