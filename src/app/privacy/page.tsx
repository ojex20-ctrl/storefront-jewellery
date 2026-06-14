"use client"
import { Reveal } from "@podium/ui/motion"
import { Eyebrow } from "@podium/ui/primitives"

export default function PrivacyPage() {
  return (
    <div className="px-4 py-20 md:px-12 md:py-32 max-w-4xl mx-auto">
      <Reveal>
        <Eyebrow className="text-accent mb-6">Legal</Eyebrow>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-12">
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert max-w-none text-ink-2 leading-relaxed">
          <p className="mb-6">At SYRA, we respect your privacy and are committed to protecting your personal data. This policy outlines how we handle your information when you visit our store or make a purchase.</p>
          
          <h2 className="font-display text-2xl text-ink mb-4 mt-8">Information We Collect</h2>
          <p className="mb-4">When you purchase from SYRA, we collect your name, billing address, shipping address, payment information, and email address to process your order.</p>

          <h2 className="font-display text-2xl text-ink mb-4 mt-8">How We Use Your Data</h2>
          <p className="mb-4">We use your information to fulfill orders, communicate with you about your purchase, and (if you opt-in) send you updates about new collections.</p>

          <h2 className="font-display text-2xl text-ink mb-4 mt-8">Security</h2>
          <p className="mb-4">We use industry-standard encryption and secure payment gateways to ensure your data is protected. We never store your full credit card details on our servers.</p>
        </div>
      </Reveal>
    </div>
  )
}
