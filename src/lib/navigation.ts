import {
  FileText,
  Image,
  Images,
  Inbox,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { FooterGroup, NavLink } from "./brand-config"

export type AdminNavLink = NavLink & { icon: LucideIcon }
export type AccountNavLink = NavLink & { key: string }

export const STOREFRONT_NAV_LINKS: NavLink[] = [
  { href: "/collection", label: "New In" },
  { href: "/collection", label: "All Products" },
  { href: "/collection?kind=Ring", label: "Rings" },
  { href: "/collection?kind=Earrings", label: "Earrings" },
  { href: "/collection?kind=Necklace", label: "Necklaces" },
  { href: "/collection?kind=Bracelet", label: "Bracelets" },
  { href: "/collection", label: "Signature Collection" },
]

const HOME_NAV_LINK: NavLink = { href: "/", label: "Home" }

export const REQUIRED_STOREFRONT_NAV_LINKS: NavLink[] = [
  HOME_NAV_LINK,
  { href: "/order-track", label: "Track Order" },
]

export const STOREFRONT_FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Shop",
    links: [
      { href: "/collection", label: "All Pieces" },
      { href: "/collection?kind=Ring", label: "Rings" },
      { href: "/collection?kind=Necklace", label: "Necklaces" },
      { href: "/collection?kind=Bracelet", label: "Bracelets" },
      { href: "/collection?kind=Earrings", label: "Earrings" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/size-guide", label: "Size Guide" },
      { href: "/warranty", label: "Warranty" },
      { href: "/care-guide", label: "Care Guide" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/journal", label: "Journal" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
]

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/collections", icon: Tags, label: "Collections" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
  { href: "/admin/inbox", icon: Inbox, label: "Inbox" },
  { href: "/admin/content", icon: FileText, label: "Content" },
  { href: "/admin/banners", icon: Image, label: "Banners" },
  { href: "/admin/media", icon: Images, label: "Gallery" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

export const ACCOUNT_NAV_LINKS: AccountNavLink[] = [
  { key: "orders", label: "Orders", href: "/account/orders" },
  { key: "profile", label: "Profile", href: "/account/profile" },
  { key: "addresses", label: "Addresses", href: "/account/addresses" },
  { key: "wishlist", label: "Wishlist", href: "/account/wishlist" },
]

export function buildStorefrontNavLinks(configuredLinks?: NavLink[] | null) {
  const links: NavLink[] = []
  const addUnique = (link: NavLink) => {
    if (!links.some((item) => item.href === link.href && item.label === link.label)) links.push(link)
  }

  addUnique(HOME_NAV_LINK)
  for (const link of configuredLinks?.length ? configuredLinks : STOREFRONT_NAV_LINKS) {
    if (link.href !== "/") addUnique(link)
  }
  for (const link of REQUIRED_STOREFRONT_NAV_LINKS.slice(1)) addUnique(link)

  return links
}
