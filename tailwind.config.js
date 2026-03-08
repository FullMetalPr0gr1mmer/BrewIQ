/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brew: {
          50:  '#FFF8F0',
          100: '#F5E6D3',
          200: '#E8C9A0',
          300: '#D4A574',
          400: '#B8844C',
          500: '#8B5E3C',
          600: '#6F4E31',
          700: '#523A25',
          800: '#3A2819',
          900: '#1E1410',
        },
        accent: {
          green:  '#4CAF50',
          amber:  '#FF9800',
          red:    '#EF5350',
          blue:   '#42A5F5',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
