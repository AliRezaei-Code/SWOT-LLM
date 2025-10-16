import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1fbff",
          100: "#d9f1ff",
          200: "#b3e3ff",
          300: "#82cfff",
          400: "#4fb2ff",
          500: "#1c8aff",
          600: "#0a67db",
          700: "#064eaa",
          800: "#073e85",
          900: "#0a346c"
        }
      }
    }
  },
  plugins: []
};

export default config;
