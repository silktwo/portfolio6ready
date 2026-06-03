import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getCachedData } from "@/lib/cache"
import { type CaseProjectSummary } from "@/lib/notion-cases"
import PortfolioState from "@/components/portfolio-state"

export const revalidate = 1800

export default async function WorkPage() {
  const projects = await getCachedData<CaseProjectSummary[]>('cases') as CaseProjectSummary[] || []

  console.log(`📄 Work page rendered with ${projects.length} projects (cached)`)

  if (!projects || projects.length === 0) {
    return (
      <PortfolioState
        title="Work is being refreshed"
        message="The archive is temporarily unavailable while the latest case studies are syncing."
        actionHref="/"
        actionLabel="Back to home"
      />
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Work</h1>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project.id} href={`/work/${project.slug}`}>
            <div className="group cursor-pointer">
              <div className={`aspect-[4/3] overflow-hidden mb-4 relative rounded-[6px] ${project.comingSoon ? "isolate bg-[#8d8a82]" : "bg-gray-100"}`}>
                <img
                  src={project.thumbnail || project.introImage || "/placeholder.svg"}
                  alt={project.projectTitle}
                  className={`h-full w-full object-cover rounded-[6px] ${
                    project.comingSoon
                      ? "absolute inset-0 transform-gpu scale-125 blur-[20px] opacity-90"
                      : ""
                  }`}
                />
                {!project.comingSoon && (
                  <div className="pointer-events-none absolute inset-0 rounded-[6px] bg-white opacity-0 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-40 dark:bg-black dark:group-hover:opacity-45" />
                )}
                {project.comingSoon && (
                  <>
                    <div className="absolute inset-0 bg-[rgba(14,14,14,0.16)]" />
                    <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-black text-white rounded-[10px] px-4 py-1 font-medium text-[10px]">
                        COMING SOON
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-black text-sm">{project.projectTitle}</h3>
                <div className="flex flex-wrap gap-1">
                  {project.categoryTags.map((tag, tagIndex) => (
                    <Badge
                      key={tagIndex}
                      variant="outline"
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 border-gray-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
