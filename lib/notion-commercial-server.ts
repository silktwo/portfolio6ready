import { Client } from "@notionhq/client"
import { unstable_cache } from "next/cache"

// Commercial Projects Database Configuration
const COMMERCIAL_PROJECTS_CONFIG = {
    DATABASE_ID: (process.env.COMMERCIAL_DATABASE_ID || "20955dd5594d8064aeffc4761a8a7c38").replace(/-/g, ""),
    REQUIRED_FIELDS: {
        TITLE: "projectTitle",
        TAGS: "categoryTags",
        THUMBNAIL: "thumbnail",
        LINK: "link",
    },
}

export interface CommercialProject {
    id: string
    title: string
    categories: string[]
    image: string
    link: string
}

// Create Notion client with multiple token fallbacks
function createNotionClient(): Client | null {
    const tokens = [
        process.env.COMMERCIAL_TOKEN,
        process.env.NOTION_TOKEN,
        process.env.PERSONAL_TOKEN,
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
async function fetchCommercialProjects(): Promise<CommercialProject[]> {
    try {
        const client = createNotionClient()
        if (!client) return []

        const response = await client.databases.query({
            database_id: COMMERCIAL_PROJECTS_CONFIG.DATABASE_ID,
            page_size: 50,
        })

        const projects: CommercialProject[] = []

        for (const page of response.results) {
            try {
                const pageData = page as any
                const properties = pageData.properties

                // Extract title
                let title = ""
                const titleField = properties[COMMERCIAL_PROJECTS_CONFIG.REQUIRED_FIELDS.TITLE]

                if (titleField?.title?.[0]?.plain_text) {
                    title = titleField.title[0].plain_text
                } else if (titleField?.rich_text?.[0]?.plain_text) {
                    title = titleField.rich_text[0].plain_text
                }

                // Extract thumbnail
                let image = ""
                const thumbnailField = properties[COMMERCIAL_PROJECTS_CONFIG.REQUIRED_FIELDS.THUMBNAIL]

                if (thumbnailField?.files && thumbnailField.files[0]) {
                    const file = thumbnailField.files[0]
                    if (file.type === "file" && file.file?.url) {
                        image = file.file.url
                    } else if (file.type === "external" && file.external?.url) {
                        image = file.external.url
                    }
                }

                // Extract link
                let link = ""
                const linkField = properties[COMMERCIAL_PROJECTS_CONFIG.REQUIRED_FIELDS.LINK]
                if (linkField?.url) {
                    link = linkField.url
                }

                // Extract categories
                let categories: string[] = []
                const categoriesField = properties[COMMERCIAL_PROJECTS_CONFIG.REQUIRED_FIELDS.TAGS]
                if (categoriesField?.multi_select) {
                    categories = categoriesField.multi_select.map((cat: any) => cat.name).filter(Boolean)
                }

                if (title && image && link) {
                    projects.push({
                        id: pageData.id,
                        title,
                        categories,
                        image,
                        link,
                    })
                }
            } catch (error) {
                console.error("Error processing commercial project record:", error)
            }
        }

        return projects
    } catch (error) {
        console.error("Error fetching commercial projects:", error)
        return []
    }
}

// Cached version for ISR
export const getCommercialProjectsServer = unstable_cache(
    async () => fetchCommercialProjects(),
    ["commercial-projects"],
    { revalidate: 1800, tags: ["cms:commercial-projects"] }
)
