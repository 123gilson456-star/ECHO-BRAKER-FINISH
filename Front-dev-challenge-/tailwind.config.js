/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E1420",
          light: "#161E2E",
          border: "#232C3D",
        },
        paper: "#F6F3EC",
        marker: {
          DEFAULT: "#E8A33D",
          soft: "#F0C378",
        },
        alert: "#D65F4C",
        verified: "#3FA796",
        slate: {
          muted: "#7C8699",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(246,243,236,0.04) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
