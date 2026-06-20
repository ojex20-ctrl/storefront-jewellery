import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

const ALLOWED_MAIN = ["Best Sellers", "Earrings", "Necklace", "Bracelets", "Rings", "Pendants"]
const ALLOWED_SUB = ["Boss Babe Basic", "Glam Girl Hours", "Everyday Slay", "Main Character Campus", "Bold Babe Edit"]
const ALLOWED_KIND = [
  "Stud", "Hoop", "Huggie", "Drop", "Dangler", "Ear Cuff", "Statement", "Minimal",
  "Chain", "Choker", "Pendant", "Layered", "Charm", "Bracelet", "Kada", "Cuff",
  "Chain Bracelet", "Charm Bracelet", "Adjustable", "Stackable", "Band", "Solitaire", "Cocktail"
]
const ALLOWED_RING_TYPE = [
  "Adjustable", "Stackable", "Band", "Statement Ring", "Minimal Ring", "Solitaire Look", "Cocktail Ring", "Open Ring", "Couple Ring"
]
const ALLOWED_TAGS = [
  "Anti Tarnish", "Waterproof", "Daily Wear", "Office Wear", "Party Wear", "College Wear",
  "Date Night", "Minimal", "Statement", "Trending", "New Arrival", "Gift Pick", "Premium Look",
  "Under 499", "Under 999", "Lightweight", "Skin Friendly", "Gold Finish", "Silver Finish", "Rose Gold Finish"
]

const mainHierarchyKeys = ["mainHierarchy", "Main Hierarchy", "Main Product Hierarchy", "Category", "Product Category"]
const subHierarchyKeys = ["subHierarchy", "Sub Hierarchy", "Collection", "Product Collection", "Sub Category"]
const kindKeys = ["kind", "Kind", "Product Kind", "Product Type", "Design Type"]
const ringTypeKeys = ["ringType", "Ring Type", "Ring", "Ring Style"]
const tagsKeys = ["tags", "Tags", "Tag", "Product Tags"]

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

function getCanonicalValue(val: string, allowed: string[]): string | undefined {
  const trimmed = val.trim();
  if (!trimmed) return undefined;
  return allowed.find(a => a.toLowerCase() === trimmed.toLowerCase());
}

function parseMultiSelectField(
  rawVal: string | undefined,
  allowed: string[],
  fieldName: string,
  rowIdx: number
): { values: string[]; error?: string } {
  if (rawVal === undefined || rawVal === null || rawVal.trim() === "") {
    return { values: [] };
  }
  const parts = rawVal.split(",").map(p => p.trim()).filter(Boolean);
  const values: string[] = [];
  for (const part of parts) {
    const canonical = getCanonicalValue(part, allowed);
    if (!canonical) {
      const bestMatch = allowed.find(a => a.toLowerCase().includes(part.toLowerCase()) || part.toLowerCase().includes(a.toLowerCase()));
      const didYouMean = bestMatch ? `. Did you mean '${bestMatch}'?` : "";
      return {
        values: [],
        error: `Row ${rowIdx}: Invalid ${fieldName} value '${part}'${didYouMean}`
      };
    }
    values.push(canonical);
  }
  return { values };
}

