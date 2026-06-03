"use client"

import Image, { type ImageProps } from "next/image"
import { useEffect, useRef, useState } from "react"

type FadeInImageProps = Omit<ImageProps, "width" | "height"> & {
  className?: string
}

/**
 * A responsive next/image (auto resize + avif/webp + srcset) that reveals with a
 * gentle rise + fade once it has loaded — the same "cards reveal as they appear"
 * feel as kimera. With loading="lazy" (the default), off-screen images load and
 * reveal only as you scroll near them.
 */
export function FadeInImage({
  className = "",
  sizes = "100vw",
  alt = "",
  onLoad,
  onError,
  ...props
}: FadeInImageProps) {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  const frames = useRef<number[]>([])

  // SVGs (e.g. the placeholder) aren't optimized by next/image — render as-is.
  const isSvg = typeof props.src === "string" && props.src.includes(".svg")

  // Defer two frames so the hidden initial state paints first — this guarantees
  // the rise + fade transition runs, even for instantly-cached images.
  const reveal = () => {
    const a = requestAnimationFrame(() => {
      const b = requestAnimationFrame(() => setRevealed(true))
      frames.current.push(b)
    })
    frames.current.push(a)
  }

  useEffect(() => {
    // A cached image can already be complete before onLoad ever fires.
    if (ref.current?.complete) reveal()
    // Safety net: an image must never stay invisible if a load event is missed.
    const timeout = window.setTimeout(() => setRevealed(true), 2500)
    return () => {
      window.clearTimeout(timeout)
      frames.current.forEach(cancelAnimationFrame)
    }
  }, [])

  return (
    <Image
      {...props}
      ref={ref}
      alt={alt}
      sizes={sizes}
      unoptimized={isSvg}
      width={0}
      height={0}
      style={{ width: "100%", height: "auto" }}
      onLoad={(event) => {
        reveal()
        onLoad?.(event)
      }}
      onError={(event) => {
        reveal()
        onError?.(event)
      }}
      className={`${className} transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    />
  )
}
