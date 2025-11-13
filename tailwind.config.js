/** @type {import('tailwindcss').Config} */
export const content = ["./app/**/*.{js,jsx,ts,tsx}"];
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
      primary: "#FFCB99",
      secondary: "#000000",
      tertiary: "#FFFFFF",
      // Figma design colors
      "figma-primary": "#E48C26",
      "figma-grey-50": "#FAFAFA",
      "figma-grey-500": "#9E9E9E",
      "figma-grey-600": "#757575",
      "figma-grey-900": "#212121",
      "figma-white": "#FFFFFF",
      "figma-black": "#000000",
      "figma-border": "#EEEEEE",
      // Roogo brand tokens
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
