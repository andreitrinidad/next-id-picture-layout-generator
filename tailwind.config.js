module.exports = {
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#372cbc",
          "secondary": "#9afdd1",
          "accent": "#1FB2A6",
          "neutral": "#000000",
          "base-100": "#2A303C",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
  },
  plugins: [
    require('daisyui'),
  ],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      "primary": "#372cbc",
      "secondary": "#9afdd1",
      "accent": "#1FB2A6",
      "neutral": "#000000",
      "base-100": "#2A303C",
      "info": "#3ABFF8",
      "success": "#36D399",
      "warning": "#FBBD23",
      "error": "#F87272",
    },
    extend: {},
  },
  plugins: [],
}