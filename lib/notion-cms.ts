import { Client } from "@notionhq/client"

// Unified Notion CMS configuration
export const NOTION_CONFIG = {
  // Personal Projects Database
  PERSONAL_PROJECTS: {
    DATABASE_ID: "20955dd5594d809999c8c3562cc7e95f",
    TOKEN_ENV: "PERSONAL_TOKEN",
    FIELDS: {
      TITLE: "workTitle",
      FILE: "workFile",
    },
  },
  // Blog Posts Database
  BLOG_POSTS: {
    DATABASE_ID: "20855dd5594d80a8b3e2cdf91d74eb53",
    TOKEN_ENV: "NOTION_TOKEN",
    FIELDS: {
      TITLE: "blogPost",
      DATE: "date",
      PUBLISH: "publish",
      ATTACHMENTS: "attachments",
    },
  },
}

// Create Notion client with fallback tokens
function createNotionClient(preferredTokenEnv?: string): Client | null {
  const tokens = [
    preferredTokenEnv ? process.env[preferredTokenEnv] : null,
    process.env.NOTION_TOKEN,
    process.env.PERSONAL_TOKEN,
    "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", // Fallback token
    "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", // Fallback token
  ].filter(Boolean)

  for (const token of tokens) {
    if (token) {
      try {
        return new Client({ auth: token })
      } catch (error) {
        console.warn(`Failed to create Notion client with token: ${token.slice(0, 10)}...`)
        continue
      }
    }
  }

  console.error("No valid Notion token found")
  return null
}

// Test database connection
export async function testDatabaseConnection(
  databaseId: string,
  tokenEnv?: string,
): Promise<{
  success: boolean
  error?: string
  recordCount?: number
}> {
  try {
    const notion = createNotionClient(tokenEnv)
    if (!notion) {
      return { success: false, error: "No valid Notion client" }
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 1,
    })

    return {
      success: true,
      recordCount: response.results.length,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Validate database schema
export async function validateDatabaseSchema(
  databaseId: string,
  requiredFields: string[],
  tokenEnv?: string,
): Promise<{
  valid: boolean
  missingFields: string[]
  availableFields: string[]
}> {
  try {
    const notion = createNotionClient(tokenEnv)
    if (!notion) {
      return { valid: false, missingFields: requiredFields, availableFields: [] }
    }

    const database = await notion.databases.retrieve({ database_id: databaseId })
    const availableFields = Object.keys(database.properties)
    const missingFields = requiredFields.filter((field) => !availableFields.includes(field))

    return {
      valid: missingFields.length === 0,
      missingFields,
      availableFields,
    }
  } catch (error) {
    console.error("Error validating database schema:", error)
    return { valid: false, missingFields: requiredFields, availableFields: [] }
  }
}

export { createNotionClient }
