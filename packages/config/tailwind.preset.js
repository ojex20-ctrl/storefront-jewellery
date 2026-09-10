/**
 * Shared Tailwind preset for all PODIUM storefronts.
 *
 * Per-storefront brand palette is supplied via CSS custom properties
 * defined in each app's `globals.css`. The preset only declares the
 * mapping from token names (bg, ink, accent, etc.) to those CSS vars,
 * so swapping a theme is a CSS change only.
 */

import animate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.125rem", md: "2rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        muted: "var(--muted)",
        "muted-2": "var(--muted-2)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        "accent-3": "var(--accent-3)",
        "accent-soft": "var(--accent-soft)",
        paper: "var(--paper)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      letterSpacing: {
        tighter: "-0.025em",
        tight: "-0.015em",
        wide: "0.08em",
        wider: "0.14em",
        widest: "0.16em",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        "in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideRight: {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        spin12: { to: { transform: "rotate(360deg)" } },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.7)" },
        },
        loaderBar: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        bump: {
          "0%, 100%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.4)", color: "var(--accent)" },
          "60%": { transform: "scale(0.95)" },
        },
        flipIn: {
          from: { transform: "translateY(-100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.2,0.8,0.2,1) both",
        "fade-in": "fadeIn 0.7s ease both",
        "slide-right": "slideRight 0.7s cubic-bezier(0.2,0.8,0.2,1) both",
        "scale-in": "scaleIn 0.7s cubic-bezier(0.2,0.8,0.2,1) both",
        marquee: "marquee 40s linear infinite",
        "spin-slow": "spin12 12s linear infinite",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "loader-bar": "loaderBar 1.4s cubic-bezier(0.65,0,0.35,1) infinite",
        bump: "bump 0.6s cubic-bezier(0.2,0.8,0.2,1)",
        "flip-in": "flipIn 0.4s cubic-bezier(0.2,0.8,0.2,1)",
      },
    },
  },
  plugins: [animate],
}
