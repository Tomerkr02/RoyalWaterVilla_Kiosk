/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#061818',
        lagoon: '#0b3d3f',
        sea: '#0f6a6b',
        pearl: '#f5f0e8',
        mist: '#b8c9c3',
        gold: '#d6b56d',
        coral: '#e48764'
      },
      boxShadow: {
        glow: '0 18px 70px rgba(214, 181, 109, 0.2)',
        panel: '0 28px 80px rgba(0, 0, 0, 0.28)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
