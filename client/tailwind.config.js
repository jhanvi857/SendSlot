/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paper backgrounds
        paper: {
          1: '#faf7f2',
          2: '#f2ede4',
          3: '#e8e0d3',
        },
        // Ink text
        ink: {
          primary: '#1a1208',
          secondary: '#4a3f2f',
          muted: '#8a7a65',
        },
        // Rust accent
        rust: {
          light: '#f5e8df',
          primary: '#b54a1a',
          dark: '#7a2f0a',
        },
        // Sage green
        sage: {
          primary: '#3a5c42',
          tint: '#e8f0ea',
        },
        // Amber
        amber: {
          primary: '#c47a1a',
          tint: '#fdf3e0',
        },
        // Borders
        border: {
          primary: '#d4c9b8',
          secondary: '#e8e0d3',
        },
      },
      fontFamily: {
        serif: ['Source Serif 4', 'serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      fontSize: {
        xs: '10px',
        sm: '11px',
        base: '12px',
        lg: '13px',
        xl: '16px',
        '2xl': '18px',
        '3xl': '22px',
      },
      borderRadius: {
        none: '0px',
      },
      spacing: {
        '2.5': '2.5rem',
        '0.75': '0.1875rem',
        '1.5': '0.375rem',
        '1.75': '0.4375rem',
        '3.75': '0.9375rem',
      },
      opacity: {
        55: '0.55',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '50%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        progress: 'progress 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
