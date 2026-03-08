/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    styled: true,
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "primary": "#3b82f6",
          "secondary": "#10b981",
          "accent": "#8b5cf6",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "primary": "#60a5fa",
          "secondary": "#34d399",
          "accent": "#a78bfa",
        }
      }
    ],
    darkTheme: "dark",
  }
}
