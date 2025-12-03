"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import BackToTop from "@/components/back-to-top"
import Footer from "@/components/footer"
import { type PersonalProject } from "@/lib/notion-projects-server"
import { X } from "lucide-react"

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

// Project Card Component
function ProjectCard({
    project,
    className = "",
    onImageClick,
}: {
    project: PersonalProject
    className?: string
    onImageClick: () => void
}) {
    const [imageError, setImageError] = useState(false)
    return (
        <div className={`flex flex-col ${className}`}>
            <div
                className="relative bg-gray-100 overflow-hidden rounded-[6px] mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={onImageClick}
            >
                <img
                    src={imageError ? "/placeholder.svg?height=300&width=300" : project.image}
                    alt={project.title}
                    className="w-full h-auto object-contain rounded-[6px]"
                    onError={() => setImageError(true)}
                />
            </div>
            <div className="text-left">
                <p className="font-medium text-black text-[12px] leading-[normal]">{project.title}</p>
            </div>
            {project.description && (
                <div className="text-left">
                    <p className="text-[11px] text-[#939393] leading-[normal]" style={{ fontFamily: "Roboto Mono, monospace" }}>
                        {project.description}
                    </p>
                </div>
            )}
        </div>
    )
}

// Main Client Component
export default function PersonalProjectsClient({ initialProjects }: { initialProjects: PersonalProject[] }) {
    const [activePage, setActivePage] = useState<string | null>("Personal Projects")
    const [projects] = useState<PersonalProject[]>(initialProjects)
    const [lastUpdate, setLastUpdate] = useState<string>("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const modalImages = projects.map((project) => ({ src: project.image, alt: project.title }))

    const openModal = (index: number) => {
        setCurrentImageIndex(index)
        setIsModalOpen(true)
    }
    const closeModal = () => setIsModalOpen(false)
    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % modalImages.length)
    const previousImage = () => setCurrentImageIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length)

    useEffect(() => {
        if (projects.length > 0) {
            const mostRecent = projects.reduce((latest, current) => {
                const latestDate = new Date(latest.lastEditedTime || latest.createdTime || 0)
                const currentDate = new Date(current.lastEditedTime || current.createdTime || 0)
                return currentDate > latestDate ? current : latest
            })
            const date = new Date(mostRecent.lastEditedTime || mostRecent.createdTime || Date.now())
            setLastUpdate(`${String(date.getDate()).padStart(2, "0")} ${String(date.getMonth() + 1).padStart(2, "0")} ${String(date.getFullYear()).slice(-2)}`)
        } else {
            const now = new Date()
            setLastUpdate(`${String(now.getDate()).padStart(2, "0")} ${String(now.getMonth() + 1).padStart(2, "0")} ${String(now.getFullYear()).slice(-2)}`)
        }
    }, [projects])

    return (
        <div className="bg-white min-h-screen overflow-x-hidden">
            <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px] min-h-screen">
                <Navigation activePage={activePage} setActivePage={setActivePage} />

                <div className="mb-12">
                    <p className="font-medium text-gray-600 text-[14px] max-w-2xl mb-2">
                        A collection of personal design explorations, experiments, and creative projects
                    </p>
                    {lastUpdate && <p className="font-medium text-gray-400 text-[12px]">{lastUpdate}</p>}
                </div>

                <section className="w-full mb-16">
                    {projects.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {projects.map((project, index) => (
                                <ProjectCard key={project.id} project={project} onImageClick={() => openModal(index)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-sm">No projects found in the database.</p>
                            <p className="text-gray-400 text-xs mt-2">
                                Add projects to your Notion database with workTitle and workFile fields.
                            </p>
                        </div>
                    )}
                </section>

                <Footer />
                <BackToTop />
            </div>

            <ImageModal
                images={modalImages}
                currentIndex={currentImageIndex}
                isOpen={isModalOpen}
                onClose={closeModal}
                onNext={nextImage}
                onPrevious={previousImage}
            />
        </div>
    )
}
