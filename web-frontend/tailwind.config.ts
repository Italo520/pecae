// Tailwind CSS v4 is CSS-first. 
// We just need this file to let Next.js and tools know we're using Tailwind.
// Configuration is handled in src/app/globals.css via @theme.

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
