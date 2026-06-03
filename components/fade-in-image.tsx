"use client"

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react"

/**
 * An <img> that reveals with a gentle rise + fade the first time it scrolls into
 * view — the same "cards animate in as you reach them" feel as kimera. Driven by
 * an IntersectionObserver so the motion plays consistently regardless of whether
 * the image is cached (instant) or still loading.
 */
export function FadeInImage({
  className = "",
  onLoad,
  onError,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // A cached image can already be complete before onLoad ever fires.
    if (node.complete) setLoaded(true)

    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    )
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const revealed = inView && loaded

  return (
    <img
      ref={ref}
      {...props}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
      onError={(event) => {
        setLoaded(true)
        onError?.(event)
      }}
      className={`${className} transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    />
  )
}
