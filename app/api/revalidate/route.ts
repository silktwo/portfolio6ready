
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { warmCache } from '@/lib/cache'
import { contentRegistry, GLOBAL_CMS_TAG } from '@/content.config'

export const dynamic = 'force-dynamic'

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

    // Handle tag revalidation
    if (tag) {
      revalidateTag(tag)
      actions.push(`Revalidated tag: ${tag}`)
    }

    // Handle collection revalidation
    if (collection) {
      const collectionTag = `cms:${collection}`
      revalidateTag(collectionTag)
      actions.push(`Revalidated collection: ${collection} (tag: ${collectionTag})`)
    }

    // Handle path revalidation
    if (path) {
      revalidatePath(path)
      actions.push(`Revalidated path: ${path}`)
    }

    // Handle warming
    if (warm) {
      const warmPaths = warm.split(',').map(p => p.trim()).filter(Boolean)
      await warmCache(warmPaths)
      actions.push(`Warmed ${warmPaths.length} paths`)
    }

    // Default action if nothing specified
    if (!tag && !collection && !path && !warm) {
      revalidateTag(GLOBAL_CMS_TAG)
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
