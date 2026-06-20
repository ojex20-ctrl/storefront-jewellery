"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Upload, Download, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { Sidebar } from "@/components/admin/sidebar"

type ParsedRow = Record<string, string>
type Result = { imported: number; errors: { row: number; error: string }[]; total: number } | null

export function BulkUploadClient() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([])
  const [uploadingAssets, setUploadingAssets] = useState(false)

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim())
    if (lines.length < 2) return
    const firstLine = lines[0]
    if (!firstLine) return
    const hdrs = firstLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
    setHeaders(hdrs)
    const parsed: ParsedRow[] = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line) continue
      const values = line.match(/(".*?"|[^,]+)/g)?.map((v) => v.trim().replace(/^"|"$/g, "")) ?? []
      const row: ParsedRow = {}
      hdrs.forEach((h, idx) => { row[h] = values[idx] ?? "" })
      parsed.push(row)
    }
    setRows(parsed)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => parseCSV(ev.target?.result as string)
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    setUploading(true)
    const res = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ products: rows }),
    })
    const data = await res.json()
    setResult(data)
    setUploading(false)
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#1A1A1C]/50 hover:text-[#1A1A1C] mb-6">
          <ArrowLeft size={14} /> Back to products
        </Link>
        <h1 className="font-display text-4xl tracking-tight mb-8">Bulk Upload Products</h1>

        {/* Step 1: Download template */}
        <div className="border border-[#1A1A1C]/10 bg-white p-6 mb-6">
          <h3 className="text-xs uppercase tracking-widest text-[#1A1A1C]/50 mb-3">Step 1: Download Template</h3>
          <div className="text-sm text-[#1A1A1C]/60 mb-4 space-y-2">
            <p>Download the CSV template, fill in your products, then upload below.</p>
            <div className="text-xs border-l-2 border-[#c9a36b] pl-3 py-1.5 space-y-1 bg-[#F5F3EF]/30">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#1A1A1C]/75">Bulk Upload Options:</span>
              <p>• <strong>Images (Max 6)</strong>: Use column <code>images</code> (comma-separated links) or separate columns <code>image1</code> to <code>image6</code>.</p>
              <p>• <strong>Main Hierarchy (Multi-Select)</strong>: Column <code>mainHierarchy</code> (or Category). Allowed values: <code>Best Sellers</code>, <code>Earrings</code>, <code>Necklace</code>, <code>Bracelets</code>, <code>Rings</code>, <code>Pendants</code>.</p>
              <p>• <strong>Sub Hierarchy (Multi-Select)</strong>: Column <code>subHierarchy</code> (or Collection). Allowed: <code>Boss Babe Basic</code>, <code>Glam Girl Hours</code>, <code>Everyday Slay</code>, <code>Main Character Campus</code>, <code>Bold Babe Edit</code>.</p>
              <p>• <strong>Kind (Multi-Select)</strong>: Column <code>kind</code>. Allowed options include: <code>Stud</code>, <code>Hoop</code>, <code>Pendant</code>, <code>Chain</code>, <code>Bracelet</code>, <code>Minimal</code>, <code>Statement</code>, etc.</p>
              <p>• <strong>Ring Type (Multi-Select)</strong>: Column <code>ringType</code>. Allowed options: <code>Adjustable</code>, <code>Stackable</code>, <code>Band</code>, <code>Statement Ring</code>, <code>Minimal Ring</code>, <code>Solitaire Look</code>, <code>Cocktail Ring</code>, <code>Open Ring</code>, <code>Couple Ring</code>.</p>
              <p>• <strong>Tags (Multi-Select)</strong>: Column <code>tags</code>. E.g. <code>Anti Tarnish, Waterproof, Daily Wear</code>.</p>
            </div>
          </div>
          <a href="/api/admin/products/bulk" className="inline-flex items-center gap-2 border border-[#1A1A1C]/20 px-4 py-2 text-xs uppercase tracking-widest hover:border-[#c9a36b]">
            <Download size={14} /> Download Template
          </a>
        </div>

        {/* Optional: Inline Image Upload helper */}
        <div className="border border-[#1A1A1C]/10 bg-white p-6 mb-6">
          <h3 className="text-xs uppercase tracking-widest text-[#1A1A1C]/50 mb-3">Optional: Upload Images to get URLs</h3>
          <p className="text-xs text-[#1A1A1C]/60 mb-4">Upload product images here, then copy their URLs to paste into your CSV template columns.</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              const files = e.target.files
              if (!files || files.length === 0) return
              setUploadingAssets(true)
              const newUrls: string[] = []
              for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const formData = new FormData()
                formData.append("file", file)
                try {
                  const res = await fetch("/api/admin/media", {
                    method: "POST",
                    body: formData,
                  })
                  const data = await res.json()
                  if (data.url) {
                    newUrls.push(data.url)
                  } else {
                    alert(`Upload failed for ${file.name}: ${data.error || "unknown error"}`)
                  }
                } catch {
                  alert(`Network error uploading ${file.name}`)
                }
              }
              setUploadedAssets((prev) => [...newUrls, ...prev])
              setUploadingAssets(false)
            }}
            className="text-xs text-[#1A1A1C]/60 file:mr-4 file:py-2 file:px-4 file:border file:border-[#1A1A1C]/15 file:text-xs file:font-semibold file:bg-transparent file:text-[#1A1A1C]/80 file:cursor-pointer hover:file:bg-[#F5F3EF]"
          />
          {uploadingAssets && <p className="text-xs text-[#c9a36b] mt-2">Uploading assets...</p>}
          {uploadedAssets.length > 0 && (
            <div className="mt-4 border-t border-[#1A1A1C]/5 pt-4">
              <h4 className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/40 mb-2">Recent Uploads (Click to copy URL)</h4>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {uploadedAssets.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border border-[#1A1A1C]/5 text-xs bg-[#F5F3EF]/30">
                    <span className="truncate max-w-[200px] font-mono">{url}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(url)
                        alert("URL copied to clipboard: " + url)
                      }}
                      className="text-[#c9a36b] hover:underline uppercase tracking-widest text-[9px] font-bold"
                    >
                      Copy URL
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Upload CSV */}
        <div className="border border-[#1A1A1C]/10 bg-white p-6 mb-6">
          <h3 className="text-xs uppercase tracking-widest text-[#1A1A1C]/50 mb-3">Step 2: Upload CSV</h3>
          <input ref={fileRef} type="file" accept=".csv" onChange={onFileChange} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-3 border-2 border-dashed border-[#1A1A1C]/15 p-8 w-full text-center hover:border-[#c9a36b] transition-colors"
          >
            <Upload size={20} className="mx-auto text-[#1A1A1C]/30" />
            <span className="text-sm text-[#1A1A1C]/50">Click to select CSV file</span>
          </button>
        </div>

        {/* Step 3: Preview */}
        {rows.length > 0 && !result && (
          <div className="border border-[#1A1A1C]/10 bg-white p-6 mb-6">
            <h3 className="text-xs uppercase tracking-widest text-[#1A1A1C]/50 mb-3">Step 3: Preview ({rows.length} products)</h3>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#F5F3EF]">
                  <tr>{headers.slice(0, 6).map((h) => <th key={h} className="px-3 py-2 text-left uppercase tracking-widest text-[#1A1A1C]/40">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-t border-[#1A1A1C]/5">
                      {headers.slice(0, 6).map((h) => <td key={h} className="px-3 py-2 max-w-[150px] truncate">{r[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 10 && <p className="text-xs text-[#1A1A1C]/40 mt-2">...and {rows.length - 10} more rows</p>}
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#c9a36b] disabled:opacity-50"
            >
              <Upload size={14} /> {uploading ? "Importing…" : `Import ${rows.length} Products`}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="border border-[#1A1A1C]/10 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle size={20} className="text-green-600" />
              <h3 className="font-display text-xl">Import Complete</h3>
            </div>
            <p className="text-sm mb-2">✓ {result.imported} products imported successfully</p>
            {result.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-red-600 flex items-center gap-2"><AlertCircle size={14} /> {result.errors.length} rows had errors:</p>
                <ul className="mt-2 text-xs text-red-500 space-y-1">
                  {result.errors.map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
                </ul>
              </div>
            )}
            <Link href="/admin/products" className="mt-6 inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-5 py-2 text-xs uppercase tracking-widest hover:bg-[#c9a36b]">
              View Products →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
