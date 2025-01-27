import type { Config } from "tailwindcss";

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './_components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        accent: 'var(--accent)',
        shadow: 'var(--shadow)',
        highlight: 'var(--highlight)',
        white: '#f4f4f4',
        hover: 'var(--hover)',
        medium: 'var(--medium)',
      },
      borderWidth: {
        DEFAULT: '3px',
      },
      screens: {
        xs: '400px',
        custom: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config
