import { getCachedData } from "@/lib/cache"
import { type CaseProjectSummary } from "@/lib/notion-cases"
import HomeClient from "@/components/home-client"

// Revalidate every 30 minutes
export const revalidate = 1800

export default async function Home() {
  // Fetch data server-side with caching
  const projects = await getCachedData<CaseProjectSummary[]>('cases') as CaseProjectSummary[] || []

  console.log(`🏠 Homepage rendered with ${projects.length} projects (cached)`)

  return <HomeClient initialProjects={projects} />
}
