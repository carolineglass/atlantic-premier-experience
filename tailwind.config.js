/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0C0F14',
          soft: '#3A4150',
          muted: '#6B7280',
        },
        pitch: {
          50: '#E8FAF0',
          100: '#CFF5DF',
          400: '#2BD873',
          500: '#16C15B',
          600: '#0FA84C',
          700: '#0C8A3F',
          900: '#07522A',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(12, 15, 20, 0.04), 0 1px 3px rgba(12, 15, 20, 0.06)',
        'card-hover':
          '0 4px 6px rgba(12, 15, 20, 0.04), 0 12px 24px rgba(12, 15, 20, 0.10)',
      },
    },
  },
  plugins: [],
};
