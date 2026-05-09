"use client"

import { useEffect, useState } from "react"
import type { AuditCategory } from "@/lib/audit"

interface ScoreCardProps {
  score: number
  status?: "weak" | "moderate" | "strong"
  categories: AuditCategory[]
}

function getPlatformLabel(categories: AuditCategory[]) {
  const integrationCategory = categories.find((category) => category.name === "AI Integrations")
  const platformFinding = integrationCategory?.findings.find((finding) => finding.toLowerCase().startsWith("detected platform:"))

  if (!platformFinding) return "Not detected"

  const value = platformFinding.replace(/detected platform:\s*/i, "").replace(/\.$/, "")
  if (value === "kartmax") return "KartmaX"
  if (value === "woocommerce") return "WooCommerce"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function ScoreCard({ score, status, categories }: ScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-primary"
    if (s >= 60) return "text-amber-500"
    return "text-red-500"
  }

  const getStrokeColor = (s: number) => {
    if (s >= 80) return "stroke-primary"
    if (s >= 60) return "stroke-amber-500"
    return "stroke-red-500"
  }

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "High AI Readiness"
    if (s >= 60) return "Emerging AI Readiness"
    return "At-Risk for AI Discovery"
  }

  const normalizedStatus = status ?? (score >= 70 ? "strong" : score >= 40 ? "moderate" : "weak")
  const platformLabel = getPlatformLabel(categories)
  const backgroundClass =
    normalizedStatus === "strong"
      ? "border-emerald-200 bg-[linear-gradient(145deg,#f4fffb_0%,#eefcf6_55%,#ffffff_100%)]"
      : normalizedStatus === "moderate"
        ? "border-amber-200 bg-[linear-gradient(145deg,#fffaf1_0%,#f6fcfb_55%,#ffffff_100%)]"
        : "border-rose-200 bg-[linear-gradient(145deg,#fff6f7_0%,#fffaf6_45%,#ffffff_100%)]"
  const accentPanelClass =
    normalizedStatus === "strong"
      ? "border-emerald-200/70 bg-emerald-50/70"
      : normalizedStatus === "moderate"
        ? "border-amber-200/70 bg-amber-50/70"
        : "border-rose-200/70 bg-rose-50/70"

  return (
    <div className={`h-full rounded-[32px] border p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${backgroundClass}`}>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">AI Audit Score</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">AI Commerce Readiness</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
          normalizedStatus === "strong"
            ? "bg-primary/10 text-primary"
            : normalizedStatus === "moderate"
              ? "bg-amber-500/10 text-amber-700"
              : "bg-red-500/10 text-red-600"
        }`}>
          {normalizedStatus}
        </span>
      </div>
      
      <div className="grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[28px] border border-border/70 bg-background/70 p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[220px_1fr]">
            <div className="mx-auto">
              <div
                className="relative flex h-56 w-56 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(currentColor ${animatedScore * 3.6}deg, rgba(148,163,184,0.14) 0deg)`,
                  color:
                    score >= 80 ? "rgb(13 148 136)" : score >= 60 ? "rgb(245 158 11)" : "rgb(244 63 94)",
                }}
              >
                <div className="absolute inset-[10px] rounded-full bg-white/95" />
                <div className="relative flex flex-col items-center justify-center">
                  <div className="flex items-end gap-2 leading-none">
                    <span className={`text-6xl font-bold ${getScoreColor(score)}`}>{animatedScore}</span>
                    <span className="pb-2 text-lg font-semibold text-muted-foreground">/100</span>
                  </div>
                  <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Overall Score
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Score Signal
                </p>
                <p className="mt-3 text-xl font-semibold leading-snug text-foreground">
                  {score >= 70
                    ? "Your storefront is showing strong AI-readiness signals."
                    : score >= 40
                      ? "Your storefront is partially ready, but important gaps remain."
                      : "Your storefront still has major AI-readiness gaps."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className={`rounded-full px-4 py-2 text-sm font-medium ${
                  score >= 80
                    ? "bg-primary/10 text-primary"
                    : score >= 60
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-red-500/10 text-red-600"
                }`}>
                  {getScoreLabel(score)}
                </span>
                <span className="rounded-full border-2 border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-[0_8px_24px_rgba(13,148,136,0.10)]">
                  Platform: {platformLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className={`rounded-[28px] border p-6 ${accentPanelClass}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Platform Readiness
            </p>
            
            <p className="mt-3 text-lg font-semibold leading-snug text-foreground">
              {platformLabel === "KartmaX"
                ? "The detected platform gives you a stronger commerce integration base."
                : platformLabel === "Shopify"
                  ? "The detected platform has a healthy app ecosystem, but setup quality still matters."
                  : platformLabel === "WooCommerce"
                    ? "The detected platform can support AI workflows, but plugin quality matters a lot."
                    : platformLabel === "Magento"
                      ? "The detected platform likely needs more implementation work for modern AI commerce."
                      : "The storefront appears custom, so AI readiness depends more on what is explicitly implemented."}
            </p>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status Outlook</p>
            <p className="mt-3 text-lg font-semibold leading-snug text-foreground capitalize">
              {normalizedStatus} readiness with the biggest gaps still concentrated in your weaker categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
