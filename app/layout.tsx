import type { Metadata } from "next"
import "./globals.css"
import { logCMSConfiguration } from "@/lib/cms-adapter"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: {
    default: "Dmytro Kifuliak — Designer",
    template: "%s | Dmytro Kifuliak",
  },
  description:
    "All-in-one designer with 7+ years of experience. Conceives and builds visual systems from start to finish.",
  generator: "Next.js",
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Dmytro Kifuliak Portfolio",
  },
}

// Log CMS configuration on startup (server-only)
if (typeof window === "undefined") {
  logCMSConfiguration()
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
         * Preconnect to Notion S3 so TCP/TLS happens before images are
         * requested via our proxy.  This shaves ~200-400 ms off TTFB for
         * the first proxied image.
         */}
        <link
          rel="preconnect"
          href="https://prod-files-secure.s3.us-west-2.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://prod-files-secure.s3.us-west-2.amazonaws.com"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
