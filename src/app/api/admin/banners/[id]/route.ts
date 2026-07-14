import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isValidDateLike, isValidPlainText, isValidSafeId, isValidUrlOrPath, toNonNegativeInt } from "@/lib/validation"

type Ctx = { params: Promise<{ id: string }> }

function dateOrNull(value: unknown) {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

function bannerPayload(body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim().slice(0, 160)
  const subtitle = body.subtitle ? String(body.subtitle).trim().slice(0, 240) : null
  const image = String(body.image ?? "").trim().slice(0, 500)
  const mobileImage = body.mobileImage ? String(body.mobileImage).trim().slice(0, 500) : null
  const link = body.link ? String(body.link).trim().slice(0, 500) : null
  const position = String(body.position ?? "hero").trim().slice(0, 60) || "hero"
  const page = String(body.page ?? "home").trim().slice(0, 60) || "home"
  const published = Boolean(body.published)

  if (!isValidPlainText(title, { required: true, max: 160 })) return { error: "Banner title is required." }
  if (subtitle && !isValidPlainText(subtitle, { max: 240 })) return { error: "Enter a valid subtitle." }
  if (published && !image) return { error: "Published banners require an image." }
  if (image && !isValidUrlOrPath(image)) return { error: "Enter a valid banner image URL or path." }
  if (mobileImage && !isValidUrlOrPath(mobileImage)) return { error: "Enter a valid mobile image URL or path." }
  if (link && !isValidUrlOrPath(link)) return { error: "Enter a valid banner link." }
  if (!isValidPlainText(position, { required: true, max: 60 }) || !isValidPlainText(page, { required: true, max: 60 })) return { error: "Enter a valid banner page and position." }
  if (!isValidDateLike(body.startDate) || !isValidDateLike(body.endDate)) return { error: "Enter valid banner dates." }

  return {
    data: {
      title,
      subtitle,
      image,
      mobileImage,
      link,
      position,
      page,
      published,
      sortOrder: toNonNegativeInt(body.sortOrder),
      startDate: dateOrNull(body.startDate),
      endDate: dateOrNull(body.endDate),
    },
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid banner id" }, { status: 400 })
  const parsed = bannerPayload(await req.json().catch(() => ({})) as Record<string, unknown>)
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const banner = await prisma.banner.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ banner })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid banner id" }, { status: 400 })
  await prisma.banner.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
