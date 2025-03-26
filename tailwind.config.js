/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E67E22',
        secondary: '#27AE60',
        success: '#2ECC71',
        danger: '#C0392B',
        warning: '#F39C12',
        info: '#3498DB',
        neutral: '#D5B8A3',
        accent: '#8E44AD',
      },
      animation: {
        'bounce-slow': 'bounce 3s linear infinite',
        'pop': 'pop 0.3s ease-in-out',
        'scale': 'scale 0.2s ease-in-out',
      },
      keyframes: {
        pop: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        scale: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      zIndex: {
        '100': '100',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}

