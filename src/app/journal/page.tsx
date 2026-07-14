import Link from "next/link"
import { Reveal } from "@podium/ui/motion"
import { Eyebrow, Placeholder } from "@podium/ui/primitives"
import { prisma } from "@/lib/db"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "SYRA Journal",
  description: "Read SYRA jewellery styling tips, anti-tarnish care guides, collection stories and behind-the-scenes notes.",
  path: "/journal",
  image: "/hero/syra_hero_1.png",
})

export default async function JournalPage() {
  let posts: { id: string; title: string; slug: string; excerpt: string | null; coverImage: string | null; author: string; publishedAt: Date | null; tags: string }[] = []
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    })
  } catch { /* db not ready */ }

  return (
    <div className="px-4 py-20 md:px-12 md:py-32 max-w-5xl mx-auto">
      <Reveal>
        <Eyebrow className="text-accent mb-6">Journal</Eyebrow>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-12">
          Stories & <em className="text-accent">Style</em>.
        </h1>
      </Reveal>

      {posts.length === 0 ? (
        <div className="border border-line p-14 text-center">
          <p className="font-display text-3xl mb-2"><em>Coming soon.</em></p>
          <Eyebrow className="block">Styling tips, care guides, and behind-the-scenes from the atelier.</Eyebrow>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/journal/${post.slug}`} className="group flex flex-col gap-4">
              <div className="aspect-[4/3] overflow-hidden border border-line">
                <Placeholder image={post.coverImage ?? undefined} className="h-full w-full transition-transform duration-500 group-hover:scale-105" alt={post.title} />
              </div>
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {JSON.parse(post.tags).slice(0, 2).map((tag: string) => (
                    <span key={tag} className="font-mono text-[9px] uppercase tracking-widest text-accent border border-accent/30 px-2 py-0.5">{tag}</span>
                  ))}
                </div>
                <h2 className="font-display text-xl tracking-tight group-hover:text-accent transition-colors">{post.title}</h2>
                {post.excerpt && <p className="mt-2 text-sm text-ink-2 line-clamp-2">{post.excerpt}</p>}
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                  {post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
