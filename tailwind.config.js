/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#FFFDF7', 100: '#FFF8E7', 200: '#FFF0CC', 300: '#FFE6A8' },
        sage: { 50: '#F0F5EE', 100: '#D8E6D2', 200: '#B4CDA8', 300: '#8FB47E', 400: '#87A96B', 500: '#6B8E55', 600: '#567240', 700: '#41562F', 800: '#2C3B20', 900: '#172010' },
        terra: { 50: '#FBF0E8', 100: '#F5DBC8', 200: '#EBB896', 300: '#E09564', 400: '#C67C4E', 500: '#A96A3F', 600: '#8C5733', 700: '#6F4427', 800: '#52311B', 900: '#351E0F' },
        protein: { 50: '#EBF2FB', 100: '#C9DEF5', 200: '#96BFEB', 300: '#6AA0E0', 400: '#4A90D9', 500: '#3A7BC8', 600: '#2E66A8', 700: '#234D80', 800: '#183458', 900: '#0D1B30' },
        bark: { 50: '#F5EDE8', 100: '#E6D5CB', 200: '#C9A892', 300: '#AD7B5A', 400: '#8B5E3C', 500: '#6B4528', 600: '#4A2F1B', 700: '#2D1810', 800: '#1A0E09', 900: '#0D0705' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
