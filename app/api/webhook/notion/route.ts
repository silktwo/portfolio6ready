
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { adapters } from '@/lib/cms-adapter'
import { warmCache } from '@/lib/cache'
import { GLOBAL_CMS_TAG } from '@/content.config'

export const dynamic = 'force-dynamic'

function verifyNotionSignature(request: NextRequest, body: string, secret: string): boolean {
  // Notion uses HMAC-SHA256 signature verification
  const signature = request.headers.get('notion-signature')
  if (!signature) return false
  
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')
    
    return signature === expectedSignature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload = JSON.parse(body)
    
    // Verify webhook signature if secret is available
    const secret = process.env.NOTION_WEBHOOK_SECRET
    if (secret) {
      if (!verifyNotionSignature(request, body, secret)) {
        console.warn('⚠️ Invalid Notion webhook signature')
        return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
      }
      console.log('✅ Notion webhook signature verified')
    }

    const adapter = adapters.notion
    if (!adapter.isAvailable()) {
      return NextResponse.json({ message: 'Notion adapter not available' }, { status: 400 })
    }

    const { collection, slug } = adapter.webhookToCollectionAndSlug(payload)
    
    const actions: string[] = []
    const warmPaths: string[] = []

    // Always revalidate global tag
    revalidateTag(GLOBAL_CMS_TAG)
    actions.push(`Revalidated global tag: ${GLOBAL_CMS_TAG}`)

    // Revalidate specific collection if known
    if (collection) {
      const collectionTag = adapter.tagFor(collection)
      revalidateTag(collectionTag)
      actions.push(`Revalidated collection: ${collection} (tag: ${collectionTag})`)

      // Revalidate specific path if slug is known
      if (slug) {
        const path = collection === 'cases' ? `/work/${slug}` : `/${collection}/${slug}`
        revalidatePath(path)
        actions.push(`Revalidated path: ${path}`)
        warmPaths.push(path)
      }

      // Warm list pages
      const listPath = collection === 'cases' ? '/work' : `/${collection}`
      warmPaths.push(listPath)
      
      // Warm homepage as well
      warmPaths.push('/')
    }

    // Warm all paths
    if (warmPaths.length > 0) {
      await warmCache(warmPaths)
      actions.push(`Warmed ${warmPaths.length} paths`)
    }

    console.log(`🪝 Notion webhook processed: ${actions.join(', ')}`)

    return NextResponse.json({
      received: true,
      processed: true,
      actions,
      warmedPaths: warmPaths
    })
  } catch (error) {
    console.error('Notion webhook error:', error)
    return NextResponse.json(
      { 
        message: 'Error processing webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
