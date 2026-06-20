import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

const ALLOWED_MAIN = ["Best Sellers", "Earrings", "Necklace", "Bracelets", "Rings", "Pendants"]
const ALLOWED_SUB = ["Boss Babe Basic", "Glam Girl Hours", "Everyday Slay", "Main Character Campus", "Bold Babe Edit"]

const mainHierarchyKeys = ["mainHierarchy", "Main Hierarchy", "Main Product Hierarchy", "Category", "Product Category"]
const subHierarchyKeys = ["subHierarchy", "Sub Hierarchy", "Collection", "Product Collection", "Sub Category"]

function getRowValue(row: Record<string, string>, keys: string[]): string | undefined {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  const rowKeys = Object.keys(row);
  for (const k of keys) {
    const foundKey = rowKeys.find(rk => rk.trim().toLowerCase() === k.toLowerCase());
    if (foundKey !== undefined) return row[foundKey];
  }
  return undefined;
}

function getCanonicalMainHierarchy(val?: string): string | null | undefined {
  if (val === undefined) return undefined;
  const trimmed = val.trim();
  if (trimmed === "") return null;
  const found = ALLOWED_MAIN.find(m => m.toLowerCase() === trimmed.toLowerCase());
  if (found) return found;
  return undefined;
}

function getCanonicalSubHierarchy(val?: string): string | null | undefined {
  if (val === undefined) return undefined;
  const trimmed = val.trim();
  if (trimmed === "") return null;
  const found = ALLOWED_SUB.find(s => s.toLowerCase() === trimmed.toLowerCase());
  if (found) return found;
  return undefined;
}

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
    if (!row) continue
    try {
      if (!row.name || !row.kind || !row.price) {
        errors.push({ row: i + 1, error: "Missing required fields: name, kind, price" })
        continue
      }

      const rawMain = getRowValue(row, mainHierarchyKeys)
      const canonicalMain = getCanonicalMainHierarchy(rawMain)
      if (rawMain !== undefined && rawMain.trim() !== "" && canonicalMain === undefined) {
        errors.push({ row: i + 1, error: `Invalid Main Hierarchy value: '${rawMain}'. Must be one of: ${ALLOWED_MAIN.join(", ")}` })
        continue
      }

      const rawSub = getRowValue(row, subHierarchyKeys)
      const canonicalSub = getCanonicalSubHierarchy(rawSub)
      if (rawSub !== undefined && rawSub.trim() !== "" && canonicalSub === undefined) {
        errors.push({ row: i + 1, error: `Invalid Sub Hierarchy value: '${rawSub}'. Must be one of: ${ALLOWED_SUB.join(", ")}` })
        continue
      }

      const slug = row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      await prisma.product.upsert({
        where: { slug },
        update: {
          name: row.name,
          kind: row.kind,
          subcategory: row.subcategory || null,
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
          mainHierarchy: canonicalMain || null,
          subHierarchy: canonicalSub || null,
        },
        create: {
          slug,
          name: row.name,
          kind: row.kind,
          subcategory: row.subcategory || null,
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
          mainHierarchy: canonicalMain || null,
          subHierarchy: canonicalSub || null,
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

  const csv = "name,slug,kind,price,caption,description,metals,stones,sizes,image,gallery,tag,material,warranty,mainHierarchy,subHierarchy\n" +
    '"Gold Hoop Earrings","gold-hoop-earrings","Earrings","499","Beautiful earrings","Anti-tarnish gold hoop earrings for everyday wear.","18k Gold","None","[]","/uploads/gallery/gold-hoop.jpg","","","Surgical Steel","2 Year Anti-Tarnish Guarantee","Earrings","Everyday Slay"\n' +
    '"Minimal Pendant Necklace","minimal-pendant-necklace","Necklace","699","Beautiful necklace","Elegant anti-tarnish pendant necklace.","18k Gold","None","[]","/uploads/gallery/minimal-pendant.jpg","","","Surgical Steel","2 Year Anti-Tarnish Guarantee","Necklace","Boss Babe Basic"\n'

  return new Response(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=products-template.csv" },
  })
}

/** DELETE deletes products in bulk */
export async function DELETE(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { ids } = await req.json() as { ids: string[] }
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 })
    }
    await prisma.product.deleteMany({
      where: { id: { in: ids } }
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to delete products" }, { status: 500 })
  }
}
