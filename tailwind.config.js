/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0a0f1e', 2: '#0f1628', 3: '#151d35' },
        gold: { DEFAULT: '#c9a84c', 2: '#e8c96a' },
        accent: {
          green: '#4caf82',
          red: '#e05a5a',
          blue: '#5a9ae0',
        },
        txt: '#d4cfc7',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
