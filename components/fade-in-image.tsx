"use client"

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react"

/**
 * An <img> that reveals with a gentle rise + fade once it has loaded — the same
 * "cards reveal as they appear" feel as kimera. Combined with loading="lazy",
 * off-screen images load (and so reveal) only as you scroll near them.
 *
 * Revealing on load (rather than via an IntersectionObserver on the <img>) is
 * deliberate: a lazy image has zero height until it loads, which makes observing
 * it unreliable and can leave images stuck invisible.
 */
export function FadeInImage({
  className = "",
  onLoad,
  onError,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  const frames = useRef<number[]>([])

  // Defer two frames so the hidden initial state paints first — this guarantees
  // the rise + fade transition actually runs, even for instantly-cached images.
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
    return () => frames.current.forEach(cancelAnimationFrame)
  }, [])

  return (
    <img
      ref={ref}
      {...props}
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
