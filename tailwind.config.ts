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
        cream: "#E0D4B4",
        brown: {
          DEFAULT: "#4C4637",
          light:   "#6b5f4e",
          muted:   "#8a7d6b",
        },
        taupe: "#B2AB99",
        mint:  "#AFDED4",
        sage: {
          DEFAULT: "#81afa5",
          dark:    "#5f8b83",
          light:   "#c8e8e3",
        },
      },
    },
  },
  plugins: [],
};
export default config;
