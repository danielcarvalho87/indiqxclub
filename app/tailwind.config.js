/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-primary)",
          secondary: "var(--color-secondary)",
          dark: "var(--color-dark)",
          surface: "var(--color-surface)",
          surfaceAlt: "var(--color-surface-alt)",
          text: "var(--color-text)",
          muted: "var(--color-muted)",
          hover: "var(--color-hover)",
          border: "var(--color-border)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
