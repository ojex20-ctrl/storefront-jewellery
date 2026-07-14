import { NextRequest, NextResponse } from "next/server"
import { fetchCampaign } from "@/lib/campaigns"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim()
  if (!slug) return NextResponse.json({ exists: false }, { status: 404 })

  const campaign = await fetchCampaign(slug)
  if (!campaign) return NextResponse.json({ exists: false }, { status: 404 })

  return NextResponse.json({ exists: true }, { status: 200 })
}
