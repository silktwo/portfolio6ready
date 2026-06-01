import type { Metadata } from "next"
import FontsClient from "@/components/fonts-client"

export const metadata: Metadata = {
  title: "Fonts",
  description: "Lezo typeface specimen, tester, and glyph overview.",
}

export default function FontsPage() {
  return <FontsClient />
}
