/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji'
        ],
        body: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji'
        ]
      },
      colors: {
        ink: {
          950: '#0b0d12',
          900: '#121622',
          800: '#1a2030'
        },
        mist: {
          50: '#f7f7f9',
          100: '#eceef2',
          200: '#d4d9e2',
          300: '#b4bccb'
        },
        ember: {
          500: '#f97316',
          600: '#ea580c'
        },
        tide: {
          500: '#0ea5e9',
          600: '#0284c7'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(249, 115, 22, 0.25), 0 12px 40px rgba(15, 23, 42, 0.45)'
      }
    }
  },
  plugins: []
};
