/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a1887f', // standard pinecone brown
          600: '#8d6e63',
          700: '#6d4c41', // deep scales
          800: '#4e342e', // darker scales
          900: '#3e2723', // darkest
        },
        forest: {
          50: '#f1f8e9',
          100: '#dcedc8',
          200: '#c5e1a5',
          300: '#aed581',
          400: '#9ccc65',
          500: '#8bc34a',
          600: '#7cb342',
          700: '#689f38',
          800: '#558b2f',
          900: '#33691e', // deep forest green
        },
        cream: {
          50: '#fafaf9', // stone-50-ish but warmer
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
        },
        soil: {
          50: '#fbf7f4',
          100: '#f2e6dd',
          200: '#e4cab6',
          300: '#d1ab93',
          400: '#bf8f74',
          500: '#a1887f',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
