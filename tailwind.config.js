/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      // The animations like 'animate-in', 'fade-in' etc. are likely from a plugin (tailwindcss-animate)
      // which the CDN version includes. To replicate the effect without adding a new dependency,
      // we add a simple keyframe animation that applies to the 'animate-in' class.
      keyframes: {
        'content-show': {
          from: { opacity: '0', transform: 'translateY(1rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'in': 'content-show 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
