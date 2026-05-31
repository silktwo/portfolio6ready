import Link from "next/link"

interface PortfolioStateProps {
  title: string
  message: string
  actionHref?: string
  actionLabel?: string
}

export default function PortfolioState({
  title,
  message,
  actionHref = "/",
  actionLabel = "Back to home",
}: PortfolioStateProps) {
  return (
    <main className="bg-white min-h-screen flex items-center">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
        <div className="max-w-[520px]">
          <p className="font-bold text-black text-[11px] leading-[normal] uppercase mb-3">
            {title}
          </p>
          <p className="font-medium text-black text-[12px] leading-[16px] mb-6">
            {message}
          </p>
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center bg-black text-[#e3e3e3] rounded-full px-4 h-8 text-[11px] font-medium hover:bg-gray-800 transition-colors"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </main>
  )
}
