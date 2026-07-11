import { HomeClient } from "./_home/home-client"
import { NewsletterSignup } from "@/components/marketing/newsletter-signup"
import { fetchProducts } from "@/lib/medusa-products"

export default async function HomePage() {
  const products = await fetchProducts()
  return (
    <>
      <HomeClient products={products} />
      <NewsletterSignup source="homepage" />
    </>
  )
}
