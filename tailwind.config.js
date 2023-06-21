import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,tsx,jsx}",
    "./node_modules/@opennetwork/logistics/**/*.{html,js,ts,tsx,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [forms],
};
