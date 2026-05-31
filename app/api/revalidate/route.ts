
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { warmCache } from '@/lib/cache'
import { GLOBAL_CMS_TAG } from '@/content.config'

export const dynamic = 'force-dynamic'

function getDefaultWarmPaths(collection?: string, path?: string | null): string[] {
  const paths = new Set<string>()

  if (collection === 'cases') {
    paths.add('/')
    paths.add('/work')
  } else if (collection) {
    paths.add(`/${collection}`)
  }

  if (path) {
    paths.add(path)
  }

  return Array.from(paths)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret')
  const authHeader = request.headers.get('x-vercel-cron')
  
  // Auth check
  const expectedSecret = process.env.REVALIDATION_SECRET
  if (expectedSecret && !secret && authHeader !== '1') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  
  if (expectedSecret && secret !== expectedSecret && authHeader !== '1') {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    const tag = searchParams.get('tag')
    const collection = searchParams.get('collection')
    const path = searchParams.get('path')
    const warm = searchParams.get('warm')

    const actions: string[] = []
    const warmPaths = new Set<string>()

    // Handle tag revalidation
    if (tag) {
      revalidateTag(tag, "max")
      actions.push(`Revalidated tag: ${tag}`)
    }

    // Handle collection revalidation
    if (collection) {
      const collectionTag = `cms:${collection}`
      revalidateTag(collectionTag, "max")
      actions.push(`Revalidated collection: ${collection} (tag: ${collectionTag})`)

      for (const warmPath of getDefaultWarmPaths(collection)) {
        revalidatePath(warmPath)
        warmPaths.add(warmPath)
      }
    }

    // Handle path revalidation
    if (path) {
      revalidatePath(path)
      actions.push(`Revalidated path: ${path}`)
      warmPaths.add(path)
    }

    // Handle warming
    if (warm) {
      warm.split(',').map(p => p.trim()).filter(Boolean).forEach(p => warmPaths.add(p))
    }

    if (warmPaths.size > 0) {
      await warmCache(Array.from(warmPaths), request.nextUrl.origin)
      actions.push(`Warmed ${warmPaths.size} paths`)
    }

    // Default action if nothing specified
    if (!tag && !collection && !path && !warm) {
      revalidateTag(GLOBAL_CMS_TAG, "max")
      actions.push(`Revalidated global tag: ${GLOBAL_CMS_TAG}`)
    }

    console.log(`🔄 Revalidation completed: ${actions.join(', ')}`)

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      actions
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { 
        message: 'Error revalidating',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
