import { getPersonalProjectsServer, type PersonalProject } from "@/lib/notion-projects-server"
import PersonalProjectsClient from "@/components/personal-projects-client"

// Revalidate every 30 minutes
export const revalidate = 1800

export default async function PersonalProjects() {
  // Fetch data server-side with caching
  const projects = await getPersonalProjectsServer() as PersonalProject[] || []

  console.log(`🎨 Personal Projects page rendered with ${projects.length} projects (cached)`)

  return <PersonalProjectsClient initialProjects={projects} />
}
