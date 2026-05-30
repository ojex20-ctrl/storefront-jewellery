"use client"
import { MessageCircle } from "lucide-react"

const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919876543210"
const MSG = encodeURIComponent(process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ?? "Hi! I have a question about SYRA jewellery.")

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${PHONE}?text=${MSG}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
    >
      <MessageCircle size={26} fill="white" strokeWidth={0} />
    </a>
  )
}
