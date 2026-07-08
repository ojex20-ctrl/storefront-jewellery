"use client"
import { MessageCircle } from "lucide-react"

export function WhatsAppButton({
  phone,
  message = "Hi, I need help with my order",
  enabled = true,
}: {
  phone?: string | null
  message?: string
  enabled?: boolean
}) {
  const cleanPhone = phone?.replace(/[^\d]/g, "")
  if (!enabled || !cleanPhone) return null
  const msg = encodeURIComponent(message)
  return (
    <a
      href={`https://wa.me/${cleanPhone}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with SYRA support on WhatsApp"
      className="fixed bottom-24 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95 md:bottom-6 md:right-6"
    >
      <MessageCircle size={26} fill="white" strokeWidth={0} />
    </a>
  )
}
