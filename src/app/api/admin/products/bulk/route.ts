import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { products } = await req.json() as { products: Record<string, string>[] }
  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: "No products provided" }, { status: 400 })
  }

  let imported = 0
  const errors: { row: number; error: string }[] = []

  for (let i = 0; i < products.length; i++) {
    const row = products[i]
    try {
      if (!row.name || !row.kind || !row.price) {
        errors.push({ row: i + 1, error: "Missing required fields: name, kind, price" })
        continue
      }
      const slug = row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      await prisma.product.upsert({
        where: { slug },
        update: {
          name: row.name,
          kind: row.kind,
          price: parseInt(row.price),
          caption: row.caption || "",
          description: row.description || "",
          metals: row.metals ? JSON.stringify(row.metals.split(";").map((s: string) => s.trim())) : '["18k Gold"]',
          stones: row.stones ? JSON.stringify(row.stones.split(";").map((s: string) => s.trim())) : '["None"]',
          sizes: row.sizes ? JSON.stringify(row.sizes.split(";").map((s: string) => s.trim())) : '[]',
          image: row.image || "",
          tag: row.tag || null,
          material: row.material || null,
          warranty: row.warranty || "2 Year Anti-Tarnish Guarantee",
        },
        create: {
          slug,
          name: row.name,
          kind: row.kind,
          price: parseInt(row.price),
          caption: row.caption || "",
          description: row.description || "",
          metals: row.metals ? JSON.stringify(row.metals.split(";").map((s: string) => s.trim())) : '["18k Gold"]',
          stones: row.stones ? JSON.stringify(row.stones.split(";").map((s: string) => s.trim())) : '["None"]',
          sizes: row.sizes ? JSON.stringify(row.sizes.split(";").map((s: string) => s.trim())) : '[]',
          image: row.image || "",
          gallery: row.gallery ? JSON.stringify(row.gallery.split(";").map((s: string) => s.trim())) : '[]',
          tag: row.tag || null,
          material: row.material || null,
          warranty: row.warranty || "2 Year Anti-Tarnish Guarantee",
          published: true,
        },
      })
      imported++
    } catch (e) {
      errors.push({ row: i + 1, error: e instanceof Error ? e.message : "Unknown error" })
    }
  }

  return NextResponse.json({ imported, errors, total: products.length })
}

/** GET returns a CSV template */
export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const csv = "name,slug,kind,price,caption,description,metals,stones,sizes,image,gallery,tag,material,warranty\n" +
    '"Example Ring","example-ring","Ring","12000","Beautiful ring","Full description here","18k Gold;White Gold","Diamond","6;7;8","https://example.com/img.jpg","https://example.com/img1.jpg;https://example.com/img2.jpg","NEW","Surgical Steel + 18k Gold PVD","2 Year Anti-Tarnish Guarantee"\n'

  return new Response(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=products-template.csv" },
  })
}
