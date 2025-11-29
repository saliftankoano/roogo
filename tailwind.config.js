/** @type {import('tailwindcss').Config} */
export const content = [
  "./App.{js,jsx,ts,tsx}",
  "./app/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
];
export const presets = [require("nativewind/preset")];
export const theme = {
  extend: {
    fontFamily: {
      "dm-sans": ["dm-sans", "sans-serif"],
      garamond: ["garamond", "serif"],
      inter: ["inter", "sans-serif"],
      oswald: ["oswald", "sans-serif"],
      urbanist: ["urbanist", "sans-serif"],
    },
    colors: {
      roogo: {
        primary: {
          500: "#C96A2E", // Terracotta Ember (main CTA)
          600: "#8A4924", // Clay Brown (hover / pressed)
          700: "#5A321A", // Earth Umber (strong accents)
        },
        secondary: {
          100: "#F4E8D7", // Sand Dune (light bg)
          200: "#E8D8C5", // Warm Linen (cards)
          800: "#2B241D", // Desert Night (dark mode bg)
        },
        accent: {
          500: "#3FA6D9", // Sahel Sky (links / secondary buttons)
          600: "#1F7CA5", // Deep Oasis (hover / dark mode)
        },
        neutral: {
          900: "#1A1A1A", // main text
          700: "#323232", // subtitles
          500: "#6A6A6A", // secondary text
          100: "#F8F8F8", // light background
        },
        success: "#2E8B57",
        warning: "#E59F2B",
        error: "#D9534F",
      },
      // Legacy color support (for backward compatibility during migration)
      primary: "#FFCB99",
      secondary: "#000000",
      tertiary: "#FFFFFF",
      "figma-primary": "#E48C26",
      "figma-grey-50": "#FAFAFA",
      "figma-grey-500": "#9E9E9E",
      "figma-grey-600": "#757575",
      "figma-grey-900": "#212121",
      "figma-white": "#FFFFFF",
      "figma-black": "#000000",
      "figma-border": "#EEEEEE",
      "primary-blue": "#3A8BFF",
      "primary-pressed": "#2C74E6",
      text: "#111111",
      muted: "#6A6A6A",
      border: "#E9ECEF",
      surface: "#FFFFFF",
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#EF4444",
    },
  },
};
export const plugins = [];
