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

/**
 * Builds a STABLE image URL for a Notion file property.
 *
 * Unlike a signed S3 URL (which rotates every revalidate and breaks CDN
 * caching), this URL never changes for a given page/property/index — the
 * server re-resolves the current signed URL on demand, so the CDN can cache
 * the image once. The file is streamed as-is (no resizing or re-encoding).
 */
export function notionFileUrl(pageId: string, property: string, index = 0): string {
  return `/api/notion-file?pageId=${encodeURIComponent(pageId)}&property=${encodeURIComponent(property)}&index=${index}`
}

/**
 * Picks the best image URL:
 *  - A non-Notion URL (e.g. a Cloudflare R2 public link pasted into Notion) is
 *    already stable and public, so it's used directly — no proxy, no resolve.
 *  - A Notion-hosted file has an expiring signed URL, so we go through the
 *    stable notion-file endpoint that re-resolves it on demand.
 *
 * This lets you migrate to R2 image-by-image: swap a file for an R2 link in
 * Notion and it instantly switches to direct delivery.
 */
export function stableImageUrl(
  rawUrl: string | undefined | null,
  pageId: string,
  property: string,
  index = 0,
): string {
  if (rawUrl && !isNotionImageUrl(rawUrl)) return rawUrl
  return notionFileUrl(pageId, property, index)
}
