/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF8',
        accent: '#00C896',
        accentDark: '#00A87C',
        warn: '#F59E0B',
        danger: '#EF4444',
        muted: '#6B7280',
        soft: '#9CA3AF'
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.04)',
        cardHover: '0 4px 20px rgba(0, 0, 0, 0.08)'
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem'
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.7 }
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        pulseSoft: 'pulseSoft 1.6s ease-in-out infinite',
        slideUp: 'slideUp 0.25s ease-out'
      }
    }
  },
  plugins: []
}
