"use client"

import { useEffect, useRef } from "react"

type LottieAnimation = {
  addEventListener: (eventName: "complete", callback: () => void) => void
  destroy: () => void
}

/**
 * Plays the logo Lottie once and calls `onComplete` when it finishes.
 * lottie-web is imported dynamically so it never runs during SSR.
 */
export function IntroLottie({
  onComplete,
  className = "",
}: {
  onComplete?: () => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    let anim: LottieAnimation | undefined
    let cancelled = false

    import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (cancelled || !containerRef.current) return
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: false,
        autoplay: true,
        path: "/logo-lottie.json",
      })
      anim.addEventListener("complete", () => onCompleteRef.current?.())
    })

    return () => {
      cancelled = true
      anim?.destroy()
    }
  }, [])

  return <div ref={containerRef} className={className} aria-hidden="true" />
}
