# Deployment Fixes & Caching Implementation

## Deployment Issues - FIXED ✅

### 1. Removed Cron Jobs from vercel.json
- **Issue:** vercel.json contained cron jobs which are only available on paid Vercel plans
- **Fix:** Deleted vercel.json entirely (it only contained cron configuration)
- **Result:** Deployment will now succeed on free Vercel plan

### 2. Added vercel-build Script
- **File:** package.json
- **Change:** Added `"vercel-build": "next build"` script
- **Change:** Added pnpm configuration `"pnpm": { "onlyBuiltDependencies": [] }`
- **Result:** Vercel will now use the correct build command

### 3. Build Verification
- **Test:** Ran `pnpm run build` successfully
- **Result:** All pages compiled, 14/14 static pages generated

## ISR Caching Implementation ✅

### Server Components (ISR Enabled)
These pages use **Incremental Static Regeneration** with 30-minute revalidation:

1. **`app/work/page.tsx`**
   - Added: `export const revalidate = 1800`
   - Cache Duration: 30 minutes
   - Pages are statically generated and revalidated every 30 minutes

2. **`app/work/[slug]/page.tsx`**
   - Added: `export const revalidate = 1800`
   - Cache Duration: 30 minutes
   - Individual project pages cached for 30 minutes

### Client Components (API-Level Caching)
These pages are client components with interactivity. Caching happens through the API/data layer:

1. **`app/page.tsx`** (Homepage)
   - Fetches data from `/api/cases`
   - Caching handled by `lib/cache.ts` using `unstable_cache` with tags
   
2. **`app/personal-projects/page.tsx`**
   - Fetches from `/api/projects`
   - API-level caching via data layer

3. **`app/commercial/page.tsx`**
   - Fetches from `/api/commercial`
   - API-level caching via data layer

4. **`app/journal/page.tsx`**
   - Fetches from `/api/blog`
   - API-level caching via data layer

### Caching Infrastructure

**Data Layer Caching (`lib/cache.ts`):**
- Uses Next.js `unstable_cache` with cache tags
- Revalidation time: 1800 seconds (30 minutes)
- Tags: `cms:all`, `cms:cases`, `cms:blog`, etc.

**Cache Headers (`next.config.mjs`):**
```javascript
Cache-Control: public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600
```
- Applies to all non-API routes
- API routes remain dynamic (no cache headers)

## Manual Cache Invalidation

### Revalidation API Endpoint
**Route:** `/api/revalidate`

**Environment Variable:**
- `REVALIDATE_SECRET=XL9x4WjLT85waaYhMGeE846oyA998M6X`
- Added to `.env.local`
- **Important:** Add this to Vercel environment variables in dashboard

### Usage Examples

**Revalidate all caches:**
```
GET /api/revalidate?secret=XL9x4WjLT85waaYhMGeE846oyA998M6X
```

**Revalidate specific collection:**
```
GET /api/revalidate?secret=XL9x4WjLT85waaYhMGeE846oyA998M6X&collection=cases
```

**Revalidate specific path:**
```
GET /api/revalidate?secret=XL9x4WjLT85waaYhMGeE846oyA998M6X&path=/work
```

**Revalidate by tag:**
```
GET /api/revalidate?secret=XL9x4WjLT85waaYhMGeE846oyA998M6X&tag=cms:cases
```

## How ISR Works on Vercel

1. **First Request:** Page is generated and cached for 30 minutes
2. **Within 30 minutes:** Cached version is served instantly
3. **After 30 minutes:** Next request triggers revalidation in background
4. **Subsequent Requests:** New cached version is served

## Next Steps for Vercel Deployment

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "fix: deployment issues and implement ISR caching"
   git push origin main
   ```

2. **Add Environment Variable in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `REVALIDATE_SECRET=XL9x4WjLT85waaYhMGeE846oyA998M6X`
   - Add all your Notion tokens and database IDs from .env.local

3. **Deploy:**
   - Vercel will automatically deploy on push
   - Or manually trigger deployment from Vercel dashboard

## Summary

✅ **Deployment Fixed:**
- Removed incompatible crons from vercel.json
- Added vercel-build script to package.json
- Build succeeds with all pages generated

✅ **Caching Implemented:**
- Server components use ISR with 30-minute revalidation
- Cache headers configured (excluding API routes)
- Manual revalidation API available
- Data layer caching via unstable_cache with tags

✅ **Workflow Configured:**
- Next.js dev server running on port 5000
- Bound to 0.0.0.0 for Replit environment

## Cache Duration Summary

| Page/Route | Cache Strategy | Duration |
|---|---|---|
| `/work` | ISR (Server Component) | 30 minutes |
| `/work/[slug]` | ISR (Server Component) | 30 minutes |
| `/` (Homepage) | Data Layer + API Cache | Via unstable_cache |
| `/personal-projects` | Data Layer + API Cache | Via unstable_cache |
| `/commercial` | Data Layer + API Cache | Via unstable_cache |
| `/journal` | Data Layer + API Cache | Via unstable_cache |
| API Routes | Dynamic (no cache) | Force dynamic |
