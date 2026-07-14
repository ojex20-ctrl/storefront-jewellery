import { ContactForm } from "./contact-form"
import { getBrandConfig } from "@/lib/brand-config"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "Contact SYRA",
  description: "Contact SYRA for jewellery orders, customization, warranty support, shipping questions and customer care.",
  path: "/contact",
  image: "/hero/syra_hero_3.png",
})

export default async function ContactPage() {
  const brand = await getBrandConfig()
  const email = brand.shop_email || "hello@syrathelabel.com"
  const phone = brand.shop_whatsapp ? `+${brand.shop_whatsapp}` : brand.shop_phone || "+91 98765 43210"
  return <ContactForm email={email} phone={phone} />
}
