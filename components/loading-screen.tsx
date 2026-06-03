import React from "react"
import { IntroLottie } from "@/components/intro-lottie"

export function LoadingScreen({
  className = "",
  intro = false,
  onIntroComplete,
}: {
  className?: string
  /** When true, shows the branded logo Lottie instead of a blank screen. */
  intro?: boolean
  /** Fired when the intro Lottie finishes playing. */
  onIntroComplete?: () => void
}) {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex items-center justify-start bg-white pl-0 dark:bg-[#080808] ${className}`}
    >
      {intro && (
        <IntroLottie
          onComplete={onIntroComplete}
          className="w-[min(60vw,420px)] -translate-x-[14%] dark:invert"
        />
      )}
    </div>
  )
}
