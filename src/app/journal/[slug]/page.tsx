import { notFound } from "next/navigation"
import Link from "next/link"
import { Reveal } from "@podium/ui/motion"
import { Eyebrow, Placeholder } from "@podium/ui/primitives"
import { prisma } from "@/lib/db"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug } })
    if (post) return { title: `${post.title} — SYRA Journal` }
  } catch {}
  return { title: "Journal — SYRA" }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  let post: { title: string; content: string; coverImage: string | null; author: string; publishedAt: Date | null; tags: string } | null = null
  try {
    post = await prisma.blogPost.findUnique({ where: { slug } })
  } catch {}
  if (!post) notFound()

  return (
    <article className="px-4 py-20 md:px-12 md:py-32 max-w-3xl mx-auto">
      <Reveal>
        <Link href="/journal" className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-accent mb-6 inline-block">
          ← Back to Journal
        </Link>

        {post.coverImage && (
          <div className="aspect-[16/9] overflow-hidden border border-line mb-8">
            <Placeholder image={post.coverImage} className="h-full w-full" alt={post.title} />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {JSON.parse(post.tags).map((tag: string) => (
            <span key={tag} className="font-mono text-[9px] uppercase tracking-widest text-accent border border-accent/30 px-2 py-0.5">{tag}</span>
          ))}
        </div>

        <h1 className="font-display text-4xl md:text-6xl tracking-tight leading-tight mb-6">{post.title}</h1>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-12">
          {post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
        </p>

        <div className="prose prose-invert max-w-none text-ink-2 leading-relaxed text-[15px] whitespace-pre-wrap">
          {post.content}
        </div>
      </Reveal>
    </article>
  )
}
