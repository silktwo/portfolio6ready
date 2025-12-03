"use client"
// Force rebuild

import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import BackToTop from "@/components/back-to-top"
import { useRouter } from "next/navigation"
import { getCaseProjects, type CaseProject } from "@/lib/notion-cases"

// Image Modal Component with full-screen display
function ImageModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: {
  images: { src: string; alt: string }[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        onPrevious()
      } else if (e.key === "ArrowRight") {
        onNext()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose, onNext, onPrevious])

  if (!isOpen || !images[currentIndex]) return null

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={onClose}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 text-3xl font-light"
      >
        ×
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrevious()
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 text-2xl bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
        >
          ‹
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 text-2xl bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
        >
          ›
        </button>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      <img
        src={currentImage.src || "/placeholder.svg"}
        alt={currentImage.alt}
        className="max-w-[100vw] max-h-[100vh] object-contain block"
        style={{ margin: 0, padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}


interface TeamMember {
  role: string
  name: string
  isPrimary?: boolean
}

interface Props {
  params: {
    slug: string
  }
  initialProject: CaseProject
  dataSource: "database" | "fallback"
}

export default function WorkPageClient({ params, initialProject, dataSource }: Props) {
  const router = useRouter()
  const [caseProject, setCaseProject] = useState<CaseProject>(initialProject)
  const [allProjects, setAllProjects] = useState<CaseProject[]>([initialProject])
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState("project")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentImageArray, setCurrentImageArray] = useState<string[]>([])

  // Prepare images for modal
  const createModalImages = (mediaArray: string[] | undefined) => {
    if (!mediaArray) return []
    return mediaArray.map((image, index) => ({
      src: image,
      alt: `${caseProject.projectTitle} - Image ${index + 1}`,
    }))
  }

  const openModal = (index: number, mediaArray: string[] | undefined) => {
    if (mediaArray && mediaArray[index]) {
      setCurrentImageArray(mediaArray)
      setCurrentImageIndex(index)
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentImageIndex(0)
    setCurrentImageArray([])
  }

  const nextImage = () => {
    if (currentImageArray.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % currentImageArray.length)
    }
  }

  const previousImage = () => {
    if (currentImageArray.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + currentImageArray.length) % currentImageArray.length)
    }
  }


  // Social links
  const socialLinks = [
    { name: "instagram", url: "https://www.instagram.com/tiredxs/" },
    { name: "telegram", url: "http://t.me/tiredxs" },
    { name: "mail", url: "mailto:kifuliak66@gmail.com" },
    { name: "read.cv", url: "https://read.cv/tiredxs" },
    { name: "are.na", url: "https://www.are.na/dima-kifuliak" },
  ]

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        setLoading(true)
        const result = await getCaseProjects()

        if (result.success && result.data.length > 0) {
          // Add the current project if it's not from the database
          if (dataSource === "fallback") {
            const existingProject = result.data.find((p) => p.slug === initialProject.slug)
            if (!existingProject) {
              result.data.push(initialProject)
            }
          }

          setAllProjects(result.data)

          // Find current project index
          const index = result.data.findIndex((p) => p.slug === params.slug)
          setCurrentProjectIndex(index >= 0 ? index : 0)
        } else if (dataSource === "fallback") {
          // If we're using fallback data and database fetch failed, just use the initial project
          setAllProjects([initialProject])
        }
      } catch (error) {
        console.error("Failed to fetch all projects:", error)
        // If fetch fails, ensure we at least have the current project
        setAllProjects([initialProject])
      } finally {
        setLoading(false)
      }
    }

    fetchAllProjects()
  }, [params.slug, initialProject, dataSource])

  // Parse team members from string
  const parseTeamMembers = (teamString: string): TeamMember[] => {
    if (!teamString) return []

    // Try to parse team members from format like "Designer: John Doe, Creative Director: Jane Smith"
    const members: TeamMember[] = []
    const parts = teamString.split(",").map((part) => part.trim())

    parts.forEach((part, index) => {
      const roleSplit = part.split(":")
      if (roleSplit.length === 2) {
        members.push({
          role: roleSplit[0].trim(),
          name: roleSplit[1].trim(),
          isPrimary: index === 0, // First person is primary
        })
      } else {
        // If format doesn't match, just add as is
        members.push({
          role: "",
          name: part,
          isPrimary: index === 0,
        })
      }
    })

    return members
  }

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setActiveSection(sectionId)
    }
  }

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["project", "info", "gallery", "drafts", "contact"]
      const scrollPosition = window.scrollY + window.innerHeight / 2

      // Check if we're near the bottom of the page
      const isNearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100

      if (isNearBottom) {
        setActiveSection("contact")
        return
      }

      // Otherwise, find the section that's currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop } = element
          if (scrollPosition >= offsetTop) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Add useEffect to ensure page starts at the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const teamMembers = parseTeamMembers(caseProject.team)
  const hasDrafts = caseProject.draftProcess && caseProject.draftProcess.length > 0

  return (
    <div className="bg-white min-h-screen overflow-x-hidden overscroll-y-none">
      {dataSource === "fallback" && (
        <div className="fixed top-20 left-0 right-0 z-50 flex justify-center">
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-md shadow-md">
            <p className="text-sm text-yellow-800">
              ⚠️ Using fallback data.{" "}
              <a href="/cases-debug" className="underline">
                Debug connection
              </a>{" "}
              to use live data.
            </p>
          </div>
        </div>
      )}

      {/* Navigation - Overlaid on top of image */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
          <Navigation />
        </div>
      </div>

      {/* Case Navigation Block - Fixed - Responsive positioning */}
      <div className="fixed top-[30px] right-[20px] sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:right-auto z-50">
        <div className="bg-black rounded-xl p-1">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => scrollToSection("project")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${activeSection === "project"
                ? "bg-[#eaeaea] text-[#202020]"
                : "bg-transparent text-[#eaeaea] hover:bg-gray-800"
                }`}
            >
              {caseProject.projectTitle.toUpperCase()}
            </button>
            <button
              onClick={() => scrollToSection("info")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${activeSection === "info"
                ? "bg-[#eaeaea] text-[#202020]"
                : "bg-transparent text-[#eaeaea] hover:bg-gray-800"
                }`}
            >
              PROJECT INFO
            </button>
            <button
              onClick={() => scrollToSection("gallery")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${activeSection === "gallery"
                ? "bg-[#eaeaea] text-[#202020]"
                : "bg-transparent text-[#eaeaea] hover:bg-gray-800"
                }`}
            >
              GALLERY
            </button>
            {hasDrafts && (
              <button
                onClick={() => scrollToSection("drafts")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${activeSection === "drafts"
                  ? "bg-[#eaeaea] text-[#202020]"
                  : "bg-transparent text-[#eaeaea] hover:bg-gray-800"
                  }`}
              >
                DRAFTS
              </button>
            )}
            <button
              onClick={() => scrollToSection("contact")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${activeSection === "contact"
                ? "bg-[#eaeaea] text-[#202020]"
                : "bg-transparent text-[#eaeaea] hover:bg-gray-800"
                }`}
            >
              CONTACT
            </button>
          </div>
        </div>
      </div>

      {/* Cover Image - Full Screen, starts from top */}
      <section id="project" className="w-full h-screen relative">
        <img
          src={caseProject.introImage || "/placeholder.svg"}
          alt={caseProject.projectTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </section>

      {/* Project Information Section */}
      <section id="info" className="pt-16 pb-0">
        <div className="max-w-[1200px] mx-auto px-[20px] sm:px-[30px]">
          {/* Project Information Header */}
          <div className="text-center mb-8">
            <h2 className="font-bold text-black text-[11px] tracking-[0] leading-[normal] mb-4">PROJECT INFORMATION</h2>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-12 max-w-[800px] mx-auto">
            {/* Description - Left Side */}
            <div className="flex-1">
              <h3 className="font-medium text-black text-[11px] mb-4 tracking-[0] leading-[normal]">DESCRIPTION:</h3>
              <p className="font-medium text-black text-[12px] tracking-[0] leading-[normal]">
                {caseProject.description}
              </p>
            </div>

            {/* Team Credits - Right Side with Roboto Mono */}
            <div className="w-full lg:w-[300px]">
              <h3 className="font-medium text-black text-[11px] mb-4 tracking-[0] leading-[normal]">TEAM:</h3>
              <div className="space-y-2">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className={`font-mono text-[11px] tracking-[0] leading-[normal] ${member.isPrimary ? "text-black" : "text-[#939393]"
                      }`}
                    style={{ fontFamily: "Roboto Mono, monospace" }}
                  >
                    {member.role ? `${member.role}: ${member.name}` : member.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width images without gaps after description */}
        {caseProject.projectMedia && caseProject.projectMedia.length > 0 && (
          <div className="mt-16" style={{ lineHeight: 0 }}>
            {caseProject.projectMedia.slice(0, 3).map((image, index) => {
              // Pattern: 2 side-by-side (index 0–1) → 1 full (index 2)
              const isFullWidth = index === 2
              const isPairStart = index === 0

              if (isFullWidth) {
                // Full-width image (3rd image)
                return (
                  <div
                    key={index}
                    className="w-full cursor-pointer block"
                    style={{ lineHeight: 0, margin: 0, padding: 0 }}
                    onClick={() => openModal(index, caseProject.projectMedia)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${caseProject.projectTitle} - Image ${index + 1}`}
                      className="w-full h-auto object-cover block hover:opacity-90 transition-opacity"
                      style={{ display: "block", margin: 0, padding: 0, lineHeight: 0 }}
                    />
                  </div>
                )
              } else if (isPairStart) {
                // Pair: 0th and 1st - square format
                const nextImage = caseProject.projectMedia[1]
                return (
                  <div key={`pair-${index}`} className="flex" style={{ gap: 0, lineHeight: 0, margin: 0, padding: 0 }}>
                    <div
                      className="w-1/2 cursor-pointer block aspect-square"
                      style={{ margin: 0, padding: 0, lineHeight: 0 }}
                      onClick={() => openModal(0, caseProject.projectMedia)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${caseProject.projectTitle} - Image 1`}
                        className="w-full h-full object-cover block hover:opacity-90 transition-opacity"
                        style={{ display: "block", margin: 0, padding: 0, lineHeight: 0 }}
                      />
                    </div>
                    {nextImage && (
                      <div
                        className="w-1/2 cursor-pointer block aspect-square"
                        style={{ margin: 0, padding: 0, lineHeight: 0 }}
                        onClick={() => openModal(1, caseProject.projectMedia)}
                      >
                        <img
                          src={nextImage || "/placeholder.svg"}
                          alt={`${caseProject.projectTitle} - Image 2`}
                          className="w-full h-full object-cover block hover:opacity-90 transition-opacity"
                          style={{ display: "block", margin: 0, padding: 0, lineHeight: 0 }}
                        />
                      </div>
                    )}
                  </div>
                )
              } else {
                // skip pair end (index 1), as it's rendered in the block above
                return null
              }
            })}
          </div>
        )}
      </section>

      {/* Gallery Section - No title, continue alternating layout */}
      <section id="gallery">
        {/* Continue 2→full pattern without gaps */}
        {caseProject.projectMedia && caseProject.projectMedia.length > 3 && (
          <div style={{ lineHeight: 0 }}>
            {caseProject.projectMedia.slice(3).map((image, index) => {
              const actualIndex = index + 3 // real index in the full array
              // Pattern should remain 2→full in global index:
              // groups of 3: [two side-by-side: mod 3 = 1,2] → [full: mod 3 = 0]
              const mod = (actualIndex + 1) % 3
              const isFullWidth = mod === 0
              const isPairStart = mod === 1

              if (isFullWidth) {
                // Full-width image
                return (
                  <div
                    key={actualIndex}
                    className="w-full cursor-pointer block"
                    style={{ lineHeight: 0, margin: 0, padding: 0 }}
                    onClick={() => openModal(actualIndex, caseProject.projectMedia)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${caseProject.projectTitle} - Gallery ${actualIndex + 1}`}
                      className="w-full h-auto object-cover block hover:opacity-90 transition-opacity"
                      style={{ display: "block", margin: 0, padding: 0, lineHeight: 0 }}
                    />
                  </div>
                )
              } else if (isPairStart) {
                // Start of pair — render both at once (actualIndex and actualIndex+1) - square format
                const nextImage = caseProject.projectMedia[actualIndex + 1]
                if (nextImage) {
                  return (
                    <div
                      key={`gallery-pair-${actualIndex}`}
                      className="flex"
                      style={{ gap: 0, lineHeight: 0, margin: 0, padding: 0 }}
                    >
                      <div
                        className="w-1/2 cursor-pointer block aspect-square"
                        style={{ margin: 0, padding: 0, lineHeight: 0 }}
                        onClick={() => openModal(actualIndex, caseProject.projectMedia)}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${caseProject.projectTitle} - Gallery ${actualIndex + 1}`}
                          className="w-full h-full object-cover block hover:opacity-90 transition-opacity"
                          style={{ display: "block", margin: 0, padding: 0, lineHeight: 0 }}
                        />
                      </div>
                      <div
                        className="w-1/2 cursor-pointer block aspect-square"
                        style={{ margin: 0, padding: 0, lineHeight: 0 }}
                        onClick={() => openModal(actualIndex + 1, caseProject.projectMedia)}
                      >
                        <img
                          src={nextImage || "/placeholder.svg"}
                          alt={`${caseProject.projectTitle} - Gallery ${actualIndex + 2}`}
                          className="w-full h-full object-cover block hover:opacity-90 transition-opacity"
                          style={{ display: "block", margin: 0, padding: 0, lineHeight: 0 }}
                        />
                      </div>
                    </div>
                  )
                } else {
                  // if only one remains — show it separately
                  return (
                    <div
                      key={actualIndex}
                      className="w-full cursor-pointer block"
                      style={{ lineHeight: 0, margin: 0, padding: 0 }}
                      onClick={() => openModal(actualIndex, caseProject.projectMedia)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${caseProject.projectTitle} - Gallery ${actualIndex + 1}`}
                        className="w-full h-auto object-cover block hover:opacity-90 transition-opacity"
                        style={{ display: "block", margin: 0, padding: 0, lineHeight: 0 }}
                      />
                    </div>
                  )
                }
              } else {
                // end of pair — skip (rendered together with start)
                return null
              }
            })}
          </div>
        )}
      </section>

      {/* Drafts Section */}
      {hasDrafts && (
        <section id="drafts" className="py-0 relative">
          {/* Process & Drafts button - absolute positioned on top left */}
          <div className="absolute top-8 left-8 z-10">
            <Badge className="inline-flex items-center justify-center gap-1 py-1 px-4 rounded-full bg-black hover:bg-gray-800 cursor-pointer h-8">
              <span className="text-[11px] font-medium whitespace-nowrap text-[#E3E3E3]">PROCESS & DRAFTS</span>
            </Badge>
          </div>

          {/* Full-width images with no spacing */}
          <div className="w-full">
            <div className="flex overflow-x-auto">
              {caseProject.draftProcess.map((image, index) => (
                <div key={index} className="flex-shrink-0 cursor-pointer" onClick={() => openModal(index, caseProject.draftProcess)}>
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${caseProject.projectTitle} - Draft ${index + 1}`}
                    className="h-[400px] w-auto object-cover block hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact/Footer Section - Simplified */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-[20px] sm:px-[30px]">
          {/* Social Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <span className="font-medium text-[#202020] text-[12px]">SOCIAL:</span>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#202020] text-[12px] tracking-[0] leading-[normal] hover:underline cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Logo - Center */}
          <div className="flex justify-center">
            <img src="/logo-case-footer.svg" alt="Logo Case Footer" className="w-[200px] h-[103px]" />
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <BackToTop />

      {/* Image Modal */}
      <ImageModal
        images={createModalImages(currentImageArray)}
        currentIndex={currentImageIndex}
        isOpen={isModalOpen}
        onClose={closeModal}
        onNext={nextImage}
        onPrevious={previousImage}
      />
    </div>
  )
}