import { PageLoadMask } from "@/components/page-load-mask"

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageLoadMask>{children}</PageLoadMask>
}
