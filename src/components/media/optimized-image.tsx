"use client"
import Image from "next/image"

type Props = {
  src?: string | null
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
}: Props) {
  const image = src || "/jewellery/gen-diamond-ring.png"
  const isUploadedImage = image.startsWith("/uploads/")
  return (
    <Image
      src={image}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={isUploadedImage}
      className={className ?? "object-cover"}
    />
  )
}
