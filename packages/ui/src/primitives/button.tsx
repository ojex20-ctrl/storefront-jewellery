"use client"
import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "../lib/cn"

type Variant = "solid" | "ghost" | "link" | "white"
type Size = "sm" | "md" | "lg"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  asChild?: false
}

export function buttonVariants({
  variant = "solid",
  size = "md",
}: { variant?: Variant; size?: Size } = {}) {
  return cn(
    "relative inline-flex items-center justify-center gap-2 overflow-hidden",
    "font-mono uppercase tracking-widest transition-all duration-300 ease-out",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    size === "sm" && "px-4 py-2 text-[10px]",
    size === "md" && "px-6 py-3.5 text-[11px]",
    size === "lg" && "px-8 py-5 text-[12px]",
    variant === "solid" &&
      "border border-ink bg-ink text-bg before:absolute before:inset-0 before:translate-y-full before:bg-accent before:transition-transform before:duration-300 before:ease-out hover:border-accent hover:before:translate-y-0 [&>*]:relative [&>*]:z-10",
    variant === "ghost" &&
      "border border-ink bg-transparent text-ink before:absolute before:inset-0 before:translate-y-full before:bg-ink before:transition-transform before:duration-300 before:ease-out hover:text-bg hover:before:translate-y-0 [&>*]:relative [&>*]:z-10",
    variant === "white" &&
      "border border-white bg-white text-ink before:absolute before:inset-0 before:translate-y-full before:bg-accent before:transition-transform before:duration-300 before:ease-out hover:before:translate-y-0 [&>*]:relative [&>*]:z-10",
    variant === "link" && "border-0 bg-transparent p-0",
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "solid", size = "md", children, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      <span>{children}</span>
    </button>
  )
})
