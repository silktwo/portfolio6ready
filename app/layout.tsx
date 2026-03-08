import type { Metadata } from 'next'
import './globals.css'
import { logCMSConfiguration } from "@/lib/cms-adapter"

export const metadata: Metadata = {
  title: 'Dmytro Kifuliak',
  description: 'Personal portfolio site',
  generator: 'v0.dev',
}

// Log CMS configuration on startup
if (typeof window === 'undefined') {
  logCMSConfiguration()
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}