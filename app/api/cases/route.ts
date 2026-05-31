import { NextResponse } from "next/server"
import { getCaseProjectSummaries, getCaseProjects } from "@/lib/notion-cases"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("🚀 Cases API route called")

    const { searchParams } = new URL(request.url)
    const result = searchParams.get("full") === "true"
      ? await getCaseProjects()
      : await getCaseProjectSummaries()

    console.log("📊 Cases API result:", {
      success: result.success,
      count: result.data.length,
      errors: result.metadata.errors.length,
      warnings: result.metadata.warnings.length,
    })

    return NextResponse.json({
      success: result.success,
      data: result.data,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error("❌ Cases API error:", error)
    return NextResponse.json(
      {
        success: false,
        data: [],
        metadata: {
          count: 0,
          errors: [`API error: ${error instanceof Error ? error.message : "Unknown error"}`],
          warnings: [],
          debugInfo: {},
        },
      },
      { status: 500 }
    )
  }
}
