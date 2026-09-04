/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#111315', // Main Background
          900: '#202428', // Cards / Panels
          850: '#272C30', // Card Hover
          800: '#343A40', // Borders
          700: '#3A4147', // Input border
          550: '#747B82', // Muted text
          500: '#747B82', // Muted text
          450: '#A7ADB4', // Secondary text
          400: '#A7ADB4', // Secondary text
          250: '#F1F3F4', // Main text
          200: '#F1F3F4', // Main text
          100: '#F1F3F4', // Main text
        },
        blue: {
          500: '#2A9D8F', // Primary Accent
          600: '#238276', // Primary Hover
          700: '#1F756B', // Primary Active
        },
        indigo: {
          500: '#6C9BD2', // Low Risk
        },
        emerald: {
          450: '#4FAF78',
          500: '#4FAF78', // Safe / Success
        },
        amber: {
          450: '#D4A72C',
          500: '#D4A72C', // Warning / Medium Risk
        },
        orange: {
          500: '#E07A3F', // High Risk
        },
        red: {
          500: '#D9534F', // Critical Risk
        }
      }
    },
  },
  plugins: [],
}
