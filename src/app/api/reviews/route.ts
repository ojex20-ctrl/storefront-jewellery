import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCustomerSession } from "@/lib/customer-auth"

/** GET /api/reviews?productId=<slug> — approved reviews + aggregate. */
export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("productId")
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })

  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const count = reviews.length
  const sum = reviews.reduce((s, r) => s + r.rating, 0)
  const average = count ? Math.round((sum / count) * 10) / 10 : 0
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return NextResponse.json({
    average,
    count,
    distribution,
    reviews: reviews.map((r) => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      title: r.title,
      body: r.body,
      verified: r.verified,
      createdAt: r.createdAt,
    })),
  })
}

/** POST /api/reviews — submit a review. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const productId = String(body.productId ?? "").trim()
  const name = String(body.name ?? "").trim().slice(0, 60)
  const rating = Math.round(Number(body.rating))
  const title = body.title ? String(body.title).trim().slice(0, 120) : null
  const text = String(body.body ?? "").trim().slice(0, 2000)

  if (!productId || !name || !(rating >= 1 && rating <= 5) || !text) {
    return NextResponse.json({ error: "Name, rating (1–5), and a review are required." }, { status: 400 })
  }

  // Confirm the product exists (by slug) to avoid orphan reviews.
  const product = await prisma.product.findUnique({ where: { slug: productId }, select: { id: true } })
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  // Mark as a verified purchase when a logged-in customer has bought this item.
  let customerId: string | null = null
  let verified = false
  const session = await verifyCustomerSession().catch(() => null)
  if (session) {
    customerId = session.id
    const purchased = await prisma.order
      .findFirst({
        where: {
          paymentStatus: "paid",
          items: { contains: `"productId":"${productId}"` },
          OR: [{ customerId: session.id }, { email: session.email }],
        },
        select: { id: true },
      })
      .catch(() => null)
    verified = Boolean(purchased)
  }

  const review = await prisma.review.create({
    data: { productId, customerId, name, rating, title, body: text, verified },
  })

  return NextResponse.json(
    { review: { id: review.id, name: review.name, rating: review.rating, title: review.title, body: review.body, verified: review.verified, createdAt: review.createdAt } },
    { status: 201 },
  )
}
