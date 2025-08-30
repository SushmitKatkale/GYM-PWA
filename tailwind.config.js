/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF7A00',
          50: '#FFF3E8',
          100: '#FFE6D1',
          200: '#FFC7A3',
          300: '#FFA875',
          400: '#FF8A47',
          500: '#FF7A00',
          600: '#CC6100',
          700: '#994900',
          800: '#663000',
          900: '#331800'
        },
        ink: {
          50: '#F7F7F9',
          100: '#F0F1F5',
          200: '#D9DBE3',
          300: '#C2C6D1',
          400: '#9AA0AE',
          500: '#717A8C',
          600: '#555E6F',
          700: '#3B4352',
          800: '#232A35',
          900: '#12171F'
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444'
      },
      borderRadius: {
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '28px',
        '2xl': '36px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(18, 23, 31, 0.08)',
        soft: '0 4px 12px rgba(18, 23, 31, 0.06)',
        press: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.06)'
      },
      fontFamily: {
        sans: ['Roboto', 'Open Sans', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Montserrat', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'Open Sans', 'system-ui', 'sans-serif'],
        button: ['Poppins', 'Montserrat', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
};
