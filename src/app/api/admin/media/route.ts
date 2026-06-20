import { NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/admin-auth"
import fs from "fs"
import path from "path"

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

// Ensure uploads directory exists
function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
}

/** GET lists all uploaded files */
export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    ensureUploadsDir()
    const files = fs.readdirSync(UPLOADS_DIR)
    
    const mediaFiles = files
      .map(file => {
        const filePath = path.join(UPLOADS_DIR, file)
        const stats = fs.statSync(filePath)
        
        // Skip directories
        if (stats.isDirectory()) return null

        return {
          name: file,
          url: `/uploads/${file}`,
          size: stats.size,
          createdAt: stats.birthtime || stats.mtime
        }
      })
      .filter(Boolean)
      .sort((a, b) => b!.createdAt.getTime() - a!.createdAt.getTime()) // Sort newest first

    return NextResponse.json({ files: mediaFiles })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to read media directory" }, { status: 500 })
  }
}

/** POST uploads a file */
export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    ensureUploadsDir()
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Generate clean filename
    const originalName = file.name
    const ext = path.extname(originalName)
    const nameWithoutExt = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
    
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const filename = `${nameWithoutExt}-${uniqueSuffix}${ext}`
    
    const filePath = path.join(UPLOADS_DIR, filename)
    fs.writeFileSync(filePath, buffer)
    
    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}`,
      name: filename
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 })
  }
}

/** DELETE deletes a file from the uploads directory */
export async function DELETE(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name } = await req.json() as { name: string }
    if (!name) {
      return NextResponse.json({ error: "Filename required" }, { status: 400 })
    }

    // Basic path traversal protection
    const safeName = path.basename(name)
    const filePath = path.join(UPLOADS_DIR, safeName)
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Delete failed" }, { status: 500 })
  }
}
