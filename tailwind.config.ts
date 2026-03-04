import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        signal: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '72ch',
            a: {
              color: '#d97706',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            'h1, h2, h3, h4': {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: '600',
            },
            blockquote: {
              borderLeftColor: '#d97706',
              fontStyle: 'normal',
            },
          },
        },
        invert: {
          css: {
            a: {
              color: '#fbbf24',
            },
            blockquote: {
              borderLeftColor: '#fbbf24',
              color: '#a1a1aa',
            },
            'h1, h2, h3, h4': {
              color: '#fafafa',
            },
            strong: {
              color: '#fafafa',
            },
            code: {
              color: '#e4e4e7',
            },
            'thead th': {
              color: '#d4d4d8',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config
