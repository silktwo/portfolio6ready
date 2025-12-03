import { getBlogPosts, type BlogPost } from "@/lib/notion"
import JournalClient from "@/components/journal-client"
import { unstable_cache } from "next/cache"

// Revalidate every 30 minutes
export const revalidate = 1800

// Wrap getBlogPosts with unstable_cache for ISR
const getCachedBlogPosts = unstable_cache(
  async () => getBlogPosts(),
  ["blog-posts"],
  { revalidate: 1800, tags: ["cms:blog-posts"] }
)

export default async function Journal() {
  // Fetch data server-side with caching
  const posts = await getCachedBlogPosts() as BlogPost[] || []

  console.log(`📓 Journal page rendered with ${posts.length} posts (cached)`)

  return <JournalClient initialPosts={posts} />
}