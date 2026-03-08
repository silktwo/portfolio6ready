"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import BackToTop from "@/components/back-to-top"

interface CaseNavProps {
    projectTitle: string
    hasDrafts: boolean
    onScrollTo: (section: string) => void
    activeSection: string
}

interface MobileNavProps {
    caseNav?: CaseNavProps
}

const siteLinks = [
    { label: "Fonts", href: "#", disabled: true },
    { label: "Journal", href: "/journal" },
    { label: "Commercial", href: "/commercial" },
    { label: "Personal Projects", href: "/personal-projects" },
]

const Logo = ({ style }: { style?: React.CSSProperties }) => (
    <svg
        width="20"
        height="11"
        viewBox="0 0 20 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={style}
    >
        <path
            d="M19.8969 0.0625H16.7785L11.075 4.20673V0.0625H9.02343V6.01214H0.201538V8.06374H7.91557L4.92023 10.2589H8.03866L11.075 8.04322V6.52504L13.537 4.74015L13.7421 4.92479L17.0452 8.06374H19.8969L15.0551 3.61177L19.8969 0.0625Z"
            fill="currentColor"
        />
        <path
            d="M4.18164 3.32457L9.02342 0.0625H5.90499L0.201538 3.8785V6.01218L2.66346 4.35037L4.18164 3.32457Z"
            fill="currentColor"
        />
    </svg>
)

const EASING = "cubic-bezier(0.34,1.06,0.64,1)"
const DUR = "580ms"
const TRANSITION = `width ${DUR} ${EASING}, height ${DUR} ${EASING}, border-radius ${DUR} ${EASING}`

// Closed pill dimensions
const PILL_W = 88
const PILL_H = 40
const PILL_R = 20

// Open dimensions — wide enough for "Personal Projects" at 14px, no wrap
const OPEN_W = 196
const OPEN_R = 22

const leftOpenH = (n: number) => 34 + n * 34 + 28 + 24
const rightOpenH = (n: number) => n * 34 + 36 + 24

