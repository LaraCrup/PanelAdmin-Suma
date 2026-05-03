/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary:  '#157A6E',
        accent:   '#D7F560',
        terciary: '#12534C',
        bg:       '#F5F5F5',
        surface:  '#FFFFFF',
        border:   '#E5E7EB',
        text:     '#1A1A2E',
        muted:    '#6B7280',
      },
      fontFamily: {
        heading: ['"Montserrat Alternates"', 'sans-serif'],
        body:    ['Quicksand', 'sans-serif'],
      },
      screens: {
        desktop: '1080px',
      },
    },
  },
  plugins: [],
}
