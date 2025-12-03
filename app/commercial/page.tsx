import { getCommercialProjectsServer, type CommercialProject } from "@/lib/notion-commercial-server"
import CommercialClient from "@/components/commercial-client"

// Revalidate every 30 minutes
export const revalidate = 1800

export default async function Commercial() {
  // Fetch data server-side with caching
  const projects = await getCommercialProjectsServer() as CommercialProject[] || []

  console.log(`💼 Commercial page rendered with ${projects.length} projects (cached)`)

  return <CommercialClient initialProjects={projects} />
}
