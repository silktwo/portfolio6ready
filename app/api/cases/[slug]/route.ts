import { NextResponse } from "next/server"
import { getCaseBySlug } from "@/lib/notion-cases"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    console.log(`🔍 API: Fetching case with slug: ${slug}`)

    const project = await getCaseBySlug(slug)

    if (project) {
      console.log(`✅ API: Found project: ${project.projectTitle}`)
      return NextResponse.json({
        success: true,
        project,
      })
    }

    console.log(`❌ API: No project found for slug: ${slug}`)
    return NextResponse.json({
      success: false,
      error: "Project not found",
    })
  } catch (error) {
    console.error("❌ API Error in case slug route:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
