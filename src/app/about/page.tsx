/* eslint-disable @next/next/no-img-element */
import { Reveal } from "@podium/ui/motion"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "About SYRA Anti-Tarnish Jewellery",
  description: "Learn about SYRA anti-tarnish jewellery, waterproof PVD finishes, hypoallergenic materials and everyday luxury design.",
  path: "/about",
  image: "/hero/syra_hero_2.png",
})

export default function AboutPage() {
  return (
    <div className="marble-page">
      <section className="marble-page-hero marble-texture">
        <div className="marble-inner"><Reveal><p className="marble-eyebrow">Our Story</p><h1>Artistry that spans generations.</h1><p>Sagar Samrat Marble has been a revered name since the 1980s.</p></Reveal></div>
      </section>
      <section className="marble-section marble-white">
        <div className="marble-inner marble-page-split">
          <div className="marble-page-image">
            <img src="/marble/catalogue-02-01.jpg" alt="Traditional marble artisan at work" />
          </div>
          <Reveal><div className="marble-page-copy"><p className="marble-eyebrow">Premium Makrana Marble Artisans</p><h2>Faith, heritage and lasting elegance.</h2><p>Sagar Samrat Marble specializes in Makrana White Marble Mandirs, exquisite handcrafted marble carvings, and finely detailed marble inlay work.</p><p>Rooted in generations of traditional artistry, our work reflects purity, devotion, and an uncompromising commitment to excellence.</p><p>With operations in Mumbai and Makrana, we blend sacred craftsmanship with refined precision to create timeless marble art across India.</p></div></Reveal>
        </div>
      </section>
      <section className="marble-section marble-texture">
        <div className="marble-inner"><div className="marble-heading"><p className="marble-eyebrow">Our foundation</p><h2>Crafted between Mumbai and Makrana.</h2></div><div className="marble-page-stat-grid"><div><strong>Since the 1980s</strong><p>Generations of traditional marble artistry.</p></div><div><strong>Mumbai</strong><p>Our sales office in Maharashtra.</p></div><div><strong>Makrana</strong><p>Our mines and operation unit in Rajasthan.</p></div><div><strong>Pan India</strong><p>Timeless marble creations executed across India.</p></div></div></div>
      </section>
      <section className="marble-section marble-white">
        <div className="marble-inner"><div className="marble-heading"><p className="marble-eyebrow">The people behind the craft</p><h2>Our Founder &amp; Team</h2></div><div className="marble-team grid grid-cols-1 gap-8 md:grid-cols-3">{[
          { name: "Gaffar Khatri", role: "Founder", image: "/marble/catalogue-11-08.jpg" },
          { name: "Aamir Khatri", role: "Co-Founder", image: "/marble/catalogue-11-01.jpg" },
          { name: "Gazi Khatri", role: "BDM", image: "/marble/catalogue-11-02.jpg" },
        ].map(person => <figure key={person.name}><img src={person.image} alt={person.name} /><figcaption><h3>{person.name}</h3><p>{person.role}</p></figcaption></figure>)}</div></div>
      </section>
    </div>
  )
}
