/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./examples/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Safelist to ensure critical classes are always included
  safelist: [
    // Notification background colors
    "bg-green-50",
    "bg-red-50",
    "bg-yellow-50",
    "bg-blue-50",
    "bg-gray-50",

    // Notification border colors
    "border-green-200",
    "border-red-200",
    "border-yellow-200",
    "border-blue-200",
    "border-gray-200",

    // Notification text colors
    "text-green-800",
    "text-red-800",
    "text-yellow-800",
    "text-blue-800",
    "text-gray-800",

    // Icon colors
    "text-green-400",
    "text-red-400",
    "text-yellow-400",
    "text-blue-400",
    "text-gray-400",

    // Error debug panel colors
    "bg-red-50",
    "border-red-200",
    "text-red-600",
    "text-red-700",
  ],
};
