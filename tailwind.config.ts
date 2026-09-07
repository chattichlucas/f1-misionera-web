import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Se alimentan de variables CSS definidas en <html> desde site_settings.
        bg: "var(--bg)",
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        line: "var(--line)",
        text: "var(--text)",
        muted: "var(--muted)",
        primary: "var(--primary)",
        "primary-fg": "var(--primary-fg)",
        accent: "var(--accent)",
        positive: "var(--positive)",
        negative: "var(--negative)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        panel: "16px",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(0,0,0,.35)",
      },
      maxWidth: {
        shell: "1360px",
      },
    },
  },
  plugins: [],
};

export default config;
