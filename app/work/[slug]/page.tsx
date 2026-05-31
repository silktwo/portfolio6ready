import type { Metadata } from "next"
import WorkPageClient from "./WorkPageClient"
import { getCachedData } from "@/lib/cache"
import { type CaseProject, type CaseProjectSummary } from "@/lib/notion-cases"
import PortfolioState from "@/components/portfolio-state"

export const revalidate = 1800

// Fallback projects for when database is not accessible
const fallbackProjects: Record<string, any> = {
  "maitreya": {
    id: "fallback-maitreya",
    projectTitle: "Maitreya",
    categoryTags: ["identity", "packaging", "logo design"],
    description: "Brand identity and packaging design for Maitreya wellness products.",
    team: "Designer: Anna Leonchenko, Creative Director: John Doe",
    introImage: "/placeholder.svg?height=800&width=1200",
    thumbnail: "/placeholder.svg?height=400&width=600",
    projectMedia: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800"
    ],
    draftProcess: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600"
    ],
    addMedia: [],
    publish: true,
    link: "",
    slug: "maitreya",
    comingSoon: false
  },
  "bickerstaff": {
    id: "fallback-bickerstaff",
    projectTitle: "Bickerstaff",
    categoryTags: ["branding", "web design"],
    description: "Complete brand identity and website design for Bickerstaff consulting.",
    team: "Designer: Jane Smith, Developer: Mike Johnson",
    introImage: "/placeholder.svg?height=800&width=1200",
    thumbnail: "/placeholder.svg?height=400&width=600",
    projectMedia: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800"
    ],
    draftProcess: [],
    addMedia: [],
    publish: true,
    link: "",
    slug: "bickerstaff",
    comingSoon: false
  }
}

interface Props {
  params: Promise<{
    slug: string
  }>
}

function getCaseFooterNav(projects: CaseProjectSummary[], slug: string) {
  const navigableProjects = projects.filter((project) => !project.comingSoon || project.slug === slug)
  const currentIndex = navigableProjects.findIndex((project) => project.slug === slug)

  if (currentIndex < 0 || navigableProjects.length < 2) {
    return { previous: null, next: null }
  }

  const previous = navigableProjects[(currentIndex - 1 + navigableProjects.length) % navigableProjects.length]
  const next = navigableProjects[(currentIndex + 1) % navigableProjects.length]

  return { previous, next }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params

    // Try to get from database
    const project = await getCachedData<CaseProject>('case', resolvedParams.slug) as CaseProject | null

    if (project) {
      return {
        title: project.projectTitle,
        description: project.description,
      }
    }

    // Try fallback data
    const fallbackProject = fallbackProjects[resolvedParams.slug]
    if (fallbackProject) {
      return {
        title: fallbackProject.projectTitle,
        description: fallbackProject.description,
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
  }

  // Default metadata
  return {
    title: "Case Study",
    description: "View this case study project",
  }
}

export default async function WorkPage({ params }: Props) {
  try {
    const resolvedParams = await params
    console.log(`🔍 Server: Fetching project with slug: ${resolvedParams.slug}`)

    // Try to get from database
    let project = await getCachedData<CaseProject>('case', resolvedParams.slug) as CaseProject | null
    let dataSource: "database" | "fallback" = "database"

    // If still not found, try fallback data
    if (!project) {
      console.log(`⚠️ Server: Project not found in database, checking fallback data`)
      const fallbackProject = fallbackProjects[resolvedParams.slug]
      if (fallbackProject) {
        console.log(`✅ Server: Using fallback data for: ${resolvedParams.slug}`)
        project = fallbackProject
        dataSource = "fallback"
      }
    }

    // If we have a project (either from database or fallback), render the page
    if (project) {
      const caseSummaries = await getCachedData<CaseProjectSummary[]>('cases') as CaseProjectSummary[] || []
      const caseNav = getCaseFooterNav(caseSummaries, project.slug)

      return (
        <WorkPageClient
          params={resolvedParams}
          initialProject={project}
          dataSource={dataSource}
          caseNav={caseNav}
        />
      )
    }

    // If no project found, show a custom not found page
    return (
      <PortfolioState
        title="Case not available"
        message="This project may have moved, changed status, or is still being prepared for the archive."
        actionHref="/"
        actionLabel="Back to home"
      />
    )
  } catch (error) {
    console.error("Error in WorkPage:", error)

    // Show error page
    return (
      <PortfolioState
        title="Case is taking a moment"
        message="The project archive could not be loaded right now. Try again shortly or return to the homepage."
        actionHref="/"
        actionLabel="Back to home"
      />
    )
  }
}
