import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const CDN_MAX_AGE = 60 * 60 * 24 * 7
const SWR = 60 * 60 * 24 * 7

const ALLOWED_PROPERTIES = new Set([
  "introImage",
  "thumbnail",
])

const ALLOWED_NOTION_HOSTNAMES = [
  "prod-files-secure.s3.us-west-2.amazonaws.com",
  "s3.us-west-2.amazonaws.com",
  "s3-us-west-2.amazonaws.com",
  "notion.so",
  "notion-static.com",
]

function getToken(): string | undefined {
  return process.env.CASES_TOKEN || process.env.NOTION_TOKEN || process.env.PERSONAL_TOKEN
}

function isAllowedNotionFile(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url)
    return protocol === "https:" && ALLOWED_NOTION_HOSTNAMES.some((host) => hostname.includes(host))
  } catch {
    return false
  }
}

function cacheHeaders(contentType?: string) {
  return {
    ...(contentType ? { "Content-Type": contentType } : {}),
    "Cache-Control": `public, max-age=86400, s-maxage=${CDN_MAX_AGE}, stale-while-revalidate=${SWR}`,
    Vary: "Accept",
  }
}

async function getCurrentNotionFileUrl(pageId: string, propertyName: string, index: number): Promise<string | null> {
  const token = getToken()

  if (!token) {
    console.error("[notion-file] missing Notion token")
    return null
  }

  const notionResponse = await fetch(`https://api.notion.com/v1/pages/${encodeURIComponent(pageId)}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
    },
    signal: AbortSignal.timeout(10_000),
  })

  if (!notionResponse.ok) {
    console.error(`[notion-file] Notion page fetch ${notionResponse.status} for ${pageId}`)
    return null
  }

  const page = await notionResponse.json()
  const files = page?.properties?.[propertyName]?.files
  const file = Array.isArray(files) ? files[index] : null

  if (!file) return null
  if (file.type === "file") return file.file?.url || null
  if (file.type === "external") return file.external?.url || null

  return null
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const pageId = searchParams.get("pageId")
  const propertyName = searchParams.get("property")
  const index = Number(searchParams.get("index") || "0")

  if (!pageId || !propertyName || !ALLOWED_PROPERTIES.has(propertyName) || !Number.isInteger(index) || index < 0) {
    return new NextResponse("Invalid Notion file request", { status: 400 })
  }

  try {
    const fileUrl = await getCurrentNotionFileUrl(pageId, propertyName, index)

    if (!fileUrl) {
      return NextResponse.redirect(new URL("/placeholder.svg", request.url), { status: 302 })
    }

    if (!isAllowedNotionFile(fileUrl)) {
      return NextResponse.redirect(fileUrl, {
        status: 302,
        headers: cacheHeaders(),
      })
    }

    const upstream = await fetch(fileUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PortfolioNotionFileProxy/1.0)",
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!upstream.ok) {
      console.error(`[notion-file] upstream ${upstream.status} for ${pageId}/${propertyName}/${index}`)
      return NextResponse.redirect(new URL("/placeholder.svg", request.url), { status: 302 })
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg"
    const body = await upstream.arrayBuffer()

    return new NextResponse(body, {
      status: 200,
      headers: cacheHeaders(contentType),
    })
  } catch (error) {
    console.error("[notion-file] fetch error:", error)
    return NextResponse.redirect(new URL("/placeholder.svg", request.url), { status: 302 })
  }
}
