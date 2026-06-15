"use client"

import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import MobileNav from "@/components/mobile-nav"
import BackToTop from "@/components/back-to-top"
import Footer from "@/components/footer"
import { formatDate, type BlogPost } from "@/lib/notion"
import { FadeInImage } from "@/components/fade-in-image"
import { proxyNotionImage } from "@/lib/notion-image"

// Image Lightbox Component — matches the case page / personal projects viewer
function ImageLightbox({
    images,
    currentIndex,
    isOpen,
    onClose,
    onNext,
    onPrev,
}: {
    images: Array<{ url: string; name: string }>
    currentIndex: number
    isOpen: boolean
    onClose: () => void
    onNext: () => void
    onPrev: () => void
}) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            } else if (e.key === "ArrowLeft") {
                onPrev()
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
    }, [isOpen, onClose, onNext, onPrev])

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
                        onPrev()
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
                src={currentImage.url || "/placeholder.svg"}
                alt={currentImage.name}
                className="max-w-[100vw] max-h-[100vh] object-contain block"
                style={{ margin: 0, padding: 0 }}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    )
}

export default function JournalClient({ initialPosts }: { initialPosts: BlogPost[] }) {
    const [activePage, setActivePage] = useState<string | null>("Journal")
    const [blogPosts] = useState<BlogPost[]>(initialPosts)

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxImages, setLightboxImages] = useState<Array<{ url: string; name: string }>>([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Lightbox functions
    const openLightbox = (images: Array<{ url: string; name: string }>, startIndex = 0) => {
        setLightboxImages(images)
        setCurrentImageIndex(startIndex)
        setLightboxOpen(true)
    }

    const closeLightbox = () => {
        setLightboxOpen(false)
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
    }

    const renderImageLayout = (entry: BlogPost, priority = false) => {
        const images = entry.attachments.filter((att) => att.type === "image")

        if (images.length === 0) {
            return null
        }

        if (images.length === 1) {
            return (
                <div className="w-full cursor-pointer" onClick={() => openLightbox(images, 0)}>
                    <FadeInImage
                        src={proxyNotionImage(images[0].url) || "/placeholder.svg"}
                        alt={entry.description || "Journal image"}
                        className="w-full h-auto object-contain rounded-[6px] hover:opacity-90"
                        priority={priority}
                    />
                </div>
            )
        } else {
            return (
                <div className="grid grid-cols-2 gap-2">
                    {images.slice(0, 4).map((image, imgIndex) => (
                        <div key={imgIndex} className="cursor-pointer" onClick={() => openLightbox(images, imgIndex)}>
                            <FadeInImage
                                src={proxyNotionImage(image.url) || "/placeholder.svg"}
                                alt={`Journal image ${imgIndex + 1}`}
                                className="w-full h-auto object-cover rounded-[6px] hover:opacity-90 aspect-square"
                                priority={priority}
                            />
                        </div>
                    ))}
                </div>
            )
        }
    }

    return (
        <div className="bg-white min-h-screen overflow-x-hidden">
            <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
                {/* Top Navigation */}
                <div className="mb-4">
                    <div className="hidden md:block">
                        <Navigation activePage={activePage} setActivePage={setActivePage} />
                    </div>
                </div>

                {/* Online Status with Blinking Animation */}
                <Badge
                    variant="outline"
                    className="inline-flex items-center justify-center gap-[5px] pl-1.5 pr-2.5 py-0.5 mb-8 rounded-full border border-solid border-gray-200 dark:border-[#1fef00] dark:bg-[#1fef00]"
                >
                    <div className="relative w-1 h-1 bg-[#1fef00] rounded-sm animate-pulse dark:bg-[#080808]" />
                    <span className="relative w-fit mt-[-1px] font-medium text-[#0e0e0e] text-[11px] tracking-[0] leading-[normal] dark:text-[#080808]">
                        Online
                    </span>
                </Badge>

                {/* Journal Entries */}
                <div className="flex flex-col w-full max-w-[600px] items-start gap-[29px] mb-16">
                    {blogPosts.length === 0 ? (
                        <div className="text-gray-500">
                            <p className="mb-2">No published journal entries found.</p>
                            <p className="text-xs">
                                Make sure you have entries in your Notion database with the "publish" checkbox checked.
                            </p>
                        </div>
                    ) : (
                        blogPosts.map((entry, postIndex) => (
                            <div key={entry.id} className="flex flex-col items-start gap-[19px] relative self-stretch w-full">
                                <div className="flex items-start gap-[20px] sm:gap-[40px] relative self-stretch w-full">
                                    <div className="relative w-fit mt-[-1px] font-medium text-black text-[12px] tracking-[0] leading-[normal] whitespace-nowrap">
                                        {formatDate(entry.date)}
                                    </div>

                                    <div className="flex flex-col w-full items-start gap-[5px] relative">
                                        {/* Show description content only if it exists and is not empty */}
                                        {entry.description && entry.description.trim() && (
                                            <div className="relative self-stretch mt-[-1px] font-medium text-black text-[12px] tracking-[0] leading-[normal]">
                                                {entry.description}
                                            </div>
                                        )}

                                        {/* File Attachments */}
                                        {entry.attachments.filter((att) => att.type === "file").length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {entry.attachments
                                                    .filter((att) => att.type === "file")
                                                    .map((file, fileIndex) => (
                                                        <a
                                                            key={fileIndex}
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-blue-600 hover:underline"
                                                        >
                                                            📎 {file.name}
                                                        </a>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {renderImageLayout(entry, postIndex === 0)}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <Footer />
            </div>

            {/* Image Lightbox */}
            <ImageLightbox
                images={lightboxImages}
                currentIndex={currentImageIndex}
                isOpen={lightboxOpen}
                onClose={closeLightbox}
                onNext={nextImage}
                onPrev={prevImage}
            />

            {/* Back to Top Button */}
            <BackToTop />
            
            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    )
}
