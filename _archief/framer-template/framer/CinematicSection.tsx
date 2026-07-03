// Cinematic Section — Framer code component (self-contained, no external library)
// Scroll-driven video scrubbing. Desktop scrubs via currentTime; mobile plays a smooth loop.
//
// HOW TO USE IN FRAMER
// 1. Assets → Code → "+" → New Code File → paste this whole file.
// 2. Drag "CinematicSection" onto your page. Set Width = Fill, Height = 4800 (Fixed).
// 3. Select it → right panel → Video: upload your .mp4. Edit panel texts, prices, accent.

import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef } from "react"

interface Panel {
    chapter: string
    title: string
    subtitle: string
    price: string
    from: number
    to: number
    align: "left" | "right"
}

interface Props {
    videoSrc: string
    accent: string
    sectionHeight: number
    panels: Panel[]
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 4800
 */
export default function CinematicSection(props: Props) {
    const { videoSrc, accent, panels } = props

    const sectionRef = useRef<HTMLDivElement>(null)
    const vidRef = useRef<HTMLVideoElement>(null)
    const hintRef = useRef<HTMLDivElement>(null)
    const panelRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const vid = vidRef.current
        const sec = sectionRef.current
        if (!vid || !sec) return

        const isMobile = window.matchMedia("(max-width: 768px)").matches

        let target = 0
        let smoothed = 0
        let lastSeek = 0
        let duration = 0
        let raf = 0

        const onMeta = () => {
            duration = vid.duration || 0
            if (!isMobile) {
                try {
                    vid.currentTime = 0.05 // paint first frame
                } catch (e) {}
            }
        }
        vid.addEventListener("loadedmetadata", onMeta)

        // mobile: just play it smoothly (scrubbing video is unreliable on phones)
        if (isMobile) {
            vid.loop = true
            vid.play().catch(() => {})
        }

        const onScroll = () => {
            const rect = sec.getBoundingClientRect()
            const total = sec.offsetHeight - window.innerHeight
            const p = Math.min(1, Math.max(0, -rect.top / total))

            if (!isMobile && duration) target = p * duration

            if (hintRef.current)
                hintRef.current.style.opacity = p > 0.02 ? "0" : "1"

            panels.forEach((pl, i) => {
                const el = panelRefs.current[i]
                if (!el) return
                const show = p >= pl.from && p <= pl.to
                el.style.opacity = show ? "1" : "0"
                el.style.transform = show
                    ? "translateY(0)"
                    : "translateY(14px)"
            })
        }

        const tick = (now: number) => {
            if (!isMobile && duration) {
                const d = target - smoothed
                if (Math.abs(d) > 0.0005) smoothed += d * 0.1
                if (
                    now - lastSeek > 41 &&
                    vid.readyState >= 2 &&
                    Math.abs(smoothed - vid.currentTime) > 0.03
                ) {
                    try {
                        vid.currentTime = smoothed
                    } catch (e) {}
                    lastSeek = now
                }
            }
            raf = requestAnimationFrame(tick)
        }

        window.addEventListener("scroll", onScroll, { passive: true })
        onScroll()
        raf = requestAnimationFrame(tick)

        return () => {
            window.removeEventListener("scroll", onScroll)
            vid.removeEventListener("loadedmetadata", onMeta)
            cancelAnimationFrame(raf)
        }
    }, [videoSrc, panels])

    return (
        <div
            ref={sectionRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                background: "#000",
            }}
        >
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    width: "100%",
                    overflow: "hidden",
                    background: "#000",
                }}
            >
                <video
                    ref={vidRef}
                    src={videoSrc}
                    muted
                    playsInline
                    preload="auto"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />

                {/* vignette */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background:
                            "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 35%, rgba(0,0,0,.45) 100%)",
                    }}
                />

                {/* text panels */}
                {panels.map((pl, i) => (
                    <div
                        key={i}
                        ref={(el) => (panelRefs.current[i] = el)}
                        style={{
                            position: "absolute",
                            bottom: "14vh",
                            maxWidth: 340,
                            color: "#f6f3f0",
                            opacity: 0,
                            transform: "translateY(14px)",
                            transition:
                                "opacity .6s ease, transform .6s ease",
                            pointerEvents: "none",
                            ...(pl.align === "right"
                                ? {
                                      right: "6vw",
                                      textAlign: "right" as const,
                                  }
                                : { left: "6vw" }),
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "system-ui, sans-serif",
                                fontSize: 11,
                                letterSpacing: ".25em",
                                textTransform: "uppercase",
                                color: accent,
                                marginBottom: 14,
                            }}
                        >
                            {pl.chapter}
                        </div>
                        <h2
                            style={{
                                fontFamily: "Georgia, serif",
                                fontSize: 34,
                                fontWeight: 400,
                                lineHeight: 1.1,
                                margin: "0 0 12px",
                            }}
                        >
                            {pl.title}
                        </h2>
                        <p
                            style={{
                                fontFamily: "system-ui, sans-serif",
                                fontSize: 14,
                                fontWeight: 300,
                                lineHeight: 1.7,
                                color: "rgba(246,243,240,.7)",
                                margin: 0,
                            }}
                        >
                            {pl.subtitle}
                        </p>
                        {pl.price ? (
                            <span
                                style={{
                                    display: "inline-block",
                                    marginTop: 16,
                                    fontFamily: "Georgia, serif",
                                    fontSize: 20,
                                }}
                            >
                                {pl.price}
                            </span>
                        ) : null}
                    </div>
                ))}

                {/* scroll hint */}
                <div
                    ref={hintRef}
                    style={{
                        position: "absolute",
                        bottom: "5vh",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 10,
                        letterSpacing: ".3em",
                        textTransform: "uppercase",
                        color: "rgba(246,243,240,.65)",
                        transition: "opacity .5s ease",
                    }}
                >
                    Scroll
                </div>
            </div>
        </div>
    )
}

