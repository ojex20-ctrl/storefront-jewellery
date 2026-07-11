"use client"
import { useEffect, useRef } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { useWishlistStore } from "@/stores/wishlist-store"

/**
 * Keeps the wishlist in sync with the server for logged-in customers, from
 * anywhere in the app (not just the wishlist page):
 *  - on login, MERGES (union) the local/guest wishlist with the server list so
 *    guest saves survive sign-in, then persists the merged set back;
 *  - after the merge, any wishlist change is debounced-saved to the server.
 * For guests (no session) it does nothing — the local store just works.
 */
export function WishlistSync() {
  const token = useAuthStore((s) => s.token)
  const ids = useWishlistStore((s) => s.ids)
  const setIds = useWishlistStore((s) => s.set)
  const merged = useRef(false)

  // Merge local + server once per login.
  useEffect(() => {
    if (!token) { merged.current = false; return }
    if (merged.current) return
    let cancelled = false
    void (async () => {
      const res = await fetch("/api/account/wishlist", { credentials: "include" }).catch(() => null)
      if (!res?.ok || cancelled) return
      const data = await res.json().catch(() => ({}))
      const serverIds: string[] = Array.isArray(data.ids) ? data.ids : []
      const union = Array.from(new Set([...useWishlistStore.getState().ids, ...serverIds]))
      setIds(union)
      merged.current = true
      // Persist the merged set so the server has the union too.
      await fetch("/api/account/wishlist", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: union }),
      }).catch(() => {})
    })()
    return () => { cancelled = true }
  }, [token, setIds])

  // After the initial merge, save changes (add/remove) to the server, debounced.
  useEffect(() => {
    if (!token || !merged.current) return
    const t = setTimeout(() => {
      void fetch("/api/account/wishlist", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids }),
      }).catch(() => {})
    }, 500)
    return () => clearTimeout(t)
  }, [ids, token])

  return null
}
