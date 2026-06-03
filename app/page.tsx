import ReactDOM from "react-dom"
import { getCachedData } from "@/lib/cache"
import { type CaseProjectSummary } from "@/lib/notion-cases"
import { proxyNotionImage } from "@/lib/notion-image"
import HomeClient from "@/components/home-client"

// Revalidate every 30 minutes
export const revalidate = 1800

export default async function Home() {
  // Fetch data server-side with caching
  const projects = await getCachedData<CaseProjectSummary[]>('cases') as CaseProjectSummary[] || []

  console.log(`🏠 Homepage rendered with ${projects.length} projects (cached)`)

  // Preload the visible thumbnails so the browser starts fetching them while it
  // parses the HTML — before React hydrates. This lets the page-load mask reveal
  // a fully painted grid instead of images popping in one by one.
  projects.slice(0, 12).forEach((project, index) => {
    const raw = project.thumbnail || project.introImage || ""
    if (!raw) return
    const href = proxyNotionImage(raw)
    if (!href || href.startsWith("/placeholder")) return
    ReactDOM.preload(href, { as: "image", fetchPriority: index < 3 ? "high" : "auto" })
  })

  return <HomeClient initialProjects={projects} />
}
