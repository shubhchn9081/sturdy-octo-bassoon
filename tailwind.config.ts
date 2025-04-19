import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pop": {
          "0%": { 
            transform: "scale(0)",
            opacity: "0" 
          },
          "60%": { 
            transform: "scale(1.2)",
            opacity: "1" 
          },
          "100%": { 
            transform: "scale(1)",
            opacity: "1" 
          }
        },
        "explosion": {
          "0%": { 
            transform: "scale(0) rotate(0deg)",
            opacity: "0" 
          },
          "50%": { 
            transform: "scale(1.5) rotate(15deg)",
            opacity: "1" 
          },
          "70%": { 
            transform: "scale(1.2) rotate(-5deg)",
            filter: "brightness(1.5)" 
          },
          "100%": { 
            transform: "scale(1) rotate(0deg)",
            opacity: "1" 
          }
        },
        "revealGem": {
          "0%": { 
            backgroundColor: "#2f2f3d",
            boxShadow: "inset 0 0 5px #1e1e2f"
          },
          "50%": { 
            backgroundColor: "#45455e",
            boxShadow: "inset 0 0 10px #2e2e40"
          },
          "100%": { 
            backgroundColor: "#2f2f3d", 
            boxShadow: "inset 0 0 5px #1e1e2f"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pop": "pop 0.5s ease-out",
        "explosion": "explosion 0.7s ease-out",
        "revealGem": "revealGem 0.5s ease-out"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
