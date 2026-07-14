import { Reveal } from "@podium/ui/motion"
import { Eyebrow } from "@podium/ui/primitives"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "Terms and Conditions",
  description: "Read SYRA terms and conditions covering website use, product information, purchases and governing law.",
  path: "/terms",
  image: "/hero/syra_hero_1.png",
})

export default function TermsPage() {
  return (
    <div className="px-4 py-20 md:px-12 md:py-32 max-w-4xl mx-auto">
      <Reveal>
        <Eyebrow className="text-accent mb-6">Legal</Eyebrow>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-12">
          Terms & Conditions
        </h1>
        
        <div className="prose prose-invert max-w-none text-ink-2 leading-relaxed">
          <p className="mb-6">By using the SYRA website, you agree to comply with and be bound by the following terms and conditions of use.</p>
          
          <h2 className="font-display text-2xl text-ink mb-4 mt-8">Use of Website</h2>
          <p className="mb-4">The content of the pages of this website is for your general information and use only. It is subject to change without notice.</p>

          <h2 className="font-display text-2xl text-ink mb-4 mt-8">Product Information</h2>
          <p className="mb-4">We attempt to be as accurate as possible in the description of our products. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.</p>

          <h2 className="font-display text-2xl text-ink mb-4 mt-8">Governing Law</h2>
          <p className="mb-4">Your use of this website and any dispute arising out of such use is subject to the laws of India.</p>
        </div>
      </Reveal>
    </div>
  )
}
