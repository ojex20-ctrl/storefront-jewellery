import { ContactForm } from "./contact-form"
import { buildPageMetadata } from "@/lib/seo"
import { Mail, MapPin, Phone } from "lucide-react"

export const metadata = buildPageMetadata({
  title: "Contact SYRA",
  description: "Contact SYRA for jewellery orders, customization, warranty support, shipping questions and customer care.",
  path: "/contact",
  image: "/hero/syra_hero_3.png",
})

export default function ContactPage() {
  return (
    <div className="marble-page">
      <section className="marble-page-hero marble-texture">
        <div className="marble-inner"><p className="marble-eyebrow">Mumbai &amp; Makrana</p><h1>Let&apos;s create something timeless.</h1><p>Speak with our team about handcrafted mandirs, wall art, and custom inlay work.</p></div>
      </section>
      <section className="marble-section marble-white">
        <div className="marble-inner"><div className="marble-contact-grid grid gap-8 md:grid-cols-3"><div><MapPin size={20} /><h3>Sales Office</h3><p>WE Highway, Vile Parle (E)<br />Mumbai, Maharashtra</p></div><div><MapPin size={20} /><h3>Mines &amp; Operation Unit</h3><p>By Pass Road, near Jhalara Talab<br />Makrana, Rajasthan</p></div><div><Phone size={20} /><h3>Speak with us</h3><a href="tel:+919082025886">+91 90820 25886</a><a href="tel:+919987962204">+91 99879 62204</a><a className="marble-email" href="mailto:sagarsamratmarble@gmail.com"><Mail size={15} />sagarsamratmarble@gmail.com</a></div></div></div>
      </section>
      <section className="marble-section marble-texture marble-contact-form-section"><ContactForm email="sagarsamratmarble@gmail.com" phone="+91 90820 25886 / +91 99879 62204" /></section>
    </div>
  )
}
