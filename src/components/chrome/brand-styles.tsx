import type { BrandConfig } from "@/lib/brand-config"

/**
 * Injects per-storefront CSS-variable overrides. Theme surfaces come from
 * globals.css; brand config only customizes the accent token.
 */
export function BrandStyles({ brand }: { brand: BrandConfig }) {
  const css = `
    :root {
      --accent: ${brand.accent_hex ?? '#C2B9A7'};
    }
  `
  return <style data-brand-styles dangerouslySetInnerHTML={{ __html: css }} />
}
