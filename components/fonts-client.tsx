"use client"

import { useMemo, useState } from "react"
import Navigation from "@/components/navigation"
import MobileNav from "@/components/mobile-nav"
import BackToTop from "@/components/back-to-top"
import { AlignCenter, AlignLeft, AlignRight, RotateCcw } from "lucide-react"
import { Slider } from "@/components/ui/slider"

type TextAlign = "left" | "center" | "right"

const fontFamily = "Lezo, PP Neue Montreal, sans-serif"

const sampleText = "LEZO CARRIES A SHARP RHYTHM FOR IDENTITY SYSTEMS, POSTERS, AND PACKAGING."

const glyphGroups = [
  {
    label: "Uppercase Latin",
    glyphs: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  },
  {
    label: "Lowercase Latin",
    glyphs: "abcdefghijklmnopqrstuvwxyz".split(""),
  },
  {
    label: "Cyrillic",
    glyphs: "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯабвгґдеєжзиіїйклмнопрстуфхцчшщьюя".split(""),
  },
  {
    label: "Numerals",
    glyphs: "0123456789".split(""),
  },
  {
    label: "Punctuation",
    glyphs: ".,:;!?¿¡·•*#@&()[]{}«»“”‘’'\"/\\|-–—_+".split(""),
  },
  {
    label: "Currency & Symbols",
    glyphs: "$€£¥₴¢%‰№©®™§¶†‡←↑→↓↗↘".split(""),
  },
]

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
  showLabel = true,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  suffix?: string
  showLabel?: boolean
}) {
  const setValue = (next: number) => onChange(Math.min(max, Math.max(min, next)))

  return (
    <div className="grid gap-2">
      {showLabel && (
        <div className="flex items-center justify-between text-[11px] font-medium uppercase text-[#777] dark:text-[#8f8f8f]">
          <span>{label}</span>
        </div>
      )}
      <div className="flex h-8 items-center gap-3">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([next]) => setValue(next)}
          className="min-w-0 flex-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&_[role=slider]]:bg-[#080808] [&_[role=slider]]:shadow-none [&_[role=slider]]:ring-0 [&_[role=slider]]:ring-offset-0 focus-visible:[&_[role=slider]]:ring-0 dark:[&_[role=slider]]:bg-[#e3e3e3] [&_[data-orientation=horizontal]]:h-px [&_[data-orientation=horizontal]]:bg-[#bdbdbd] dark:[&_[data-orientation=horizontal]]:bg-[#3a3a3a] [&_.absolute]:bg-[#080808] dark:[&_.absolute]:bg-[#e3e3e3]"
          aria-label={label}
        />
        <input
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => setValue(Number(event.target.value))}
          className="h-full w-[58px] bg-transparent text-right text-[12px] font-medium text-[#080808] outline-none dark:text-[#e3e3e3]"
          type="number"
          aria-label={`${label} value`}
        />
        {suffix && <span className="w-[18px] text-[11px] font-medium text-[#777] dark:text-[#8f8f8f]">{suffix}</span>}
      </div>
    </div>
  )
}

function PillButton({
  active,
  children,
  onClick,
  ariaLabel,
}: {
  active?: boolean
  children: React.ReactNode
  onClick: () => void
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`inline-flex h-8 items-center justify-center rounded-full px-3 text-[11px] font-medium transition-colors ${
        active
          ? "bg-[#080808] text-[#e3e3e3] dark:bg-[#e3e3e3] dark:text-[#080808]"
          : "bg-[#eeeeee] text-[#080808] hover:bg-[#d8d8d8] dark:bg-[#1b1b1b] dark:text-[#e3e3e3] dark:hover:bg-[#303030]"
      }`}
    >
      {children}
    </button>
  )
}

