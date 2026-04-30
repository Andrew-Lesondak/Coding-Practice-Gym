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
          950: 'rgb(var(--color-ink-950) / <alpha-value>)',
          900: 'rgb(var(--color-ink-900) / <alpha-value>)',
          800: 'rgb(var(--color-ink-800) / <alpha-value>)'
        },
        mist: {
          50: 'rgb(var(--color-mist-50) / <alpha-value>)',
          100: 'rgb(var(--color-mist-100) / <alpha-value>)',
          200: 'rgb(var(--color-mist-200) / <alpha-value>)',
          300: 'rgb(var(--color-mist-300) / <alpha-value>)'
        },
        ember: {
          500: 'rgb(var(--color-ember-500) / <alpha-value>)',
          600: 'rgb(var(--color-ember-600) / <alpha-value>)'
        },
        tide: {
          500: 'rgb(var(--color-tide-500) / <alpha-value>)',
          600: 'rgb(var(--color-tide-600) / <alpha-value>)'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(249, 115, 22, 0.25), 0 12px 40px rgba(15, 23, 42, 0.45)'
      }
    }
  },
  plugins: []
};
