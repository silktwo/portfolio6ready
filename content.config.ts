
export interface ContentConfig {
  key: string
  path: string
  tag: string
  provider: string
  revalidate?: number
}

export const contentRegistry: ContentConfig[] = [
  {
    key: 'cases',
    path: '/work',
    tag: 'cms:cases',
    provider: 'notion',
    revalidate: 1800
  },
  {
    key: 'case',
    path: '/work/[slug]',
    tag: 'cms:cases',
    provider: 'notion',
    revalidate: 1800
  },
  {
    key: 'blog',
    path: '/journal',
    tag: 'cms:blog',
    provider: 'notion',
    revalidate: 1800
  },
  {
    key: 'post',
    path: '/journal/[slug]',
    tag: 'cms:blog',
    provider: 'notion',
    revalidate: 1800
  }
]

export function getConfigForCollection(collection: string): ContentConfig | undefined {
  return contentRegistry.find(config => config.key === collection)
}

export function getConfigForPath(path: string): ContentConfig | undefined {
  return contentRegistry.find(config => config.path === path)
}

// Default cache settings
export const DEFAULT_REVALIDATE = 1800 // 30 minutes
export const GLOBAL_CMS_TAG = 'cms:all'
