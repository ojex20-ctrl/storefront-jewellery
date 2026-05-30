"use client"
import { Reveal } from "@podium/ui/motion"
import { Eyebrow } from "@podium/ui/primitives"
import { Truck, Clock, MapPin, Package } from "lucide-react"

export default function ShippingPage() {
  return (
    <div className="px-4 py-20 md:px-12 md:py-32 max-w-4xl mx-auto">
      <Reveal>
        <Eyebrow className="text-accent mb-6">Delivery</Eyebrow>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-12">
          Shipping & <em className="text-accent">Delivery</em>.
        </h1>

        <div className="grid gap-6 md:grid-cols-2 mb-16">
          <div className="border border-line p-6 flex gap-4">
            <Truck size={24} className="text-accent shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <h3 className="font-display text-xl mb-2">Standard Shipping</h3>
              <p className="text-sm text-ink-2">Free on orders over ₹999. Delivery in 3–5 business days across India.</p>
              <p className="mt-2 font-mono text-xs text-muted">₹79 for orders under ₹999</p>
            </div>
          </div>
          <div className="border border-line p-6 flex gap-4">
            <Clock size={24} className="text-accent shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <h3 className="font-display text-xl mb-2">Express Shipping</h3>
              <p className="text-sm text-ink-2">1–2 business days. Available for metro cities.</p>
              <p className="mt-2 font-mono text-xs text-muted">₹149 flat rate</p>
            </div>
          </div>
          <div className="border border-line p-6 flex gap-4">
            <MapPin size={24} className="text-accent shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <h3 className="font-display text-xl mb-2">Coverage</h3>
              <p className="text-sm text-ink-2">We ship to all pincodes across India. International shipping coming soon.</p>
            </div>
          </div>
          <div className="border border-line p-6 flex gap-4">
            <Package size={24} className="text-accent shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <h3 className="font-display text-xl mb-2">Packaging</h3>
              <p className="text-sm text-ink-2">Every piece ships in a branded SYRA pouch inside a tamper-proof box. Gift wrapping available at checkout.</p>
            </div>
          </div>
        </div>

        <h2 className="font-display text-3xl mb-6">Frequently Asked</h2>
        <div className="space-y-4">
          {[
            { q: "How do I track my order?", a: "You'll receive a tracking link via email and WhatsApp once your order ships. You can also check status in your account under Orders." },
            { q: "What if I'm not home for delivery?", a: "Our courier partner will attempt delivery 3 times. After that, the package returns to us and we'll reach out to reschedule." },
            { q: "Do you ship internationally?", a: "Not yet — we're working on it. Sign up for our newsletter to be the first to know when we launch international shipping." },
            { q: "Can I change my delivery address after ordering?", a: "Yes, if the order hasn't shipped yet. WhatsApp us immediately with your order number and new address." },
          ].map((faq) => (
            <details key={faq.q} className="group border border-line p-5">
              <summary className="cursor-pointer font-display text-lg flex items-center justify-between">
                {faq.q}
                <span className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-ink-2">{faq.a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
