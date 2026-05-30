"use client"
import { Reveal } from "@podium/ui/motion"
import { Eyebrow, Button } from "@podium/ui/primitives"

export default function ContactPage() {
  return (
    <div className="px-4 py-20 md:px-12 md:py-32 max-w-4xl mx-auto">
      <Reveal>
        <Eyebrow className="text-accent mb-6">Connect</Eyebrow>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-12">
          We&apos;re here to help.
        </h1>
        
        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl mb-4">Get in touch</h2>
            <p className="text-ink-2 mb-8">
              Have a question about our collections or your order? Reach out to our concierge team.
            </p>
            
            <div className="grid gap-6">
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">Email</h3>
                <p className="font-display text-xl">concierge@syra.com</p>
              </div>
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">WhatsApp</h3>
                <p className="font-display text-xl">+971 50 123 4567</p>
              </div>
            </div>
          </div>

          <form className="grid gap-6 p-8 border border-line bg-bg-2">
            <div className="grid gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Name</label>
              <input className="bg-transparent border-b border-line py-2 outline-none focus:border-accent" placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Email</label>
              <input className="bg-transparent border-b border-line py-2 outline-none focus:border-accent" placeholder="Your email" />
            </div>
            <div className="grid gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Message</label>
              <textarea className="bg-transparent border-b border-line py-2 outline-none focus:border-accent min-h-[100px]" placeholder="How can we help?" />
            </div>
            <Button className="mt-4">Send Message</Button>
          </form>
        </div>
      </Reveal>
    </div>
  )
}
