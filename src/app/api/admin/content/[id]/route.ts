import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isValidPlainText, isValidSafeId, isValidUrlOrPath, toNonNegativeInt } from "@/lib/validation"

function stringOrNull(value: unknown, max = 500) {
  const text = typeof value === "string" ? value.trim().slice(0, max) : ""
  return text || null
}

function metadataOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null
  const text = typeof value === "string" ? value.trim() : JSON.stringify(value)
  return text.slice(0, 10000)
}

function contentPayload(body: Record<string, unknown>) {
  const page = String(body.page ?? "home").trim().slice(0, 80) || "home"
  const section = String(body.section ?? "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
  const title = stringOrNull(body.title, 240)
  const subtitle = stringOrNull(body.subtitle, 500)
  const bodyText = stringOrNull(body.body, 8000)
  const image = stringOrNull(body.image, 500)
  const image2 = stringOrNull(body.image2, 500)
  const link = stringOrNull(body.link, 500)
  const linkText = stringOrNull(body.linkText, 160)
  const metadata = metadataOrNull(body.metadata)

  if (!isValidSafeId(page) || !isValidSafeId(section)) return { error: "Page and section are required." }
  if (title && !isValidPlainText(title, { max: 240 })) return { error: "Enter a valid title." }
  if (subtitle && !isValidPlainText(subtitle, { max: 500 })) return { error: "Enter a valid subtitle." }
  if (bodyText && !isValidPlainText(bodyText, { max: 8000 })) return { error: "Enter valid body content." }
  if (image && !isValidUrlOrPath(image)) return { error: "Enter a valid image URL or path." }
  if (image2 && !isValidUrlOrPath(image2)) return { error: "Enter a valid second image URL or path." }
  if (link && !isValidUrlOrPath(link)) return { error: "Enter a valid link." }
  if (linkText && !isValidPlainText(linkText, { max: 160 })) return { error: "Enter valid link text." }
  if (metadata && metadata.length > 10000) return { error: "Metadata is too large." }

  return {
    data: {
      page,
      section,
      title,
      subtitle,
      body: bodyText,
      image,
      image2,
      link,
      linkText,
      metadata,
      published: body.published === undefined ? true : Boolean(body.published),
      sortOrder: toNonNegativeInt(body.sortOrder),
    },
  }
}

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid content id" }, { status: 400 })
  const parsed = contentPayload(await req.json().catch(() => ({})) as Record<string, unknown>)
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const section = await prisma.siteContent.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ section })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid content id" }, { status: 400 })
  await prisma.siteContent.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
