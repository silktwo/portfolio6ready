/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Image Optimisation ───────────────────────────────────────────────────
  images: {
    // Accept Notion S3 images for the Next.js built-in optimizer
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "notion.so",
      },
      {
        protocol: "https",
        hostname: "notion-static.com",
      },
    ],
    // Serve WebP/AVIF when the browser supports it
    formats: ["image/avif", "image/webp"],
    // Useful sizes for responsive thumbnails and full-bleed images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimised images on CDN for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // ─── HTTP Headers ─────────────────────────────────────────────────────────
  async headers() {
    return [
      // Pages — ISR-friendly caching
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Static assets — immutable long-term caching
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Fonts — long-lived (reference: /fonts/ in /public)
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Image proxy endpoint — long CDN cache
      {
        source: "/api/image-proxy",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
          },
        ],
      },
    ]
  },
}

export default nextConfig
