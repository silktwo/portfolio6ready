import { type NextRequest, NextResponse } from "next/server"

// Run at the Edge for minimal cold-start and best caching
export const runtime = "edge"

// Time to cache at the CDN level (1 week → images are stable within a deploy)
const CDN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
// Serve stale while re-validating for an additional week
const SWR = 60 * 60 * 24 * 7

/** Domains allowed to be proxied (Notion S3 origins) */
const ALLOWED_HOSTNAMES = [
  "prod-files-secure.s3.us-west-2.amazonaws.com",
  "s3.us-west-2.amazonaws.com",
  "s3-us-west-2.amazonaws.com",
  "notion.so",
  "notion-static.com",
]

function isAllowed(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return ALLOWED_HOSTNAMES.some((h) => hostname.includes(h))
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 })
  }

  if (!isAllowed(imageUrl)) {
    return new NextResponse("URL not allowed", { status: 403 })
  }

  try {
    const upstream = await fetch(imageUrl, {
      // Bypass Next.js fetch cache; we own the caching via headers below
      cache: "no-store",
      headers: {
        // Forward a browser-like UA so Notion S3 doesn't reject the request
        "User-Agent":
          "Mozilla/5.0 (compatible; PortfolioImageProxy/1.0)",
      },
      // 10-second timeout
      signal: AbortSignal.timeout(10_000),
    })

    if (!upstream.ok) {
      console.error(
        `[image-proxy] upstream ${upstream.status} for ${imageUrl}`
      )
      return NextResponse.redirect("/placeholder.svg", { status: 302 })
    }

    const contentType =
      upstream.headers.get("content-type") ?? "image/jpeg"
    const body = await upstream.arrayBuffer()

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Long-lived cache: CDN stores for 7 days, browser 1 day
        "Cache-Control": `public, max-age=86400, s-maxage=${CDN_MAX_AGE}, stale-while-revalidate=${SWR}`,
        // Varies per URL so CDN stores separately per image
        Vary: "Accept",
      },
    })
  } catch (error) {
    console.error("[image-proxy] fetch error:", error)
    return NextResponse.redirect("/placeholder.svg", { status: 302 })
  }
}
