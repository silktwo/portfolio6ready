import Image from "next/image"

interface FooterProps {
  className?: string
  showCaseLogo?: boolean
}

export default function Footer({ className = "", showCaseLogo = false }: FooterProps) {
  const socialLinks = [
    { name: "instagram", url: "https://www.instagram.com/tiredxs/" },
    { name: "telegram", url: "http://t.me/tiredxs" },
    { name: "mail", url: "mailto:kifuliak66@gmail.com" },
    { name: "read.cv", url: "https://read.cv/tiredxs" },
    { name: "are.na", url: "https://www.are.na/dima-kifuliak" },
  ]

  return (
    <footer className={`w-full py-4 mt-8 ${className}`}>
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-[59px] h-[30px] relative">
              <Image
                src="/logo-footer.svg"
                alt="Dmytro Kifuliak Logo"
                width={59}
                height={30}
                className="w-full h-full dark:invert"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                }}
              />
            </div>
            <span className="text-[12px] font-medium text-black dark:text-[#e3e3e3]">Dmytro Kifuliak. © 2026</span>
          </div>
        </div>

        {showCaseLogo && (
          <div className="mt-4 mb-2">
            <div className="w-[307px] h-[159px] max-w-full relative">
              <Image
                src="/logo-case-footer.svg"
                alt="Case Logo"
                width={307}
                height={159}
                className="w-full h-full dark:invert"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-black dark:text-[#e3e3e3]">SOCIAL:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium text-black hover:underline dark:text-[#e3e3e3]"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
