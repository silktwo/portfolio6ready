"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"

const MIN_VISIBLE_MS = 220
const MAX_VISIBLE_MS = 4200
const IMAGE_WAIT_MS = 3600
const EXIT_MS = 280

// The home grid shows up to 12 thumbnails at once. On a cold load they need more
// headroom than a regular page, so we let the mask wait longer there (only there).
const HOME_IMAGE_WAIT_MS = 6500
const HOME_MAX_VISIBLE_MS = 7500

// Safety net: if the intro Lottie never reports completion (load error, etc.),
// reveal anyway after this long. The animation itself is ~4s.
const INTRO_MAX_MS = 9000

// Module-level so the intro plays once per full page load — not on every in-app
// navigation back to home. A real reload resets it and replays the intro.
let introShown = false

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function nextPaint() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve())
    })
  })
}

function waitForImage(image: HTMLImageElement) {
  if (image.complete) return Promise.resolve()

  if (typeof image.decode === "function") {
    return image.decode().catch(() => undefined)
  }

  return new Promise<void>((resolve) => {
    image.addEventListener("load", () => resolve(), { once: true })
    image.addEventListener("error", () => resolve(), { once: true })
  })
}

function isRenderableImage(image: HTMLImageElement) {
  if (image.getClientRects().length === 0) return false

  const styles = window.getComputedStyle(image)
  if (styles.display === "none" || styles.visibility === "hidden") return false

  return true
}

async function waitForCriticalImages(imageWaitMs: number) {
  const previewImages = Array.from(
    document.querySelectorAll<HTMLImageElement>('img[data-preview-image="true"]'),
  ).filter(isRenderableImage)

  const images =
    previewImages.length > 0
      ? previewImages
      : Array.from(
          document.querySelectorAll<HTMLImageElement>(
            'img[loading="eager"], img[fetchpriority="high"], img[data-preload="true"]',
          ),
        ).filter(isRenderableImage)

  if (images.length === 0) return

  await Promise.race([
    Promise.allSettled(images.slice(0, 12).map(waitForImage)),
    sleep(imageWaitMs),
  ])
}

export function PageLoadMask({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [loader, setLoader] = useState<{
    pathname: string
    phase: "visible" | "hiding" | "gone"
  }>({
    pathname,
    phase: "visible",
  })

  const routeChanged = loader.pathname !== pathname
  const phase = routeChanged ? "visible" : loader.phase

  // Decide once on mount whether this load gets the branded intro.
  const [intro] = useState(() => pathname === "/" && !introShown)

  // Promise that resolves when the intro Lottie reports completion. Created
  // synchronously so the resolver exists before the Lottie can finish.
  const introDoneRef = useRef<() => void>(() => {})
  const introDonePromiseRef = useRef<Promise<void> | null>(null)
  if (!introDonePromiseRef.current) {
    introDonePromiseRef.current = new Promise<void>((resolve) => {
      introDoneRef.current = resolve
    })
  }

  useEffect(() => {
    if (intro) introShown = true
  }, [intro])

  useEffect(() => {
    let cancelled = false

    async function reveal() {
      setLoader({ pathname, phase: "visible" })

      const isHome = pathname === "/"
      const imageWaitMs = isHome ? HOME_IMAGE_WAIT_MS : IMAGE_WAIT_MS
      const maxVisibleMs = isHome ? HOME_MAX_VISIBLE_MS : MAX_VISIBLE_MS

      if (intro) {
        // Hold the white screen until the logo animation finishes (and the grid
        // is ready), then fade. Safety cap in case the Lottie never completes.
        await Promise.race([
          Promise.all([introDonePromiseRef.current, waitForCriticalImages(imageWaitMs)]),
          sleep(INTRO_MAX_MS),
        ])
      } else {
        await Promise.race([
          Promise.all([sleep(MIN_VISIBLE_MS), nextPaint(), waitForCriticalImages(imageWaitMs)]),
          sleep(maxVisibleMs),
        ])
      }

      if (cancelled) return

      setLoader({ pathname, phase: "hiding" })
      await sleep(EXIT_MS)

      if (!cancelled) setLoader({ pathname, phase: "gone" })
    }

    reveal()

    return () => {
      cancelled = true
    }
  }, [pathname, intro])

  return (
    <>
      <div className={phase === "visible" ? "opacity-0" : ""}>{children}</div>
      {phase !== "gone" && (
        <LoadingScreen
          intro={intro}
          onIntroComplete={() => introDoneRef.current?.()}
          className={
            phase === "hiding"
              ? "pointer-events-none opacity-0 transition-opacity duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "opacity-100"
          }
        />
      )}
    </>
  )
}
