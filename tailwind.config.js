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
    },
  },
};
export const plugins = [];