export default function FontsClient() {
  const [password, setPassword] = useState("")
  const [unlocked, setUnlocked] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [text, setText] = useState(sampleText)
  const [fontSize, setFontSize] = useState(96)
  const [tracking, setTracking] = useState(-1)
  const [lineHeight, setLineHeight] = useState(0.95)
  const [align, setAlign] = useState<TextAlign>("left")
  const [selectedGlyph, setSelectedGlyph] = useState("Л")
  const [outline, setOutline] = useState(false)
  const [strokeWidth, setStrokeWidth] = useState(1.5)

  const previewText = useMemo(() => text.toUpperCase(), [text])

  const submitPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password === "125612") {
      setUnlocked(true)
      setPasswordError(false)
      return
    }

    setPasswordError(true)
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-white text-[#080808] transition-colors dark:bg-[#080808] dark:text-[#e3e3e3]">
        <div className="mx-[20px] flex min-h-screen w-[calc(100%-40px)] flex-col py-[30px] sm:mx-[30px] sm:w-[calc(100%-60px)]">
          <div className="mb-8 hidden md:block">
            <Navigation />
          </div>

          <main className="flex flex-1 items-center justify-center pt-14 md:pt-0">
            <section className="w-full max-w-[420px] rounded-[6px] border border-[#d8d8d8] bg-white p-4 dark:border-[#242424] dark:bg-[#0f0f0f] sm:p-6">
              <p className="mb-3 text-[11px] font-medium uppercase text-[#777] dark:text-[#8f8f8f]">Fonts</p>
              <h1 className="mb-2 text-[20px] font-medium leading-none text-[#080808] dark:text-[#e3e3e3]">
                Page is under construction
              </h1>
              <p className="mb-6 text-[12px] font-medium leading-[1.35] text-[#777] dark:text-[#8f8f8f]">
                Please come back later, or enter the password to preview the type tester.
              </p>

              <form onSubmit={submitPassword} className="grid gap-3">
                <input
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setPasswordError(false)
                  }}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Password"
                  className="h-10 rounded-full border border-[#d8d8d8] bg-transparent px-4 text-[12px] font-medium text-[#080808] outline-none transition-colors placeholder:text-[#949494] focus:border-[#080808] dark:border-[#242424] dark:text-[#e3e3e3] dark:focus:border-[#e3e3e3]"
                />
                {passwordError && (
                  <p className="text-[11px] font-medium text-[#d41414]">Incorrect password</p>
                )}
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#080808] px-4 text-[12px] font-medium text-[#e3e3e3] transition-colors hover:bg-[#303030] dark:bg-[#e3e3e3] dark:text-[#080808] dark:hover:bg-[#cfcfcf]"
                >
                  Enter
                </button>
              </form>
            </section>
          </main>
        </div>

        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#080808] transition-colors dark:bg-[#080808] dark:text-[#e3e3e3]">
      <div className="mx-[20px] w-[calc(100%-40px)] py-[30px] sm:mx-[30px] sm:w-[calc(100%-60px)]">
        <div className="mb-8 hidden md:block">
          <Navigation />
        </div>

        <main>
          <section className="flex min-h-[calc(100svh-60px)] flex-col gap-4 pt-14 md:pt-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase text-[#777] dark:text-[#8f8f8f]">Typeface</p>
                <h1 className="text-[16px] font-medium leading-none">Lezo</h1>
              </div>
              <div className="hidden text-right text-[11px] font-medium uppercase text-[#777] dark:text-[#8f8f8f] sm:block">
                Single style
                <br />
                Version 4
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-[#0f0f0f]">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <span className="text-[11px] font-medium uppercase text-[#777] dark:text-[#8f8f8f]">Tester</span>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-[#eeeeee] px-3 text-[11px] font-medium text-[#080808] transition-colors hover:bg-[#d8d8d8] dark:bg-[#1b1b1b] dark:text-[#e3e3e3] dark:hover:bg-[#303030]"
                    onClick={() => {
                      setText(sampleText)
                      setFontSize(96)
                      setTracking(-1)
                      setLineHeight(0.95)
                      setAlign("left")
                      setOutline(false)
                      setStrokeWidth(1.5)
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>

                <textarea
                  value={previewText}
                  onChange={(event) => setText(event.target.value)}
                  className="min-h-[45svh] flex-1 resize-none bg-transparent p-4 uppercase text-[#080808] outline-none dark:text-[#e3e3e3] sm:p-6"
                  style={{
                    fontFamily,
                    fontSize,
                    letterSpacing: `${tracking}px`,
                    lineHeight,
                    textAlign: align,
                    WebkitTextStrokeWidth: outline ? `${strokeWidth}px` : undefined,
                    WebkitTextStrokeColor: outline ? "#080808" : undefined,
                    WebkitTextFillColor: outline ? "#ffffff" : undefined,
                    color: outline ? "#ffffff" : undefined,
                    paintOrder: outline ? "stroke" : undefined,
                  }}
                  spellCheck={false}
                />

                <div className="grid gap-3 p-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <RangeControl label="Size" value={fontSize} min={24} max={260} step={1} suffix="px" onChange={setFontSize} />
                    <RangeControl label="Track" value={tracking} min={-80} max={24} step={0.5} suffix="px" onChange={setTracking} />
                    <RangeControl label="Line" value={lineHeight} min={0.3} max={1.8} step={0.01} onChange={setLineHeight} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <PillButton active={align === "left"} onClick={() => setAlign("left")} ariaLabel="Align left">
                        <AlignLeft className="h-3.5 w-3.5" />
                      </PillButton>
                      <PillButton active={align === "center"} onClick={() => setAlign("center")} ariaLabel="Align center">
                        <AlignCenter className="h-3.5 w-3.5" />
                      </PillButton>
                      <PillButton active={align === "right"} onClick={() => setAlign("right")} ariaLabel="Align right">
                        <AlignRight className="h-3.5 w-3.5" />
                      </PillButton>
                    </div>
                    <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                      <PillButton active={outline} onClick={() => setOutline(!outline)} ariaLabel="Toggle outline">
                        Outline
                      </PillButton>
                      {outline && (
                        <div className="min-w-[180px] flex-1 sm:max-w-[280px]">
                          <RangeControl label="Outline width" value={strokeWidth} min={0.25} max={8} step={0.25} suffix="px" onChange={setStrokeWidth} showLabel={false} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          </section>

          <section className="grid gap-4 py-8 lg:grid-cols-[minmax(300px,0.34fr)_1fr]">
            <div className="top-6 h-fit lg:sticky">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase text-[#777] dark:text-[#8f8f8f]">Selected</p>
                  <div className="text-[14px] font-medium">Glyph</div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="flex w-full items-center justify-center"
                  style={{ fontFamily, fontSize: "clamp(90px, 14vw, 220px)", aspectRatio: "1", lineHeight: 1 }}
                >
                  <span className="block whitespace-nowrap leading-none">{selectedGlyph}</span>
                </div>
                <div className="mt-4 flex w-full items-center justify-between text-[11px] font-medium uppercase text-[#777] dark:text-[#8f8f8f]">
                  <span>Unicode</span>
                  <span>U+{selectedGlyph.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0")}</span>
                </div>
              </div>
            </div>

            <div>
              {glyphGroups.map((group) => (
                <div key={group.label} className="mb-8 last:mb-0">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h2 className="text-[11px] font-medium uppercase text-[#777] dark:text-[#8f8f8f]">{group.label}</h2>
                    <span className="text-[11px] font-medium text-[#777] dark:text-[#8f8f8f]">{group.glyphs.length}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 xl:grid-cols-12">
                    {group.glyphs.map((glyph, index) => (
                      <button
                        key={`${group.label}-${glyph}-${index}`}
                        type="button"
                        onClick={() => setSelectedGlyph(glyph)}
                        onMouseEnter={() => setSelectedGlyph(glyph)}
                        onFocus={() => setSelectedGlyph(glyph)}
                        className={`flex aspect-square min-w-0 items-center justify-center overflow-hidden p-2 text-[clamp(18px,4vw,32px)] leading-none transition-colors ${
                          selectedGlyph === glyph
                            ? "bg-[#080808] text-[#e3e3e3] dark:bg-[#e3e3e3] dark:text-[#080808]"
                            : "bg-[#f4f4f4] text-[#080808] hover:bg-[#080808] hover:text-[#e3e3e3] dark:bg-[#121212] dark:text-[#e3e3e3] dark:hover:bg-[#e3e3e3] dark:hover:text-[#080808]"
                        }`}
                        style={{ fontFamily }}
                        aria-label={`Select glyph ${glyph}`}
                      >
                        <span className="block max-w-full scale-x-[0.78] whitespace-nowrap leading-none">{glyph}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <BackToTop />
      <MobileNav />
    </div>
  )
}
