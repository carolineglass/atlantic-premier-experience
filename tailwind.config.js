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
        // "Refreshing Summer Fun" palette: sky / ocean / navy / gold / tangerine
        ocean: {
          50: '#EBF5FA',
          100: '#D2EAF4',
          400: '#5FAECB',
          500: '#3A92B8',
          600: '#2E7A9C',
          700: '#256379',
          900: '#143648',
        },
        sky: {
          50: '#F0F8FC',
          100: '#DCEFF8',
          400: '#A5D2EA',
          500: '#8AC3E1',
          600: '#5FA8CE',
          700: '#33769E',
        },
        navy: {
          DEFAULT: '#132A41',
          50: '#EEF2F6',
          500: '#16304A',
          600: '#122840',
          700: '#0E2033',
        },
        gold: {
          50: '#FEF6E0',
          100: '#FDEBB8',
          400: '#F9C63F',
          500: '#F7B500',
          600: '#D99F00',
          700: '#A67A00',
        },
        tangerine: {
          50: '#FDF0E4',
          100: '#FADCC2',
          400: '#F19249',
          500: '#EC7412',
          600: '#D2660E',
          700: '#A8520C',
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
