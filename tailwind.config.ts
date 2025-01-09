import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'grow-height': {
          '0%': { maxHeight: '0' },
          '100%': { maxHeight: '200px' }  // Adjust this value based on your needs
        }
      },
      animation: {
        'grow-height': 'grow-height 0.25s ease-out forwards'
      },
      colors: {
        bg_main: "var(--bg_main)",
        bg_blue1: "var(--bg_blue1)",
        bg_blue2: "var(--bg_blue2)",
        bg_teal1: "var(--bg_teal1)",
        bg_teal2: "var(--bg_teal2)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
