"use client"

import { useEffect, useState } from "react"

interface ScoreCardProps {
  score: number
  status?: "weak" | "moderate" | "strong"
  summary: string
  summaryLabel?: string
}

export function ScoreCard({ score, status, summary, summaryLabel }: ScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [expanded, setExpanded] = useState(false)

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
  const shouldTruncate = summary.length > 170
  const visibleSummary =
    shouldTruncate && !expanded ? `${summary.slice(0, 170).trimEnd()}...` : summary

  return (
    <div className="h-full rounded-2xl bg-background border border-border p-8 shadow-sm">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">AI Commerce Readiness</h2>
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
      
      <div className="flex flex-col items-center">
        <div className="relative mb-8">
          <svg className="h-48 w-48 -rotate-90 transform">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              strokeWidth="6"
              fill="none"
              strokeDasharray={553}
              strokeDashoffset={553 - (553 * animatedScore) / 100}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${getStrokeColor(score)}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {animatedScore}
            </span>
            <span className="text-sm text-muted-foreground mt-1">/100</span>
          </div>
        </div>

        <div className={`mb-6 rounded-full px-4 py-1.5 text-sm font-medium ${
          score >= 80 
            ? "bg-primary/10 text-primary" 
            : score >= 60 
            ? "bg-amber-500/10 text-amber-600" 
            : "bg-red-500/10 text-red-600"
        }`}>
          {getScoreLabel(score)}
        </div>

        {summaryLabel ? (
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {summaryLabel}
          </p>
        ) : null}
        <p className="text-center text-sm text-muted-foreground leading-relaxed">{visibleSummary}</p>
        {shouldTruncate ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-primary/80"
          >
            {expanded ? "See Less" : "See More"}
          </button>
        ) : null}
      </div>
    </div>
  )
}
