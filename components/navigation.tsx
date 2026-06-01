"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import ThemeToggle from "@/components/theme-toggle"

interface NavigationProps {
  activePage?: string | null
  setActivePage?: (page: string | null) => void
}

export default function Navigation({ activePage, setActivePage }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [previousPath, setPreviousPath] = useState<string>("/")

  // Track previous path for navigation history
  useEffect(() => {
    const handleRouteChange = () => {
      setPreviousPath(pathname)
    }

    // Store current path as previous when component mounts
    if (pathname !== "/") {
      setPreviousPath("/")
    }

    return () => {
      handleRouteChange()
    }
  }, [pathname])

  const navCategories: Array<{
    name: string
    path: string
    hasLogo?: boolean
    primary?: boolean
    hasIndicator?: boolean
    disabled?: boolean
    decorative?: boolean
  }> = [
    { name: "Dmytro Kifuliak", hasLogo: true, primary: true, path: "/" },
    { name: "Personal Projects", path: "/personal-projects" },
    { name: "Commercial", path: "/commercial" },
    { name: "Journal", path: "/journal" },
    { name: "Fonts", path: "/fonts" },
  ]

  const isActivePage = (category: any) => {
    if (category.path === "/" && pathname === "/") return true
    if (category.path !== "/" && pathname.startsWith(category.path)) return true
    return activePage === category.name
  }

  const handleNavClick = (category: any, e: React.MouseEvent) => {
    // Disable fonts button or decorative buttons
    if (category.disabled || category.decorative) {
      e.preventDefault()
      return
    }

    // Check if clicking on current page
    if (isActivePage(category) && category.path !== "/") {
      e.preventDefault()
      // Go back to previous page or homepage
      const targetPath = previousPath && previousPath !== pathname ? previousPath : "/"
      router.push(targetPath)
      return
    }

    // Update previous path before navigation
    setPreviousPath(pathname)
  }

  return (
    <nav className="mb-4 flex w-full items-start justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {navCategories.map((category, index) => {
          const isFirstButton = index === 0
          const isActive = isActivePage(category)
          const hasFontIndicator = category.hasIndicator
          const isDisabled = category.disabled
          const isDecorative = category.decorative

          // For decorative buttons, use a div instead of Link
          const ButtonWrapper = isDecorative
            ? ({ children }: { children: React.ReactNode }) => <div>{children}</div>
            : ({ children }: { children: React.ReactNode }) => (
                <Link href={category.path} onClick={(e) => handleNavClick(category, e)}>
                  {children}
                </Link>
              )

          return (
            <ButtonWrapper key={index}>
              <Badge
                className={`inline-flex h-8 items-center justify-center gap-1 rounded-full px-4 py-1 transition-all duration-300 ease-in-out ${
                  isDisabled
                    ? "bg-gray-400 cursor-not-allowed opacity-50 dark:bg-[#5c5c5c]"
                    : "bg-black hover:bg-gray-800 cursor-pointer dark:bg-[#e3e3e3] dark:hover:bg-[#cfcfcf]"
                }`}
              >
                {category.hasLogo && (
                  <div className="w-5 h-3 flex-shrink-0 relative">
                    <Image
                      src="/logo-header.svg"
                      alt="Dmytro Kifuliak Logo"
                      width={20}
                      height={11}
                      className="w-full h-full dark:invert"
                      priority
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<span class="text-[#E3E3E3] text-[8px] font-bold">DK</span>'
                        }
                      }}
                    />
                  </div>
                )}
                <span
                  className={`text-[11px] font-${category.primary ? "bold" : "medium"} whitespace-nowrap text-[#E3E3E3] dark:text-[#080808]`}
                >
                  {category.name}
                </span>
                {hasFontIndicator && <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />}
                {isActive && !isFirstButton && !hasFontIndicator && !isDisabled && (
                  <div className="w-3 h-3 bg-[#E3E3E3] rounded-full flex items-center justify-center flex-shrink-0 dark:bg-[#080808]">
                    <X className="w-2 h-2 text-black dark:text-[#e3e3e3]" />
                  </div>
                )}
              </Badge>
            </ButtonWrapper>
          )
        })}
      </div>
      <ThemeToggle className="mt-0 shrink-0" />
    </nav>
  )
}
