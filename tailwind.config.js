/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#05050A",
        surface: "#0D0D18",
        panel: "#12121F",
        border: "#1E1E35",
        accent: "#FF3B3B",
        accentOrange: "#FF7A00",
        accentYellow: "#FFD600",
        accentGreen: "#00E676",
        accentBlue: "#3B82F6",
        accentPurple: "#8B5CF6",
        muted: "#4B4B6B",
        sub: "#7070A0",
        text: "#E0E0FF",
        textDim: "#9090B0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite",
        "scan": "scan 3s linear infinite",
        "flicker": "flicker 0.15s infinite linear",
        "bar": "bar 1.2s ease-in-out infinite alternate",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "shake": "shake 0.4s ease-in-out",
        "glow-red": "glow-red 1.5s ease-in-out infinite alternate",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "0.4" },
          "100%": { transform: "scale(0.9)", opacity: "0.8" },
        },
        scan: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 100%" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        bar: {
          "0%": { transform: "scaleY(0.2)" },
          "100%": { transform: "scaleY(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "glow-red": {
          from: { boxShadow: "0 0 10px #FF3B3B40, 0 0 20px #FF3B3B20" },
          to: { boxShadow: "0 0 20px #FF3B3B80, 0 0 40px #FF3B3B40, 0 0 60px #FF3B3B20" },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(255,59,59,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,59,59,0.03) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(ellipse at center, rgba(255,59,59,0.08) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};
