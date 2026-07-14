import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isValidDateLike, isValidPlainText, isValidSafeId, isValidSlug, isValidUrlOrPath, normalizeSlug } from "@/lib/validation"

function tagsValue(value: unknown) {
  const tags = Array.isArray(value) ? value : (typeof value === "string" ? value.split(",") : [])
  return tags.map((tag) => String(tag).trim().slice(0, 60)).filter(Boolean).slice(0, 20)
}

function blogPayload(body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim().slice(0, 200)
  const slug = normalizeSlug(body.slug || title)
  const excerpt = body.excerpt ? String(body.excerpt).trim().slice(0, 500) : null
  const content = String(body.content ?? "").trim().slice(0, 20000)
  const coverImage = body.coverImage ? String(body.coverImage).trim().slice(0, 500) : null
  const author = String(body.author ?? "SYRA").trim().slice(0, 120) || "SYRA"
  const tags = tagsValue(body.tags)
  const publishedAt = body.publishedAt ? new Date(String(body.publishedAt)) : null

  if (!isValidPlainText(title, { required: true, max: 200 })) return { error: "Blog title is required." }
  if (!isValidSlug(slug)) return { error: "Enter a valid blog slug." }
  if (excerpt && !isValidPlainText(excerpt, { max: 500 })) return { error: "Enter a valid excerpt." }
  if (content && !isValidPlainText(content, { max: 20000 })) return { error: "Enter valid blog content." }
  if (coverImage && !isValidUrlOrPath(coverImage)) return { error: "Enter a valid cover image URL or path." }
  if (!isValidPlainText(author, { required: true, max: 120 })) return { error: "Enter a valid author." }
  if (!isValidDateLike(body.publishedAt)) return { error: "Enter a valid publish date." }

  return {
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      tags: JSON.stringify(tags),
      published: Boolean(body.published),
      publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
    },
  }
}

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ posts })
}

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const parsed = blogPayload(await req.json().catch(() => ({})) as Record<string, unknown>)
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const post = await prisma.blogPost.create({ data: parsed.data })
  return NextResponse.json({ post }, { status: 201 })
}
