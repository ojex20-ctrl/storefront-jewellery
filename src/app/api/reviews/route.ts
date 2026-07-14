import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCustomerSession, type CustomerSession } from "@/lib/customer-auth"
import { validRequestOrigin } from "@/lib/rate-limit"
import { isValidPlainText, isValidSlug, normalizeSlug } from "@/lib/validation"

type ReviewEligibilityStatus = "guest" | "not_purchased" | "already_reviewed" | "purchased"
type ReviewEligibility = {
  session: CustomerSession | null
  canReview: boolean
  status: ReviewEligibilityStatus
  message: string
  name?: string
}

function parseOrderItems(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function hasPurchasedProduct(session: CustomerSession, productId: string) {
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "paid",
      OR: [{ customerId: session.id }, { email: session.email }],
    },
    select: { id: true, items: true },
    take: 100,
  })

  return orders.some((order) => {
    return parseOrderItems(order.items).some((item) => {
      return typeof item === "object" && item !== null && "productId" in item && item.productId === productId
    })
  })
}

function displayName(session: CustomerSession) {
  const name = `${session.firstName ?? ""} ${session.lastName ?? ""}`.trim()
  if (name) return name.slice(0, 60)
  return (session.email.split("@")[0] ?? "").replace(/[._-]+/g, " ").trim().slice(0, 60) || "Verified buyer"
}

async function reviewEligibility(productId: string): Promise<ReviewEligibility> {
  const session = await verifyCustomerSession().catch(() => null)
  if (!session) {
    return {
      session: null,
      canReview: false,
      status: "guest" as ReviewEligibilityStatus,
      message: "Sign in with the account used for purchase to write a review.",
    }
  }

  const existing = await prisma.review.findFirst({
    where: { productId, customerId: session.id },
    select: { id: true },
  })
  if (existing) {
    return {
      session,
      canReview: false,
      status: "already_reviewed" as ReviewEligibilityStatus,
      message: "You already submitted a review for this product.",
      name: displayName(session),
    }
  }

  const purchased = await hasPurchasedProduct(session, productId)
  if (!purchased) {
    return {
      session,
      canReview: false,
      status: "not_purchased" as ReviewEligibilityStatus,
      message: "Only customers who purchased this product can write a review.",
      name: displayName(session),
    }
  }

  return {
    session,
    canReview: true,
    status: "purchased" as ReviewEligibilityStatus,
    message: "Verified buyer review available.",
    name: displayName(session),
  }
}

/** GET /api/reviews?productId=<slug> — approved reviews + aggregate. */
export async function GET(req: Request) {
  const productId = normalizeSlug(new URL(req.url).searchParams.get("productId"))
  if (!isValidSlug(productId)) return NextResponse.json({ error: "productId required" }, { status: 400 })

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
  const eligibility = await reviewEligibility(productId)

  return NextResponse.json({
    average,
    count,
    distribution,
    eligibility: {
      canReview: eligibility.canReview,
      status: eligibility.status,
      message: eligibility.message,
      name: eligibility.name,
    },
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

/** POST /api/reviews — submit a verified-buyer review. */
export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const productId = normalizeSlug(body.productId)
  const rating = Math.round(Number(body.rating))
  const title = body.title ? String(body.title).trim().slice(0, 120) : null
  const text = String(body.body ?? "").trim().slice(0, 2000)

  if (!isValidSlug(productId) || !(rating >= 1 && rating <= 5) || !isValidPlainText(text, { required: true, min: 5, max: 2000 })) {
    return NextResponse.json({ error: "Rating (1-5) and a review are required." }, { status: 400 })
  }
  if (title && !isValidPlainText(title, { max: 120 })) return NextResponse.json({ error: "Enter a valid review title." }, { status: 400 })

  // Confirm the product exists by slug to avoid orphan reviews.
  const product = await prisma.product.findUnique({ where: { slug: productId }, select: { id: true } })
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  const eligibility = await reviewEligibility(productId)
  const session = eligibility.session
  if (!session) {
    return NextResponse.json({ error: eligibility.message }, { status: 401 })
  }
  if (eligibility.status === "already_reviewed") {
    return NextResponse.json({ error: eligibility.message }, { status: 409 })
  }
  if (!eligibility.canReview) {
    return NextResponse.json({ error: eligibility.message }, { status: 403 })
  }

  const review = await prisma.review.create({
    data: {
      productId,
      customerId: session.id,
      name: eligibility.name ?? displayName(session),
      rating,
      title,
      body: text,
      verified: true,
    },
  })

  return NextResponse.json(
    { review: { id: review.id, name: review.name, rating: review.rating, title: review.title, body: review.body, verified: review.verified, createdAt: review.createdAt } },
    { status: 201 },
  )
}