export default function MobileNav({ caseNav }: MobileNavProps) {
    const [leftOpen, setLeftOpen] = useState(false)
    const [rightOpen, setRightOpen] = useState(false)

    const pathname = usePathname()
    const router = useRouter()

    const leftRef = useRef<HTMLDivElement>(null)
    const rightRef = useRef<HTMLDivElement>(null)

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (leftOpen && leftRef.current && !leftRef.current.contains(e.target as Node)) {
                setLeftOpen(false)
            }
            if (rightOpen && rightRef.current && !rightRef.current.contains(e.target as Node)) {
                setRightOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [leftOpen, rightOpen])

    // Close menus on route change
    useEffect(() => {
        setLeftOpen(false)
        setRightOpen(false)
    }, [pathname])

    const projectMenuItems = caseNav ? [
        { label: "PROJECT INFO", section: "info" },
        { label: "GALLERY", section: "gallery" },
        ...(caseNav.hasDrafts ? [{ label: "DRAFTS", section: "drafts" }] : []),
        { label: "CONTACT", section: "contact" },
    ] : []

    const LEFT_OPEN_H = leftOpenH(projectMenuItems.length)
    const RIGHT_OPEN_H = rightOpenH(siteLinks.length)

    const handleSiteLink = (href: string, disabled?: boolean) => {
        if (disabled) return
        setRightOpen(false)
        router.push(href)
    }

    const handleCaseSection = (section: string) => {
        if (caseNav) {
            caseNav.onScrollTo(section)
        }
        // Menu remains open, user must manually click outside or the bar below to close
    }

    return (
        <>
            <style>{`
        .tnav * { box-sizing: border-box; font-family: 'PPNeueMontreal', 'Helvetica Neue', sans-serif; }

        .tnav-pill {
          background: #000;
          color: #fff;
          overflow: hidden;
          pointer-events: auto;
          position: relative;
          flex-shrink: 0;
          transition: ${TRANSITION};
          will-change: width, height, border-radius;
        }

        .tnav-pill.closed {
          width: ${PILL_W}px;
          height: ${PILL_H}px;
          border-radius: ${PILL_R}px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tnav-pill.open {
          width: ${OPEN_W}px;
          border-radius: ${OPEN_R}px;
          cursor: default;
        }

        @media (max-width: 420px) {
          .tnav-pill.closed { width: 74px; height: 38px; border-radius: 19px; }
          .tnav-pill.open   { width: calc(50vw - 18px); border-radius: 20px; }
        }

        /* Closed icon */
        .tnav-icon {
          transition: opacity 160ms ease, transform 160ms ease;
          display: flex; align-items: center; justify-content: center;
          position: absolute;
        }
        .tnav-pill.open .tnav-icon {
          opacity: 0;
          transform: scale(0.8);
          pointer-events: none;
        }
        .tnav-pill.closed .tnav-icon {
          opacity: 1;
          transform: scale(1);
        }

        /* Open body */
        .tnav-body {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          padding: 12px;
          transition: opacity 200ms ease;
        }
        .tnav-pill.closed .tnav-body {
          opacity: 0;
          pointer-events: none;
        }
        .tnav-pill.open .tnav-body {
          opacity: 1;
          transition-delay: 200ms;
        }

        /* Menu items */
        .tnav-item {
          display: block;
          text-decoration: none;
          text-align: center;
          white-space: nowrap;
          opacity: 0;
          transform: translateY(4px);
          color: #eaeaea;
          transition: opacity 280ms ease, transform 280ms ease, color 150ms ease, background 150ms ease;
          cursor: pointer;
          border-radius: 999px; /* Reverted to pill shape */
        }
        .tnav-item:hover:not(.tnav-item-active):not(.tnav-item-disabled) {
          background: #1f2937; /* gray-800 */
          color: #fff;
        }
        .tnav-pill.open .tnav-item {
          opacity: 1;
          transform: translateY(0);
        }

        /* Active item badge style (Desktop Case match) */
        .tnav-item-active {
          background: #eaeaea !important;
          color: #202020 !important;
          padding: 0 16px !important; /* give it wider pill feel */
        }

        /* Project name badge */
        .tnav-badge {
          background: transparent;
          color: #eaeaea;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-align: center;
          padding: 6px 16px;
          border-radius: 999px;
          white-space: nowrap;
          cursor: pointer;
          border: none;
          width: 100%;
          transition: background 150ms ease, color 150ms ease;
          flex-shrink: 0;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tnav-badge.active {
          background: #eaeaea;
          color: #202020;
        }
        .tnav-badge:hover:not(.active) { color: #fff; background: #1f2937; }

        /* Bottom bar — morphs from white pill to red */
        .tnav-bar {
          width: 52px;
          height: 4px;
          border-radius: 999px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 400ms ease, width 400ms ease;
        }
        .tnav-bar:hover { opacity: 0.75; }

        /* Logo row */
        .tnav-logo-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          cursor: pointer;
          transition: opacity 150ms ease;
          flex-shrink: 0;
          height: 36px;
        }
        .tnav-logo-row:hover { opacity: 0.6; }

        .tnav-item-disabled {
          color: rgba(255, 255, 255, 0.3) !important;
          cursor: not-allowed !important;
        }
      `}</style>

            <nav
                className="tnav md:hidden fixed bottom-6 left-4 right-4 z-50 flex items-end justify-between pointer-events-none"
                aria-label="Site navigation"
            >
                {/* LEFT — project menu */}
                <div className="pointer-events-none flex-1" ref={leftRef}>
                    {caseNav && (
                        <div
                            className={`tnav-pill ${leftOpen ? "open" : "closed"} pointer-events-auto`}
                            style={{ height: leftOpen ? LEFT_OPEN_H : PILL_H }}
                            onClick={() => {
                                if (!leftOpen) {
                                    setLeftOpen(true)
                                    setRightOpen(false)
                                }
                            }}
                            role={leftOpen ? undefined : "button"}
                            aria-expanded={leftOpen}
                            aria-label="Project menu"
                        >
                            {/* Closed icon */}
                            <div className="tnav-icon">
                                <div style={{ width: 28, height: 2, background: "#fff", borderRadius: 999 }} />
                            </div>

                            {/* Open body */}
                            <div className="tnav-body" style={{ justifyContent: "space-between" }}>
                                {/* Badge — acts as the "selected project" indicator, scroll to top when clicked */}
                                <button
                                    className={`tnav-badge ${!caseNav.activeSection || caseNav.activeSection === "project" ? "active" : ""}`}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCaseSection("project") }}
                                    style={{ marginBottom: 4 }}
                                >
                                    {caseNav.projectTitle}
                                </button>

                                {/* Items */}
                                <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
                                    {projectMenuItems.map((item, i) => (
                                        <button
                                            key={item.label}
                                            className={`tnav-item ${caseNav.activeSection === item.section ? "tnav-item-active" : ""}`}
                                            style={{
                                                transitionDelay: leftOpen ? `${200 + i * 45}ms` : "0ms",
                                                fontSize: 11,
                                                fontWeight: caseNav.activeSection === item.section ? 700 : 500,
                                                letterSpacing: "0.07em",
                                                textTransform: "uppercase",
                                                height: 34,
                                                lineHeight: "34px",
                                                padding: "0 12px",
                                            }}
                                            onClick={(e) => { e.preventDefault(); handleCaseSection(item.section) }}
                                        >
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Bottom bar — white when nothing selected, red when something is */}
                                <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
                                    <div
                                        className="tnav-bar"
                                        style={{
                                            background: caseNav.activeSection ? "#e0001b" : "#3a3a3a",
                                            width: caseNav.activeSection ? 64 : 52,
                                        }}
                                        onClick={() => setLeftOpen(false)}
                                        role="button"
                                        aria-label="Close project menu"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT side */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, pointerEvents: "none" }} ref={rightRef}>
                    {/* Scroll to top */}
                    <div className="pointer-events-auto origin-bottom flex-shrink-0">
                        <BackToTop className="flex items-center justify-center w-[40px] h-[40px] rounded-[50%] bg-[#000] text-white hover:bg-[#222] transition-colors duration-200" iconClassName="w-4 h-4" />
                    </div>

                    {/* Right pill */}
                    <div
                        className={`tnav-pill ${rightOpen ? "open" : "closed"} pointer-events-auto`}
                        style={{ height: rightOpen ? RIGHT_OPEN_H : PILL_H }}
                        onClick={() => {
                            if (!rightOpen) {
                                setRightOpen(true)
                                setLeftOpen(false)
                            }
                        }}
                        role={rightOpen ? undefined : "button"}
                        aria-expanded={rightOpen}
                        aria-label="Main menu"
                    >
                        {/* Closed icon */}
                        <div className="tnav-icon">
                            <Logo style={{ color: "#fff" }} />
                        </div>

                        {/* Open body */}
                        <div className="tnav-body" style={{ justifyContent: "space-between" }}>
                            {/* Items */}
                            <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
                                {siteLinks.map((item, i) => {
                                    const isActive = pathname.startsWith(item.href) && item.href !== "#" && pathname !== "/"
                                    const isHomeActive = item.href === "/" && pathname === "/"
                                    const isReallyActive = isActive || isHomeActive
                                    const isDisabled = item.disabled

                                    return (
                                        <button
                                            key={item.label}
                                            className={`tnav-item ${isReallyActive ? "tnav-item-active" : ""} ${isDisabled ? "tnav-item-disabled" : ""}`}
                                            style={{
                                                transitionDelay: rightOpen ? `${160 + i * 45}ms` : "0ms",
                                                fontSize: 13, // Same as desktop
                                                fontWeight: isReallyActive ? 700 : 500, // Same as desktop
                                                height: 34,
                                                lineHeight: "34px",
                                                padding: "0 12px",
                                            }}
                                            onClick={(e) => { e.preventDefault(); handleSiteLink(item.href, item.disabled) }}
                                        >
                                            <span>{item.label}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Logo row — click to close menu and go to home */}
                            <div
                                className="tnav-logo-row"
                                onClick={(e) => {
                                    e.preventDefault()
                                    // 1) Start closing animation
                                    setRightOpen(false)
                                    // 2) Force hard navigation to Homepage so it 100% works on iOS
                                    setTimeout(() => {
                                        window.location.href = "/"
                                    }, 100)
                                }}
                                role="button"
                                aria-label="Go to Homepage"
                                style={{
                                    opacity: rightOpen ? 1 : 0,
                                    transition: `opacity 300ms ease ${160 + siteLinks.length * 45}ms`,
                                }}
                            >
                                <Logo style={{ color: "#fff", width: 18, height: "auto" }} />
                                <span style={{ color: "#fff", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>
                                    Dmytro Kifuliak
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}
