"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CheckCircle2, Loader2, Sparkles } from "lucide-react"

const MIN_DURATION_MS = 20000
const MAX_DURATION_MS = 30000

const stages = [
  {
    id: 1,
    label: "Crawlability scan",
    title: "Checking how AI systems can reach your store",
    detail: "Reviewing discovery signals like product paths, crawl guidance, and indexable entry points.",
  },
  {
    id: 2,
    label: "Catalog review",
    title: "Reviewing product content and structure",
    detail: "Looking at how clearly pricing, descriptions, and product details are exposed to AI systems.",
  },
  {
    id: 3,
    label: "Schema audit",
    title: "Measuring trust signals across product data",
    detail: "Checking structured data, schema coverage, and machine-readable commerce signals.",
  },
  {
    id: 4,
    label: "Commerce flow check",
    title: "Assessing how actionable the buying journey looks",
    detail: "Evaluating cart intent, purchase flow clarity, and how easy the storefront is to act on.",
  },
  {
    id: 5,
    label: "Platform inference",
    title: "Mapping platform signals and AI readiness patterns",
    detail: "Comparing storefront patterns against known commerce platform capabilities and constraints.",
  },
  {
    id: 6,
    label: "Report assembly",
    title: "Building your AI commerce audit report",
    detail: "Prioritizing the most important gaps so the final report is ready to review.",
  },
]

export default function LoadingPage() {
  const router = useRouter()
  const [elapsedMs, setElapsedMs] = useState(0)
  const [reportReady, setReportReady] = useState(false)
  const [totalDurationMs, setTotalDurationMs] = useState(MAX_DURATION_MS)

  useEffect(() => {
    const randomizedDuration =
      Math.floor(Math.random() * ((MAX_DURATION_MS - MIN_DURATION_MS) / 1000 + 1)) * 1000 + MIN_DURATION_MS
    setTotalDurationMs(randomizedDuration)

    const url = sessionStorage.getItem("auditUrl")
    if (!url) {
      router.push("/")
      return
    }

    let isActive = true

    const generateReport = async () => {
      try {
        const response = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        const data = await response.json()
        if (!isActive) return
        sessionStorage.setItem("auditReport", JSON.stringify(data))
      } catch {
        if (!isActive) return
      } finally {
        if (isActive) {
          setReportReady(true)
        }
      }
    }

    generateReport()

    return () => {
      isActive = false
    }
  }, [router])

  useEffect(() => {
    const startTime = Date.now()
    const timer = window.setInterval(() => {
      const nextElapsed = Math.min(Date.now() - startTime, totalDurationMs)
      setElapsedMs(nextElapsed)
    }, 100)

    return () => window.clearInterval(timer)
  }, [totalDurationMs])

  useEffect(() => {
    if (!reportReady || elapsedMs < totalDurationMs) return

    const redirectTimer = window.setTimeout(() => {
      router.push("/report")
    }, 500)

    return () => window.clearTimeout(redirectTimer)
  }, [elapsedMs, reportReady, router, totalDurationMs])

  const progress = Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100))
  const remainingSeconds = Math.max(0, Math.ceil((totalDurationMs - elapsedMs) / 1000))
  const stepDurationMs = totalDurationMs / stages.length
  const currentStageIndex = Math.min(
    stages.length - 1,
    Math.floor(elapsedMs / stepDurationMs)
  )
  const currentStage = stages[currentStageIndex]
  const completedStageCount = Math.floor(elapsedMs / stepDurationMs)

  const stageDots = useMemo(
    () =>
      stages.map((stage, index) => {
        const completed = index < completedStageCount
        const active = index === currentStageIndex && progress < 100
        return { ...stage, completed, active }
      }),
    [completedStageCount, currentStageIndex, progress]
  )

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111a] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_26%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative w-full max-w-3xl rounded-[32px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-10">
        <div className="mb-10 flex items-center justify-between gap-6">
          <Image
            src="/logo.png"
            alt="GreenHonchos"
            width={170}
            height={38}
            className="h-9 w-auto brightness-0 invert"
            unoptimized
          />
          <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/70">
            Estimated time: {Math.round(totalDurationMs / 1000)}s
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div className="rounded-[28px] border border-white/10 bg-black/15 p-6">
            <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
              <svg className="h-40 w-40 -rotate-90 transform">
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  className="text-white/10"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={427}
                  strokeDashoffset={427 - (427 * progress) / 100}
                  strokeLinecap="round"
                  className="stroke-emerald-400 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-semibold tracking-tight">{progress}</span>
                <span className="mt-1 text-sm text-white/55">/100</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/90">
                Audit In Progress
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/68">
                We are generating a store-specific AI commerce readiness report.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/90">
              AI Commerce Audit
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight lg:text-5xl">
              Analyzing your storefront
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/72">
              We are checking how easily AI systems can discover, understand, and act on your commerce experience.
            </p>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-black/15 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
                    Current Stage
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{currentStage.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/62">{currentStage.detail}</p>
                </div>
                <div className="mt-1 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  {currentStage.label}
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between text-sm text-white/55">
                  <span>Audit progress</span>
                  <span>{remainingSeconds > 0 ? `~${remainingSeconds}s remaining` : "Finalizing report"}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#34d399_0%,#10b981_50%,#14b8a6_100%)] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-black/10 p-5">
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
              Audit Timeline
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {stageDots.map((stage) => (
              <div
                key={stage.id}
                className={`rounded-2xl border px-4 py-3 transition-all duration-300 ${
                  stage.completed
                    ? "border-emerald-300/25 bg-emerald-400/10"
                    : stage.active
                      ? "border-white/20 bg-white/8"
                      : "border-white/8 bg-white/4 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  {stage.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  ) : stage.active ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{stage.label}</p>
                    <p className="mt-0.5 text-xs text-white/50">
                      {stage.completed ? "Completed" : stage.active ? "In progress" : "Queued"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
