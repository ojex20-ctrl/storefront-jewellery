import { ContactForm } from "./contact-form"
import { getBrandConfig } from "@/lib/brand-config"

export const metadata = { title: "Contact" }

export default async function ContactPage() {
  const brand = await getBrandConfig()
  const email = brand.shop_email || "hello@syrathelabel.com"
  const phone = brand.shop_whatsapp ? `+${brand.shop_whatsapp}` : brand.shop_phone || "+91 98765 43210"
  return <ContactForm email={email} phone={phone} />
}
