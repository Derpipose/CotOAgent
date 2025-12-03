import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Add your custom colors here
      },
      spacing: {
        // Add custom spacing if needed
      },
      keyframes: {
        slideIn: {
          'from': {
            transform: 'translateX(400px)',
            opacity: '0',
          },
          'to': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        slideOut: {
          'from': {
            transform: 'translateX(0)',
            opacity: '1',
          },
          'to': {
            transform: 'translateX(400px)',
            opacity: '0',
          },
        },
        progress: {
          'from': {
            width: '100%',
          },
          'to': {
            width: '0%',
          },
        },
        slideDown: {
          'from': {
            opacity: '0',
            maxHeight: '0',
          },
          'to': {
            opacity: '1',
            maxHeight: '500px',
          },
        },
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out forwards',
        slideOut: 'slideOut 0.3s ease-out forwards',
        progress: 'progress 5s linear forwards',
        slideDown: 'slideDown 0.2s ease',
      },
    },
  },
  plugins: [],
} satisfies Config;
