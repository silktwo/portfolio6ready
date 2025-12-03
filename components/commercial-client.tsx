"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import InfoSection from "@/components/info-section"
import BackToTop from "@/components/back-to-top"
import Footer from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink } from "lucide-react"
import { type CommercialProject } from "@/lib/notion-commercial-server"

// Project Card Component
function ProjectCard({ project, className = "" }: { project: CommercialProject; className?: string }) {
    const [imageError, setImageError] = useState(false)

    const handleImageError = () => {
        setImageError(true)
    }

    return (
        <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col gap-2 ${className} cursor-pointer group`}
        >
            <div className="flex items-center gap-1">
                <p className="font-medium text-black text-[12px] leading-[14px] uppercase">{project.title}</p>
                {project.categories && project.categories.length > 0 && (
                    <p className="text-gray-500 text-[12px] leading-[14px] uppercase">, {project.categories.join(", ")}</p>
                )}
            </div>
            <div className="relative bg-gray-100 overflow-hidden transition-transform duration-200 group-hover:scale-[1.02] rounded-[6px]">
                <img
                    src={imageError ? "/placeholder.svg?height=300&width=400" : project.image}
                    alt={project.title}
                    className="w-full h-auto object-contain rounded-[6px]"
                    onError={handleImageError}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge className="bg-black text-white rounded-full p-1">
                        <ExternalLink className="w-3 h-3" />
                    </Badge>
                </div>
            </div>
        </a>
    )
}

// Three Column Works Section Component
function ThreeColumnWorksSection({ activeFilters, projects }: { activeFilters: string[]; projects: CommercialProject[] }) {
    // Filter projects based on active filters
    const filteredProjects =
        activeFilters.length === 0
            ? projects
            : projects.filter((project) => project.categories.some((category) => activeFilters.includes(category)))

    // Split filtered projects into columns based on screen size
    const column1 = filteredProjects.filter((_, index) => index % 3 === 0)
    const column2 = filteredProjects.filter((_, index) => index % 3 === 1)
    const column3 = filteredProjects.filter((_, index) => index % 3 === 2)

    return (
        <section className="w-full mt-8 mb-16">
            {/* Mobile: Single column */}
            <div className="grid grid-cols-1 gap-[8px] md:hidden">
                {filteredProjects.map((project, index) => (
                    <ProjectCard key={index} project={project} />
                ))}
            </div>

            {/* Tablet: Two columns */}
            <div className="hidden md:grid lg:hidden grid-cols-2 gap-x-[10px] gap-y-[8px]">
                <div className="flex flex-col gap-[8px]">
                    {filteredProjects
                        .filter((_, index) => index % 2 === 0)
                        .map((project, index) => (
                            <ProjectCard key={index} project={project} />
                        ))}
                </div>
                <div className="flex flex-col gap-[8px]">
                    {filteredProjects
                        .filter((_, index) => index % 2 === 1)
                        .map((project, index) => (
                            <ProjectCard key={index} project={project} />
                        ))}
                </div>
            </div>

            {/* Desktop: Three columns */}
            <div className="hidden lg:grid grid-cols-3 gap-x-[10px] gap-y-[8px]">
                <div className="flex flex-col gap-[8px]">
                    {column1.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </div>
                <div className="flex flex-col gap-[8px]">
                    {column2.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </div>
                <div className="flex flex-col gap-[8px]">
                    {column3.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default function CommercialClient({ initialProjects }: { initialProjects: CommercialProject[] }) {
    const [activePage, setActivePage] = useState<string | null>("Commercial")
    const [activeFilters, setActiveFilters] = useState<string[]>([])
    const [projects] = useState<CommercialProject[]>(initialProjects)

    // Generate categories from projects
    const availableCategories = Array.from(
        new Set(projects.flatMap((project) => project.categories))
    ).sort()

    const clients = [
        "Brand Ukraine",
        "Uklon",
        "Silpo",
        "Etnodim",
        "Galychyna",
        "Ministry of Foreign Affairs of Ukraine",
        "Ministry of Digital Transformation of Ukraine",
        "Ukrainian Institute",
        "Vodafone Ukraine",
        "Sense Bank",
    ]

    const toggleFilter = (filter: string) => {
        setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
    }

    const clearFilters = () => {
        setActiveFilters([])
    }

    return (
        <div className="bg-white min-h-screen overflow-x-hidden">
            <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
                {/* Top Navigation */}
                <div className="mb-4">
                    <Navigation activePage={activePage} setActivePage={setActivePage} />
                </div>

                {/* Info Section */}
                <InfoSection clients={clients} />

                {/* Filter Categories with Active State and Circle Close */}
                <div className="flex items-center gap-2 mb-8 flex-wrap">
                    {activeFilters.length > 0 && (
                        <Badge
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full transition-colors cursor-pointer hover:opacity-80"
                            style={{
                                backgroundColor: "rgba(149, 149, 149, 0.40)",
                                color: "rgba(148, 148, 148, 1)",
                            }}
                        >
                            <span className="text-[11px] font-bold">CLEAR ALL</span>
                            <div className="w-3 h-3 bg-[#949494] rounded-full flex items-center justify-center flex-shrink-0">
                                <X className="w-2 h-2 text-white" />
                            </div>
                        </Badge>
                    )}
                    {availableCategories.map((filter, index) => {
                        const isActive = activeFilters.includes(filter)
                        return (
                            <Badge
                                key={index}
                                onClick={() => toggleFilter(filter)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer hover:opacity-80"
                                style={{
                                    backgroundColor: isActive ? "rgba(149, 149, 149, 0.40)" : "rgba(149, 149, 149, 0.2)",
                                    color: "rgba(148, 148, 148, 1)",
                                }}
                            >
                                <span className="text-[11px] font-bold">{filter.toUpperCase()}</span>
                                {isActive && (
                                    <div className="w-3 h-3 bg-[#949494] rounded-full flex items-center justify-center flex-shrink-0 animate-in fade-in-0 zoom-in-95 duration-200">
                                        <X className="w-2 h-2 text-white" />
                                    </div>
                                )}
                            </Badge>
                        )
                    })}
                </div>

                {/* Three Column Works Section */}
                <ThreeColumnWorksSection activeFilters={activeFilters} projects={projects} />

                {/* Footer Section without Case Logo */}
                <Footer showCaseLogo={false} />

                {/* Back to Top Button */}
                <BackToTop />
            </div>
        </div>
    )
}
