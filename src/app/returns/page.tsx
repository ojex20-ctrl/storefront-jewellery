import { Reveal } from "@podium/ui/motion"
import { Eyebrow } from "@podium/ui/primitives"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "Returns and Refunds",
  description: "Read the SYRA returns and refunds policy for unworn jewellery, exchanges, exclusions and support instructions.",
  path: "/returns",
  image: "/hero/syra_hero_3.png",
})

export default function ReturnsPage() {
  return (
    <div className="px-4 py-20 md:px-12 md:py-32 max-w-4xl mx-auto">
      <Reveal>
        <Eyebrow className="text-accent mb-6">Service</Eyebrow>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-12">
          Returns & Refunds
        </h1>
        
        <div className="prose prose-invert max-w-none text-ink-2 leading-relaxed">
          <p className="mb-6">We want you to love your SYRA pieces. If you are not completely satisfied, we offer a straightforward return process.</p>
          
          <h2 className="font-display text-2xl text-ink mb-4 mt-8">Return Policy</h2>
          <p className="mb-4">You can return any unworn SYRA jewellery within 14 days of delivery for a full refund or exchange. Items must be in their original packaging with all tags attached.</p>

          <h2 className="font-display text-2xl text-ink mb-4 mt-8">Exclusions</h2>
          <p className="mb-4">For hygiene reasons, earrings cannot be returned or exchanged unless they are faulty.</p>

          <h2 className="font-display text-2xl text-ink mb-4 mt-8">How to Start a Return</h2>
          <p className="mb-4">Email our team at concierge@syra.com with your order number and reason for return. We will provide you with a return label and instructions.</p>
        </div>
      </Reveal>
    </div>
  )
}
