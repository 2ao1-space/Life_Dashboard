import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          "surface-2": "var(--surface-2)",
          primary: "var(--primary)",
          "primary-soft": "var(--primary-soft)",
          "primary-soft-text": "var(--primary-soft-text)",
          text: "var(--text)",
          "text-2": "var(--text-2)",
          border: "var(--border)",
          danger: "var(--danger)",
          "danger-soft": "var(--danger-soft)",
          gold: "var(--gold)",
          "gold-soft": "var(--gold-soft)",
        },
      },
      borderRadius: {
        "card-lg": "20px",
        "card-md": "14px",
        "card-sm": "10px",
      },
      boxShadow: {
        card: "var(--shadow)",
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
