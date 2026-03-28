/**
 * Notion Image Proxy Utilities
 *
 * Notion S3 image URLs expire after ~1 hour, causing broken images.
 * This module provides a proxy URL that routes through our API endpoint,
 * which sets long-lived Cache-Control headers so Vercel Edge / Cloudflare
 * can cache them indefinitely (until the build re-fetches from Notion).
 */

/** Domains that come from Notion file attachments */
const NOTION_IMAGE_DOMAINS = [
  "prod-files-secure.s3.us-west-2.amazonaws.com",
  "s3.us-west-2.amazonaws.com",
  "s3-us-west-2.amazonaws.com",
  "notion.so",
  "notion-static.com",
]

/** Returns true when the URL points to a Notion-hosted image */
export function isNotionImageUrl(url: string): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return NOTION_IMAGE_DOMAINS.some((d) => hostname.includes(d))
  } catch {
    return false
  }
}

/**
 * Converts a raw Notion S3 URL to a proxied URL.
 * Non-Notion URLs are returned unchanged.
 *
 * Usage in JSX:
 *   <img src={proxyNotionImage(url)} … />
 */
export function proxyNotionImage(url: string | undefined | null): string {
  if (!url) return "/placeholder.svg"
  if (!isNotionImageUrl(url)) return url
  return `/api/image-proxy?url=${encodeURIComponent(url)}`
}
