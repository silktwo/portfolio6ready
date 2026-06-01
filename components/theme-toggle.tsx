"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

interface ThemeToggleProps {
  className?: string
  surface?: "light" | "dark"
}

export default function ThemeToggle({ className, surface = "light" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? "Dark" : "Light"

  return (
    <div
      className={cn(
        "inline-flex h-8 items-center justify-center gap-2 text-[11px] font-medium leading-none transition-colors",
        surface === "dark" ? "text-[#e3e3e3] dark:text-[#080808]" : "text-[#202020] dark:text-[#e3e3e3]",
        className
      )}
    >
      <span className="w-[28px] text-left">{label}</span>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} theme`}
        className={cn(
          "h-[18px] w-[34px] border-0 data-[state=checked]:bg-[#202020] data-[state=unchecked]:bg-[#202020] dark:data-[state=checked]:bg-[#e3e3e3] dark:data-[state=unchecked]:bg-[#e3e3e3]",
          surface === "dark" && "data-[state=checked]:bg-[#e3e3e3] data-[state=unchecked]:bg-[#e3e3e3] dark:data-[state=checked]:bg-[#202020] dark:data-[state=unchecked]:bg-[#202020]"
        )}
        thumbClassName={cn(
          "h-[14px] w-[14px] data-[state=checked]:translate-x-[17px] data-[state=unchecked]:translate-x-[3px]",
          surface === "dark" ? "bg-[#080808] dark:bg-[#e3e3e3]" : "bg-[#e3e3e3] dark:bg-[#080808]"
        )}
      />
    </div>
  )
}
