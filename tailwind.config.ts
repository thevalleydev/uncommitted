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
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '72ch',
            a: {
              color: '#6366f1',
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
              borderLeftColor: '#6366f1',
              fontStyle: 'normal',
            },
          },
        },
        invert: {
          css: {
            a: {
              color: '#818cf8',
            },
            blockquote: {
              borderLeftColor: '#818cf8',
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
