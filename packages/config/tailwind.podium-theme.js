/**
 * PODIUM (clothing) theme tokens.
 * Other storefronts can ship their own theme file with the same shape.
 *
 * These values are mirrored into CSS custom properties in app globals.css —
 * keep both in sync. We export as a JS object so docs / tooling can introspect.
 */
export const podiumTokens = {
  light: {
    "--bg": "#f5f3ee",
    "--bg-2": "#ebe8e0",
    "--ink": "#0e0e0c",
    "--ink-2": "#1a1a17",
    "--muted": "#6b6a64",
    "--muted-2": "#9b9a92",
    "--line": "#d8d4c8",
    "--line-2": "#c4bfb0",
    "--accent": "#ff4a1c",
    "--accent-2": "#2d4ef5",
    "--accent-3": "#d4ed3a",
    "--accent-soft": "#ffe9dc",
    "--paper": "#fdfcf8",
  },
  dark: {
    "--bg": "#0e0e0c",
    "--bg-2": "#1a1916",
    "--ink": "#f5f3ee",
    "--ink-2": "#ebe8e0",
    "--muted": "#8a877e",
    "--muted-2": "#555550",
    "--line": "#2a2926",
    "--line-2": "#3a3934",
    "--accent": "#ff4a1c",
    "--accent-2": "#2d4ef5",
    "--accent-3": "#d4ed3a",
    "--accent-soft": "#2a1a10",
    "--paper": "#15140f",
  },
}
