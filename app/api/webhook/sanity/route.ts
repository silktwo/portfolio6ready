
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { adapters } from '@/lib/cms-adapter'
import { warmCache } from '@/lib/cache'
import { GLOBAL_CMS_TAG } from '@/content.config'

export const dynamic = 'force-dynamic'

function verifySanitySignature(request: NextRequest, body: string, secret: string): boolean {
  const signature = request.headers.get('sanity-webhook-signature')
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
    
    const secret = process.env.SANITY_WEBHOOK_SECRET
    if (secret) {
      if (!verifySanitySignature(request, body, secret)) {
        console.warn('⚠️ Invalid Sanity webhook signature')
        return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
      }
      console.log('✅ Sanity webhook signature verified')
    }
    
    const adapter = adapters.sanity
    if (!adapter.isAvailable()) {
      return NextResponse.json({ message: 'Sanity adapter not available' }, { status: 400 })
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

    console.log(`🪝 Sanity webhook processed: ${actions.join(', ')}`)

    return NextResponse.json({
      received: true,
      processed: true,
      actions,
      warmedPaths: warmPaths
    })
  } catch (error) {
    console.error('Sanity webhook error:', error)
    return NextResponse.json(
      { 
        message: 'Error processing webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
