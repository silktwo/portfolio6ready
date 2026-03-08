import { Client } from "@notionhq/client"
import { unstable_cache } from "next/cache"

// Personal Projects Database Configuration
const PERSONAL_PROJECTS_CONFIG = {
    DATABASE_ID: (process.env.PERSONAL_DATABASE_ID || "20955dd5594d809999c8c3562cc7e95f").replace(/-/g, ""),
    REQUIRED_FIELDS: {
        TITLE: "workTitle",
        FILE: "workFile",
    },
}

export interface PersonalProject {
    id: string
    title: string
    slug: string
    image: string
    height?: string
    description?: string
    lastEditedTime?: string
    createdTime?: string
}

// Create Notion client with multiple token fallbacks
function createNotionClient(): Client | null {
    const tokens = [
        process.env.PERSONAL_TOKEN,
        process.env.NOTION_TOKEN,
        "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",
        "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",
    ].filter(Boolean)

    for (const token of tokens) {
        try {
            return new Client({ auth: token })
        } catch (error) {
            continue
        }
    }
    return null
}

// Fetch projects from Notion directly (Server Side)
async function fetchPersonalProjects(): Promise<PersonalProject[]> {
    try {
        const client = createNotionClient()
        if (!client) return []

        const response = await client.databases.query({
            database_id: PERSONAL_PROJECTS_CONFIG.DATABASE_ID,
            sorts: [
                {
                    property: PERSONAL_PROJECTS_CONFIG.REQUIRED_FIELDS.TITLE,
                    direction: "ascending",
                },
            ],
        })

        const projects: PersonalProject[] = []

        for (const page of response.results) {
            try {
                const pageData = page as any
                const properties = pageData.properties

                // Extract title
                let title = ""
                const titleField = properties[PERSONAL_PROJECTS_CONFIG.REQUIRED_FIELDS.TITLE]

                if (titleField?.title?.[0]?.plain_text) {
                    title = titleField.title[0].plain_text
                } else if (titleField?.rich_text?.[0]?.plain_text) {
                    title = titleField.rich_text[0].plain_text
                }

                if (!title) continue

                // Extract image/file
                let image = ""
                const fileField = properties[PERSONAL_PROJECTS_CONFIG.REQUIRED_FIELDS.FILE]

                if (fileField?.files && Array.isArray(fileField.files) && fileField.files.length > 0) {
                    const file = fileField.files[0]
                    if (file.type === "file" && file.file?.url) {
                        image = file.file.url
                    } else if (file.type === "external" && file.external?.url) {
                        image = file.external.url
                    }
                }

                if (!image) continue

                // Create slug
                const slug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")

                // Extract description if available (assuming 'description' field exists, otherwise empty)
                const description = properties.description?.rich_text?.[0]?.plain_text || ""

                projects.push({
                    id: pageData.id,
                    title: title.toUpperCase(),
                    slug,
                    image,
                    height: "200px",
                    description,
                    lastEditedTime: pageData.last_edited_time,
                    createdTime: pageData.created_time,
                })
            } catch (error) {
                console.error("Error processing personal project record:", error)
            }
        }

        return projects
    } catch (error) {
        console.error("Error fetching personal projects:", error)
        return []
    }
}

// Cached version for ISR
export const getPersonalProjectsServer = unstable_cache(
    async () => fetchPersonalProjects(),
    ["personal-projects"],
    { revalidate: 1800, tags: ["cms:personal-projects"] }
)
