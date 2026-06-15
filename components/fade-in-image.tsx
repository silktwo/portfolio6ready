"use client"

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react"

type FadeInImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /**
   * Eager-load this image and mark it as a preview the page-load mask should
   * wait for. Use it for the first visible row so the page reveals complete.
   */
  priority?: boolean
}

/**
 * An <img> that reveals with a gentle rise + fade once it has loaded — the same
 * "cards reveal as they appear" feel as kimera. Sources are already-WebP Notion
 * files served straight from the CDN-cached proxy (no re-optimization), so they
 * load fast. With loading="lazy" (default), off-screen images reveal on scroll.
 */
export function FadeInImage({
  className = "",
  priority = false,
  loading,
  onLoad,
  onError,
  ...props
}: FadeInImageProps) {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  const frames = useRef<number[]>([])

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
    <img
      ref={ref}
      {...props}
      loading={priority ? "eager" : loading ?? "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      data-preview-image={priority ? "true" : undefined}
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
