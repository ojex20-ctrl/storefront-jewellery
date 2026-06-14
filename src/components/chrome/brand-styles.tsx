import type { BrandConfig } from "@/lib/brand-config"

/**
 * Injects a per-storefront CSS-variable override block under <head>. This is
 * what makes the admin's colour pickers actually live — every Tailwind utility
 * (`text-ink`, `bg-bg`, `text-accent`, …) reads from these vars at runtime, so
 * changing accent_hex in /app/brand-config and revalidating brings the new
 * colour through on the next page load (~30s, see brand-config.ts).
 *
 * The bg/ink/accent triplet is the only thing that varies per brand right now;
 * the full token set still lives in `globals.css` as a sane default.
 */
export function BrandStyles({ brand }: { brand: BrandConfig }) {
  const css = `
    :root {
      --bg: ${brand.bg_hex};
      --ink: ${brand.ink_hex};
      --accent: ${brand.accent_hex};
    }
  `
  // dangerouslySetInnerHTML is safe here — the values are hex strings the
  // admin form constrains to <input type="color">, and we're concatenating
  // into a CSS rule, not arbitrary HTML.
  return <style data-brand-styles dangerouslySetInnerHTML={{ __html: css }} />
}
