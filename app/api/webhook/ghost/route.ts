
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { adapters } from '@/lib/cms-adapter'
import { warmCache } from '@/lib/cache'
import { GLOBAL_CMS_TAG } from '@/content.config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload = JSON.parse(body)
    
    const adapter = adapters.ghost
    if (!adapter.isAvailable()) {
      return NextResponse.json({ message: 'Ghost adapter not available' }, { status: 400 })
    }

    const { collection, slug } = adapter.webhookToCollectionAndSlug(payload)
    
    const actions: string[] = []
    const warmPaths: string[] = []

    revalidateTag(GLOBAL_CMS_TAG)
    actions.push(`Revalidated global tag: ${GLOBAL_CMS_TAG}`)

    if (collection) {
      const collectionTag = adapter.tagFor(collection)
      revalidateTag(collectionTag)
      actions.push(`Revalidated collection: ${collection}`)

      if (slug) {
        const path = `/${collection}/${slug}`
        revalidatePath(path)
        warmPaths.push(path)
      }
      
      warmPaths.push(`/${collection}`, '/')
    }

    if (warmPaths.length > 0) {
      await warmCache(warmPaths)
      actions.push(`Warmed ${warmPaths.length} paths`)
    }

    console.log(`🪝 Ghost webhook processed: ${actions.join(', ')}`)

    return NextResponse.json({
      received: true,
      processed: true,
      actions,
      warmedPaths: warmPaths
    })
  } catch (error) {
    console.error('Ghost webhook error:', error)
    return NextResponse.json(
      { 
        message: 'Error processing webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
