import type { Config } from "tailwindcss"
import preset from "@podium/config/tailwind"

export default {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@podium/ui/src/**/*.{ts,tsx}"],
} satisfies Config
