"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BackToTop({ className, iconClassName }: { className?: string, iconClassName?: string }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Initial check
    toggleVisibility()
    window.addEventListener("scroll", toggleVisibility)

    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Common visibility classes that apply universally
  const visibilityClasses = isVisible
    ? "opacity-100 scale-100 translate-y-0"
    : "opacity-0 scale-90 translate-y-4 pointer-events-none"

  return (
    <Button
      onClick={scrollToTop}
      className={`${className || "hidden md:flex fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-black text-white hover:bg-gray-800 shadow-lg"} transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${visibilityClasses}`}
      size="icon"
    >
      <ArrowUp className={iconClassName || "w-5 h-5"} />
      <span className="sr-only">Back to top</span>
    </Button>
  )
}
