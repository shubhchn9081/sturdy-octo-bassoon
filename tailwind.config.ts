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
      transitionProperty: {
        'width': 'width',
        'height': 'height',
        'height-opacity': 'height, opacity',
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
        },
        "flame": {
          "0%": { 
            transform: "scaleY(0.8)",
            opacity: "0.8" 
          },
          "50%": { 
            transform: "scaleY(1.2)",
            opacity: "1" 
          },
          "100%": { 
            transform: "scaleY(1)",
            opacity: "0.9" 
          }
        },
        "flame-fast": {
          "0%": { 
            transform: "scaleY(0.9) scaleX(0.85)",
            opacity: "0.8" 
          },
          "50%": { 
            transform: "scaleY(1.1) scaleX(1.05)",
            opacity: "1" 
          },
          "100%": { 
            transform: "scaleY(0.9) scaleX(0.95)",
            opacity: "0.9" 
          }
        },
        "flame-outer": {
          "0%": { 
            height: "70%",
            opacity: "0.9" 
          },
          "50%": { 
            height: "100%",
            opacity: "1" 
          },
          "100%": { 
            height: "85%",
            opacity: "0.8" 
          }
        },
        "flame-inner": {
          "0%": { 
            height: "60%",
            opacity: "0.7" 
          },
          "50%": { 
            height: "80%",
            opacity: "0.9" 
          },
          "100%": { 
            height: "65%",
            opacity: "0.8" 
          }
        },
        "explosion-outer": {
          "0%": { 
            transform: "scale(0.5)",
            opacity: "1" 
          },
          "100%": { 
            transform: "scale(2)",
            opacity: "0" 
          }
        },
        "explosion-middle": {
          "0%": { 
            transform: "scale(0.7)",
            opacity: "1" 
          },
          "100%": { 
            transform: "scale(1.8)",
            opacity: "0" 
          }
        },
        "explosion-inner": {
          "0%": { 
            transform: "scale(1)",
            opacity: "1" 
          },
          "100%": { 
            transform: "scale(1.5)",
            opacity: "0" 
          }
        },
        "particle-explosion": {
          "0%": { 
            transform: "translate(0, 0) scale(1)",
            opacity: "1" 
          },
          "100%": { 
            transform: "translate(var(--x, 50px), var(--y, 50px)) scale(0)",
            opacity: "0" 
          }
        },
        "twinkle": {
          "0%": { 
            opacity: "0.3" 
          },
          "50%": { 
            opacity: "1" 
          },
          "100%": { 
            opacity: "0.3" 
          }
        },
        "pulse-slow": {
          "0%": { 
            opacity: "0.4",
            transform: "scale(0.95)"
          },
          "50%": { 
            opacity: "1",
            transform: "scale(1.05)"
          },
          "100%": { 
            opacity: "0.4",
            transform: "scale(0.95)"
          }
        },
        "meteor": {
          "0%": { 
            transform: "translateX(-100px) translateY(-100px) rotate(45deg) scale(0.8)",
            opacity: "0"
          },
          "10%": {
            opacity: "1"
          },
          "100%": { 
            transform: "translateX(100px) translateY(100px) rotate(45deg) scale(1.2)",
            opacity: "0"
          }
        },
        "fly": {
          "0%": { 
            transform: "translateY(0px) rotate(var(--rotate, 0deg))",
          },
          "50%": { 
            transform: "translateY(-5px) rotate(var(--rotate, 0deg))",
          },
          "100%": { 
            transform: "translateY(0px) rotate(var(--rotate, 0deg))",
          }
        },
        "wave": {
          "0%": { 
            transform: "skew(var(--skew-x, 0deg), var(--skew-y, 0deg)) translateY(0px)",
            opacity: "var(--opacity-base, 0.3)"
          },
          "50%": { 
            transform: "skew(calc(var(--skew-x, 0deg) * -1), calc(var(--skew-y, 0deg) * -1)) translateY(-10px)",
            opacity: "calc(var(--opacity-base, 0.3) * 1.5)"
          },
          "100%": { 
            transform: "skew(var(--skew-x, 0deg), var(--skew-y, 0deg)) translateY(0px)",
            opacity: "var(--opacity-base, 0.3)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pop": "pop 0.5s ease-out",
        "explosion": "explosion 0.7s ease-out",
        "revealGem": "revealGem 0.5s ease-out",
        "flame": "flame 0.6s ease-in-out infinite",
        "flame-fast": "flame-fast 0.4s ease-in-out infinite",
        "flame-outer": "flame-outer 0.5s ease-in-out infinite",
        "flame-inner": "flame-inner 0.4s ease-in-out infinite", 
        "explosion-outer": "explosion-outer 1s ease-out forwards",
        "explosion-middle": "explosion-middle 0.8s ease-out forwards",
        "explosion-inner": "explosion-inner 0.6s ease-out forwards",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "meteor": "meteor 4s ease-out",
        "fly": "fly 2s ease-in-out infinite",
        "wave": "wave 5s ease-in-out infinite"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
