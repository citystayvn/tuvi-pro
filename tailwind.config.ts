import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        chart: ["var(--font-chart)", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        sidebar: "hsl(var(--sidebar))",
        el: {
          kim: "hsl(var(--el-kim))",
          moc: "hsl(var(--el-moc))",
          thuy: "hsl(var(--el-thuy))",
          hoa: "hsl(var(--el-hoa))",
          tho: "hsl(var(--el-tho))",
        },
        paper: "hsl(var(--chart-paper))",
        "paper-center": "hsl(var(--chart-center))",
        ink: "hsl(var(--chart-ink))",
        good: "hsl(var(--good))",
        bad: "hsl(var(--bad))",
        annual: "hsl(var(--annual))",
        decadal: "hsl(var(--decadal))",
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-right": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        "slide-in-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
      },
      animation: { "fade-in": "fade-in 150ms ease-out", "slide-in-right": "slide-in-right 200ms ease-out", "slide-in-up": "slide-in-up 220ms ease-out" },
    },
  },
  plugins: [],
} satisfies Config;
