/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        berry: { DEFAULT: '#5A2149', dark: '#3B1530', light: '#7A3E67', pale: '#F1E5ED' },
        vanilla: { DEFAULT: '#F8F3E8', deep: '#EFE5D3', card: '#FFFCF5' },
        ink: '#211A20', muted: '#756B73', line: '#E8DED9', moss: '#63765B'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'Times New Roman', 'serif']
      },
      boxShadow: {
        soft: '0 14px 40px rgba(49, 25, 42, 0.08)',
        card: '0 8px 24px rgba(49, 25, 42, 0.07)'
      }
    }
  },
  plugins: []
};
