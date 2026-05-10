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
      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), 35000)
      try {
        const response = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
          signal: controller.signal,
        })
        const data = await response.json().catch(() => null)
        if (!isActive) return
        sessionStorage.setItem("auditReport", JSON.stringify(data ?? { error: "Audit response unreadable" }))
      } catch {
        if (!isActive) return
      } finally {
        window.clearTimeout(timeoutId)
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#ffffff_25%,#ffffff_100%)]">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:h-20 sm:px-6 sm:py-0 lg:px-8">
          <Image
            src="/logo.png"
            alt="GreenHonchos"
            width={170}
            height={38}
            className="h-8 w-auto sm:h-9"
            unoptimized
          />
          <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em]">
            Audit in progress
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="rounded-[24px] border border-border bg-background p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:rounded-[32px] sm:p-6 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="rounded-[20px] border border-border bg-muted/30 p-4 sm:rounded-[28px] sm:p-6">
              <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
                <svg className="h-40 w-40 -rotate-90 transform">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-muted"
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
                    className="stroke-primary transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{progress}</span>
                  <span className="mt-1 text-sm text-muted-foreground">/100</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/90">Audit In Progress</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  We are generating a store-specific AI commerce readiness report.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/90">AI Commerce Audit</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Analyzing your storefront
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                We are checking how easily AI systems can discover, understand, and act on your commerce experience.
              </p>

              <div className="mt-6 rounded-[20px] border border-border bg-background p-4 shadow-sm sm:mt-8 sm:rounded-[28px] sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/90">Current Stage</p>
                    <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">{currentStage.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{currentStage.detail}</p>
                  </div>
                  <div className="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    {currentStage.label}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Audit progress</span>
                    <span>{remainingSeconds > 0 ? `~${remainingSeconds}s remaining` : "Finalizing report"}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#14b8a6_0%,#0d9488_60%,#0f766e_100%)] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[20px] border border-border bg-muted/20 p-4 sm:mt-8 sm:rounded-[28px] sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Audit Timeline</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {stageDots.map((stage) => (
                <div
                  key={stage.id}
                  className={`rounded-2xl border px-4 py-3 transition-all duration-300 ${
                    stage.completed
                      ? "border-primary/20 bg-primary/10"
                      : stage.active
                        ? "border-border bg-background"
                        : "border-border bg-background/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {stage.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : stage.active ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    )}
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-foreground">{stage.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {stage.completed ? "Completed" : stage.active ? "In progress" : "Queued"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
