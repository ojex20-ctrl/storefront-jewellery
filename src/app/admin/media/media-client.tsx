"use client"
import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { Upload, Trash2, Clipboard, Search, Check } from "lucide-react"

type MediaFile = {
  name: string
  url: string
  size: number
  createdAt: string
}

export function MediaClient({ user }: { user: { name: string } }) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch files on load
  const fetchFiles = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/media")
      const data = await res.json()
      if (data.files) {
        setFiles(data.files)
      }
    } catch (e) {
      console.error("Failed to load media files:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // Handle file uploads
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (!data.success) {
          alert(`Failed to upload ${file.name}: ${data.error || "Unknown error"}`)
        }
      } catch (err) {
        alert(`Network error uploading ${file.name}`)
      }
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
    fetchFiles()
  }

  // Handle delete
  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (data.success) {
        setFiles(prev => prev.filter(f => f.name !== name))
      } else {
        alert(data.error || "Failed to delete file")
      }
    } catch {
      alert("Network error deleting file")
    }
  }

  // Copy URL to clipboard helper
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => {
      setCopiedUrl(null)
    }, 2000)
  }

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Filtered files
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={user.name} />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-4xl tracking-tight">Media Library</h1>
            <p className="text-sm text-[#1A1A1C]/50 mt-1">Upload and manage media files for your products.</p>
          </div>

          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-[#c9a36b] transition-colors disabled:opacity-50"
            >
              <Upload size={14} /> {uploading ? "Uploading..." : "Upload Images"}
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#1A1A1C]/15 bg-white p-8 mb-8 text-center cursor-pointer hover:border-[#c9a36b] transition-colors group"
        >
          <Upload size={24} className="mx-auto text-[#1A1A1C]/30 group-hover:text-[#c9a36b] transition-colors mb-2" />
          <span className="text-sm text-[#1A1A1C]/60 block font-medium">Drag & drop files or click to select</span>
          <span className="text-xs text-[#1A1A1C]/40 block mt-1">Supports PNG, JPG, WEBP, GIF</span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-[#1A1A1C]/10 px-3 py-2.5 mb-6 max-w-md">
          <Search size={16} className="text-[#1A1A1C]/40" />
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="text-sm outline-none bg-transparent w-full"
          />
        </div>

        {loading ? (
          <p className="text-sm text-[#1A1A1C]/50">Loading media files...</p>
        ) : filteredFiles.length === 0 ? (
          <div className="border border-[#1A1A1C]/10 bg-white p-12 text-center">
            <p className="text-sm text-[#1A1A1C]/50">
              {searchQuery ? "No files match your search criteria." : "No files uploaded yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredFiles.map((file) => (
              <div 
                key={file.name} 
                className="group border border-[#1A1A1C]/10 bg-white flex flex-col overflow-hidden hover:border-[#c9a36b] transition-colors"
              >
                {/* Image Preview */}
                <div 
                  className="aspect-[3/4] w-full bg-cover bg-center bg-[#F5F3EF]"
                  style={{ backgroundImage: `url(${file.url})` }}
                />

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div className="mb-3">
                    <p className="text-xs font-semibold truncate text-[#1A1A1C]" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-[#1A1A1C]/50 mt-1">
                      <span>{formatSize(file.size)}</span>
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyUrl(file.url)}
                      className="flex-1 inline-flex items-center justify-center gap-1 border border-[#1A1A1C]/15 py-1.5 text-[9px] uppercase tracking-widest hover:border-[#c9a36b] hover:text-[#c9a36b] transition-colors font-bold"
                    >
                      {copiedUrl === file.url ? (
                        <>
                          <Check size={10} className="text-green-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Clipboard size={10} /> Copy URL
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="inline-flex items-center justify-center border border-red-200 p-1.5 text-red-500 hover:bg-red-50 hover:border-red-500 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
