import Link from "next/link"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { getBrandConfig } from "@/lib/brand-config"

export default async function NotFound() {
  const brand = await getBrandConfig()
  const strings = (brand.chrome_strings ?? {}) as Record<string, string>
  const title = strings.four_oh_four_title ?? "We couldn't find that piece."
  const cta = strings.four_oh_four_cta ?? "Return home"
  return (
    <div className="px-4 py-32 text-center md:px-8 md:py-40">
      <Eyebrow className="mb-4 block">Page not found</Eyebrow>
      <p className="font-display tracking-tighter" style={{ fontSize: "clamp(56px, 12vw, 160px)" }}>
        404
      </p>
      <p className="mt-2 font-display text-3xl tracking-tight">{title}</p>
      <Link href="/" className="mt-8 inline-block">
        <Button>{cta}</Button>
      </Link>
    </div>
  )
}
