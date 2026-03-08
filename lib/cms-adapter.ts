
export interface CMSAdapter {
  list(collection: string): Promise<any[]>
  get(collection: string, slug: string): Promise<any | null>
  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string }
  tagFor(collection: string): string
  isAvailable(): boolean
}

export class NotionAdapter implements CMSAdapter {
  private isConfigured = false

  constructor() {
    // Check if Notion is configured
    const token = process.env.CASES_TOKEN || process.env.NOTION_TOKEN || process.env.PERSONAL_TOKEN
    const databaseId = process.env.CASES_DATABASE_ID || process.env.NOTION_DATABASE_ID
    this.isConfigured = !!(token && databaseId)
  }

  isAvailable(): boolean {
    return this.isConfigured
  }

  async list(collection: string): Promise<any[]> {
    if (collection === 'cases') {
      const { getCaseProjects } = await import('./notion-cases')
      const result = await getCaseProjects()
      return result.success ? result.data : []
    }
    return []
  }

  async get(collection: string, slug: string): Promise<any | null> {
    if (collection === 'cases') {
      const { getCaseBySlug } = await import('./notion-cases')
      return await getCaseBySlug(slug)
    }
    return null
  }

  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string } {
    // Notion webhook parsing logic
    return { collection: 'cases' }
  }

  tagFor(collection: string): string {
    return `cms:${collection}`
  }
}

export class ContentfulAdapter implements CMSAdapter {
  isAvailable(): boolean {
    return !!(process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_ACCESS_TOKEN)
  }

  async list(collection: string): Promise<any[]> {
    if (!this.isAvailable()) return []
    // Contentful implementation would go here
    return []
  }

  async get(collection: string, slug: string): Promise<any | null> {
    if (!this.isAvailable()) return null
    // Contentful implementation would go here
    return null
  }

  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string } {
    return {}
  }

  tagFor(collection: string): string {
    return `cms:${collection}`
  }
}

export class SanityAdapter implements CMSAdapter {
  isAvailable(): boolean {
    return !!(process.env.SANITY_PROJECT_ID && process.env.SANITY_DATASET)
  }

  async list(collection: string): Promise<any[]> {
    if (!this.isAvailable()) return []
    // Sanity implementation would go here
    return []
  }

  async get(collection: string, slug: string): Promise<any | null> {
    if (!this.isAvailable()) return null
    // Sanity implementation would go here
    return null
  }

  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string } {
    // Sanity webhook format
    const docType = payload?._type
    const slug = payload?.slug?.current
    return { collection: docType, slug }
  }

  tagFor(collection: string): string {
    return `cms:${collection}`
  }
}

export class StrapiAdapter implements CMSAdapter {
  isAvailable(): boolean {
    return !!(process.env.STRAPI_URL && process.env.STRAPI_TOKEN)
  }

  async list(collection: string): Promise<any[]> {
    if (!this.isAvailable()) return []
    // Strapi implementation would go here
    return []
  }

  async get(collection: string, slug: string): Promise<any | null> {
    if (!this.isAvailable()) return null
    // Strapi implementation would go here
    return null
  }

  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string } {
    // Strapi webhook format
    const model = payload?.model
    const entry = payload?.entry
    const slug = entry?.slug || entry?.Slug
    return { collection: model, slug }
  }

  tagFor(collection: string): string {
    return `cms:${collection}`
  }
}

export class GhostAdapter implements CMSAdapter {
  isAvailable(): boolean {
    return !!(process.env.GHOST_URL && process.env.GHOST_ADMIN_API_KEY)
  }

  async list(collection: string): Promise<any[]> {
    if (!this.isAvailable()) return []
    // Ghost implementation would go here
    return []
  }

  async get(collection: string, slug: string): Promise<any | null> {
    if (!this.isAvailable()) return null
    // Ghost implementation would go here
    return null
  }

  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string } {
    // Ghost webhook format
    const post = payload?.post?.current || payload?.page?.current
    const collection = payload?.post ? 'posts' : 'pages'
    const slug = post?.slug
    return { collection, slug }
  }

  tagFor(collection: string): string {
    return `cms:${collection}`
  }
}

export class HygraphAdapter implements CMSAdapter {
  isAvailable(): boolean {
    return !!(process.env.HYGRAPH_URL && process.env.HYGRAPH_TOKEN)
  }

  async list(collection: string): Promise<any[]> {
    if (!this.isAvailable()) return []
    // Hygraph implementation would go here
    return []
  }

  async get(collection: string, slug: string): Promise<any | null> {
    if (!this.isAvailable()) return null
    // Hygraph implementation would go here
    return null
  }

  webhookToCollectionAndSlug(payload: any): { collection?: string; slug?: string } {
    // Hygraph webhook format
    const operation = payload?.operation
    const data = payload?.data
    const typename = data?.__typename
    const slug = data?.slug
    return { collection: typename, slug }
  }

  tagFor(collection: string): string {
    return `cms:${collection}`
  }
}

// Registry of available adapters
export const adapters = {
  notion: new NotionAdapter(),
  contentful: new ContentfulAdapter(),
  sanity: new SanityAdapter(),
  strapi: new StrapiAdapter(),
  ghost: new GhostAdapter(),
  hygraph: new HygraphAdapter(),
}

// Get active adapters (only those that are configured)
export function getActiveAdapters(): Record<string, CMSAdapter> {
  const active: Record<string, CMSAdapter> = {}
  
  console.log('\n🔍 Detecting CMS platforms...')
  
  Object.entries(adapters).forEach(([name, adapter]) => {
    if (adapter.isAvailable()) {
      active[name] = adapter
      console.log(`✅ CMS Adapter activated: ${name}`)
    } else {
      console.log(`⏭️  CMS Adapter skipped: ${name} (not configured)`)
    }
  })
  
  console.log(`\n📊 Total active CMS platforms: ${Object.keys(active).length}`)
  
  return active
}

// Log active collections and tags on startup
export function logCMSConfiguration() {
  const { contentRegistry, GLOBAL_CMS_TAG } = require('../content.config')
  const activeAdapters = getActiveAdapters()
  
  console.log('\n📋 Content Collections Configuration:')
  console.log(`   Global tag: ${GLOBAL_CMS_TAG}`)
  
  contentRegistry.forEach((config: any) => {
    const isActive = activeAdapters[config.provider]?.isAvailable() || false
    const status = isActive ? '✅' : '❌'
    console.log(`   ${status} ${config.key}: ${config.path} (tag: ${config.tag}, provider: ${config.provider})`)
  })
  
  console.log('\n🚀 CMS caching system initialized\n')
}
