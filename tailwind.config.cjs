/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        kiwi: {
          cyan: "#00C2E0",
          pink: "#FF7D66",
          yellow: "#FFF066"
        },
        pomo: {
          red: "#FF7D66",
          green: "#27AE60",
          blue: "#00C2E0"
        }
      },
      boxShadow: {
        card: "0 22px 45px -30px rgba(15, 23, 42, 0.55), 0 10px 22px -18px rgba(15, 23, 42, 0.35)",
        soft: "0 14px 32px -24px rgba(15, 23, 42, 0.4)"
      },
      fontFamily: {
        sans: ["\"Avenir Next\"", "Avenir", "\"SF Pro Text\"", "\"Helvetica Neue\"", "sans-serif"],
        display: ["\"Avenir Next\"", "Avenir", "\"SF Pro Display\"", "\"Helvetica Neue\"", "sans-serif"]
      },
      keyframes: {
        "slide-down": {
          "0%": {
            transform: "translateY(-100%) scale(0.98)",
            opacity: "0"
          },
          "100%": {
            transform: "translateY(0) scale(1)",
            opacity: "1"
          }
        },
        "slide-up": {
          "0%": {
            transform: "translateY(0) scale(1)",
            opacity: "1"
          },
          "100%": {
            transform: "translateY(-100%) scale(0.98)",
            opacity: "0"
          }
        },
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(-8px) scale(0.96)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)"
          }
        },
        "bounce-in": {
          "0%": {
            transform: "scale(0.92)",
            opacity: "0"
          },
          "70%": {
            transform: "scale(1.03)",
            opacity: "1"
          },
          "100%": {
            transform: "scale(1)"
          }
        }
      },
      animation: {
        "slide-down": "slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.35s cubic-bezier(0.4, 0, 1, 1)",
        fadeIn: "fadeIn 0.2s ease-out",
        "bounce-in": "bounce-in 0.35s ease-out"
      }
    }
  },
  plugins: []
};
