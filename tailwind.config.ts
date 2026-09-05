import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        sans: ['var(--font-space)', 'sans-serif'],
      },
      colors: {
        bakery: {
          50: '#fdf8f4',
          100: '#f9eee4',
          200: '#f2dcbf',
          300: '#e7c293',
          400: '#dba164',
          500: '#d1823f',
          600: '#b86631',
          700: '#944c29',
          800: '#793e27',
          900: '#643323',
          950: '#381810',
        },
      },
    },
  },
  plugins: [],
};
export default config;