CinematicSection.defaultProps = {
    videoSrc: "",
    accent: "#a8895f",
    sectionHeight: 600,
    panels: [
        {
            chapter: "Chapter I",
            title: "Nuit Vellaré",
            subtitle: "Amber · Oud · Tonka",
            price: "€145 · 50ml",
            from: 0.04,
            to: 0.17,
            align: "left",
        },
        {
            chapter: "The house",
            title: "Made by hand",
            subtitle: "Poured and labelled in small batches in Antwerp.",
            price: "",
            from: 0.44,
            to: 0.57,
            align: "right",
        },
        {
            chapter: "Chapter II",
            title: "The collection",
            subtitle: "Three scents · from €120",
            price: "Discover →",
            from: 0.82,
            to: 0.97,
            align: "left",
        },
    ] as Panel[],
}

addPropertyControls(CinematicSection, {
    videoSrc: {
        type: ControlType.File,
        title: "Video",
        allowedFileTypes: ["mp4", "webm", "mov"],
    },
    accent: { type: ControlType.Color, title: "Accent" },
    sectionHeight: {
        type: ControlType.Number,
        title: "Scroll length",
        min: 300,
        max: 1000,
        step: 50,
        unit: "vh",
    },
    panels: {
        type: ControlType.Array,
        title: "Panels",
        control: {
            type: ControlType.Object,
            controls: {
                chapter: { type: ControlType.String, title: "Chapter" },
                title: { type: ControlType.String, title: "Title" },
                subtitle: { type: ControlType.String, title: "Subtitle" },
                price: { type: ControlType.String, title: "Price" },
                from: {
                    type: ControlType.Number,
                    title: "Show from",
                    min: 0,
                    max: 1,
                    step: 0.01,
                },
                to: {
                    type: ControlType.Number,
                    title: "Show to",
                    min: 0,
                    max: 1,
                    step: 0.01,
                },
                align: {
                    type: ControlType.Enum,
                    title: "Align",
                    options: ["left", "right"],
                    optionTitles: ["Left", "Right"],
                },
            },
        },
    },
})
