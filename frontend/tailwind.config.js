/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        canvas: '#0B0F19',
        surface: '#131926',
        card: '#192132',
        elevated: '#202A3F',
        borderSubtle: '#263147',
      },
    },
  },
  plugins: [],
};