function parseRowImages(row: Record<string, string>, rowIdx: number): { images: string[]; error?: string } {
  const imagesList: string[] = []

  // Check 'images' column
  const rawImages = getRowValue(row, ["images", "Images"])
  if (rawImages) {
    const parsed = rawImages.split(",").map(s => s.trim()).filter(Boolean)
    imagesList.push(...parsed)
  } else {
    // Check old 'image' column
    const rawImage = getRowValue(row, ["image", "Image", "Main Image"])
    if (rawImage && rawImage.trim()) {
      imagesList.push(rawImage.trim())
    }
  }

  // Check image1 to image6
  for (let j = 1; j <= 6; j++) {
    const imgVal = getRowValue(row, [`image${j}`, `Image${j}`])
    if (imgVal && imgVal.trim()) {
      imagesList.push(imgVal.trim())
    }
  }

  const uniqueImages = Array.from(new Set(imagesList))
  if (uniqueImages.length > 6) {
    return {
      images: [],
      error: `Row ${rowIdx}: Maximum 6 images allowed.`
    }
  }

  return { images: uniqueImages }
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
    const rowIdx = i + 1
    try {
      if (!row.name || !row.price) {
        errors.push({ row: rowIdx, error: "Missing required fields: name, price" })
        continue
      }

      // Parse Images
      const imgRes = parseRowImages(row, rowIdx)
      if (imgRes.error) {
        errors.push({ row: rowIdx, error: imgRes.error })
        continue
      }
      const cleanImages = imgRes.images

      // Parse Main Hierarchy
      const rawMain = getRowValue(row, mainHierarchyKeys)
      const mainRes = parseMultiSelectField(rawMain, ALLOWED_MAIN, "Main Hierarchy", rowIdx)
      if (mainRes.error) {
        errors.push({ row: rowIdx, error: mainRes.error })
        continue
      }
      const cleanMain = mainRes.values

      // Parse Sub Hierarchy
      const rawSub = getRowValue(row, subHierarchyKeys)
      const subRes = parseMultiSelectField(rawSub, ALLOWED_SUB, "Sub Hierarchy", rowIdx)
      if (subRes.error) {
        errors.push({ row: rowIdx, error: subRes.error })
        continue
      }
      const cleanSub = subRes.values

      // Parse Kind
      const rawKind = getRowValue(row, kindKeys)
      if (!rawKind || !rawKind.trim()) {
        errors.push({ row: rowIdx, error: "Missing required field: Kind" })
        continue
      }
      const kindRes = parseMultiSelectField(rawKind, ALLOWED_KIND, "Kind", rowIdx)
      if (kindRes.error) {
        errors.push({ row: rowIdx, error: kindRes.error })
        continue
      }
      const cleanKinds = kindRes.values
      if (cleanKinds.length === 0) {
        errors.push({ row: rowIdx, error: "At least one valid Kind must be specified" })
        continue
      }

      // Parse Ring Type
      const rawRingType = getRowValue(row, ringTypeKeys)
      const ringTypeRes = parseMultiSelectField(rawRingType, ALLOWED_RING_TYPE, "Ring Type", rowIdx)
      if (ringTypeRes.error) {
        errors.push({ row: rowIdx, error: ringTypeRes.error })
        continue
      }
      const cleanRingTypes = ringTypeRes.values

      // Parse Tags
      const rawTags = getRowValue(row, tagsKeys)
      const tagsRes = parseMultiSelectField(rawTags, ALLOWED_TAGS, "Tags", rowIdx)
      if (tagsRes.error) {
        errors.push({ row: rowIdx, error: tagsRes.error })
        continue
      }
      const cleanTags = tagsRes.values

      const slug = row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      await prisma.product.upsert({
        where: { slug },
        update: {
          name: row.name,
          price: parseInt(row.price),
          caption: row.caption || "",
          description: row.description || "",
          metals: row.metals ? JSON.stringify(row.metals.split(";").map((s: string) => s.trim())) : '["18k Gold"]',
          stones: row.stones ? JSON.stringify(row.stones.split(";").map((s: string) => s.trim())) : '["None"]',
          sizes: row.sizes ? JSON.stringify(row.sizes.split(";").map((s: string) => s.trim())) : '[]',
          material: row.material || null,
          warranty: row.warranty || "2 Year Anti-Tarnish Guarantee",
          
          // Legacy fields compatibility:
          image: cleanImages[0] || "",
          gallery: JSON.stringify(cleanImages),
          kind: cleanKinds[0] || "Ring",
          tag: cleanTags[0] || null,
          mainHierarchy: cleanMain[0] || null,
          subHierarchy: cleanSub[0] || null,

          // New multi-select fields:
          images: JSON.stringify(cleanImages),
          kinds: JSON.stringify(cleanKinds),
          mainHierarchies: JSON.stringify(cleanMain),
          subHierarchies: JSON.stringify(cleanSub),
          ringType: JSON.stringify(cleanRingTypes),
          tags: JSON.stringify(cleanTags),
        },
        create: {
          slug,
          name: row.name,
          price: parseInt(row.price),
          caption: row.caption || "",
          description: row.description || "",
          metals: row.metals ? JSON.stringify(row.metals.split(";").map((s: string) => s.trim())) : '["18k Gold"]',
          stones: row.stones ? JSON.stringify(row.stones.split(";").map((s: string) => s.trim())) : '["None"]',
          sizes: row.sizes ? JSON.stringify(row.sizes.split(";").map((s: string) => s.trim())) : '[]',
          material: row.material || null,
          warranty: row.warranty || "2 Year Anti-Tarnish Guarantee",
          
          // Legacy fields compatibility:
          image: cleanImages[0] || "",
          gallery: JSON.stringify(cleanImages),
          kind: cleanKinds[0] || "Ring",
          tag: cleanTags[0] || null,
          mainHierarchy: cleanMain[0] || null,
          subHierarchy: cleanSub[0] || null,

          // New multi-select fields:
          images: JSON.stringify(cleanImages),
          kinds: JSON.stringify(cleanKinds),
          mainHierarchies: JSON.stringify(cleanMain),
          subHierarchies: JSON.stringify(cleanSub),
          ringType: JSON.stringify(cleanRingTypes),
          tags: JSON.stringify(cleanTags),
          published: true,
        },
      })
      imported++
    } catch (e) {
      errors.push({ row: rowIdx, error: e instanceof Error ? e.message : "Unknown error" })
    }
  }

  return NextResponse.json({ imported, errors, total: products.length })
}

/** GET returns a CSV template */
export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const csv = "name,slug,kind,price,caption,description,metals,stones,sizes,images,mainHierarchy,subHierarchy,ringType,tags,material,warranty\n" +
    '"Gold Hoop Earrings","gold-hoop-earrings","Earrings, Hoop, Minimal","499","Beautiful earrings","Anti-tarnish gold hoop earrings.","18k Gold","None","[]","/uploads/gallery/gold-hoop.jpg,/uploads/gallery/gold-hoop-2.jpg","Earrings, Best Sellers","Everyday Slay, Main Character Campus","","Anti Tarnish, Daily Wear, Gold Finish, Under 499","Surgical Steel","2 Year Anti-Tarnish Guarantee"\n' +
    '"Adjustable Gold Ring","adjustable-gold-ring","Ring, Adjustable, Minimal","399","Beautiful ring","Adjustable anti-tarnish ring.","18k Gold","None","[]","/uploads/gallery/ring-1.jpg,/uploads/gallery/ring-2.jpg","Rings, Best Sellers","Boss Babe Basic, Everyday Slay","Adjustable, Stackable","Anti Tarnish, Daily Wear, Gold Finish, Trending","Surgical Steel","2 Year Anti-Tarnish Guarantee"\n'

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
