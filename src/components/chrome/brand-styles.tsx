import type { BrandConfig } from "@/lib/brand-config"

/**
 * Injects per-storefront CSS-variable overrides. Uses the black/white/sand
 * palette as the base, with brand config able to override accent.
 */
export function BrandStyles({ brand }: { brand: BrandConfig }) {
  const css = `
    :root {
      --bg: #0A0A0A;
      --ink: #FFFFFF;
      --accent: ${brand.accent_hex ?? '#C2B9A7'};
    }
  `
  return <style data-brand-styles dangerouslySetInnerHTML={{ __html: css }} />
}
