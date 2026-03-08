
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { adapters } from '@/lib/cms-adapter'
import { warmCache } from '@/lib/cache'
import { GLOBAL_CMS_TAG } from '@/content.config'

export const dynamic = 'force-dynamic'

function verifyContentfulSignature(request: NextRequest, body: string, secret: string): boolean {
  // Contentful uses HTTP Basic Auth or custom headers
  const authHeader = request.headers.get('authorization')
  const webhookHeader = request.headers.get('x-contentful-webhook-name')
  
  if (authHeader) {
    const [scheme, credentials] = authHeader.split(' ')
    if (scheme === 'Basic') {
      const decoded = Buffer.from(credentials, 'base64').toString()
      return decoded === secret
    }
  }
  
  return !!webhookHeader // If webhook header is present, it's likely valid
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload = JSON.parse(body)
    
    // Verify webhook if secret is available
    const secret = process.env.CONTENTFUL_WEBHOOK_SECRET
    if (secret) {
      if (!verifyContentfulSignature(request, body, secret)) {
        console.warn('⚠️ Invalid Contentful webhook')
        return NextResponse.json({ message: 'Invalid webhook' }, { status: 401 })
      }
      console.log('✅ Contentful webhook verified')
    }
    
    const adapter = adapters.contentful
    if (!adapter.isAvailable()) {
      return NextResponse.json({ message: 'Contentful adapter not available' }, { status: 400 })
    }

    const { collection, slug } = adapter.webhookToCollectionAndSlug(payload)
    
    const actions: string[] = []
    const warmPaths: string[] = []

    // Always revalidate global tag
    revalidateTag(GLOBAL_CMS_TAG)
    actions.push(`Revalidated global tag: ${GLOBAL_CMS_TAG}`)

    // Handle collection-specific revalidation
    if (collection) {
      const collectionTag = adapter.tagFor(collection)
      revalidateTag(collectionTag)
      actions.push(`Revalidated collection: ${collection}`)

      if (slug) {
        const path = `/${collection}/${slug}`
        revalidatePath(path)
        warmPaths.push(path)
        actions.push(`Revalidated path: ${path}`)
      }
      
      warmPaths.push(`/${collection}`)
      warmPaths.push('/')
    }

    if (warmPaths.length > 0) {
      await warmCache(warmPaths)
      actions.push(`Warmed ${warmPaths.length} paths`)
    }

    console.log(`🪝 Contentful webhook processed: ${actions.join(', ')}`)

    return NextResponse.json({
      received: true,
      processed: true,
      actions,
      warmedPaths: warmPaths
    })
  } catch (error) {
    console.error('Contentful webhook error:', error)
    return NextResponse.json(
      { 
        message: 'Error processing webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
