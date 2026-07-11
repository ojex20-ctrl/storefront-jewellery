import { NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/admin-auth"
import fs from "fs"
import path from "path"

/**
 * Media/product-image storage root.
 *
 * In production this is set to a folder OUTSIDE the code tree (e.g.
 * MEDIA_ROOT=/var/www/syra-media) so replacing/redeploying the code never
 * deletes uploaded product images. Falls back to public/uploads for local dev.
 *
 * Files are served at the `/uploads/` URL prefix — by nginx (prod, aliased to
 * MEDIA_ROOT) or Next's static handler (dev, only the fallback path is served).
 * Product images are organized under `products/<slug>/…`; everything else
 * lands in the root or `other/…`.
 */
const MEDIA_ROOT = process.env.MEDIA_ROOT || path.join(process.cwd(), "public", "uploads")

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

/** Sanitize a folder/relative path so it can never escape MEDIA_ROOT. */
function safeRel(rel: string): string {
  return rel
    .replace(/^\/uploads\//, "")
    .replace(/\\/g, "/")
    .split("/")
    .map((s) => s.trim())
    .filter((s) => s && s !== "." && s !== "..")
    .map((s) => s.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, ""))
    .filter(Boolean)
    .join("/")
}

type MediaFile = { name: string; url: string; size: number; createdAt: Date }

/** Recursively list every file under MEDIA_ROOT with its `/uploads/…` URL. */
function walk(dir: string, rel = ""): MediaFile[] {
  const out: MediaFile[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const childRel = rel ? `${rel}/${entry.name}` : entry.name
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walk(abs, childRel))
    } else {
      const stats = fs.statSync(abs)
      out.push({ name: childRel, url: `/uploads/${childRel}`, size: stats.size, createdAt: stats.birthtime || stats.mtime })
    }
  }
  return out
}

/** GET lists all uploaded files (recursively across subfolders). */
export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    ensureDir(MEDIA_ROOT)
    const files = walk(MEDIA_ROOT).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return NextResponse.json({ files })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to read media directory" }, { status: 500 })
  }
}

/** POST uploads a file. Optional `folder` (e.g. "products/<slug>") targets a subfolder. */
export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const folder = safeRel(String(formData.get("folder") ?? ""))
    const destDir = folder ? path.join(MEDIA_ROOT, folder) : MEDIA_ROOT
    ensureDir(destDir)

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = path.extname(file.name)
    const base = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const filename = `${base}-${uniqueSuffix}${ext}`
    fs.writeFileSync(path.join(destDir, filename), buffer)

    const urlRel = folder ? `${folder}/${filename}` : filename
    return NextResponse.json({ success: true, url: `/uploads/${urlRel}`, name: urlRel })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 })
  }
}

/** DELETE removes a file. `name` may be a bare name, "folder/file", or a "/uploads/…" URL. */
export async function DELETE(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name } = (await req.json()) as { name: string }
    if (!name) return NextResponse.json({ error: "Filename required" }, { status: 400 })

    const rel = safeRel(name)
    const resolved = path.resolve(MEDIA_ROOT, rel)
    if (!resolved.startsWith(path.resolve(MEDIA_ROOT) + path.sep)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      fs.unlinkSync(resolved)
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Delete failed" }, { status: 500 })
  }
}
