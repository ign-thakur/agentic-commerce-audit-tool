"use client"

import { useEffect, useState } from "react"
import { CategoryBreakdown } from "@/components/report/category-breakdown"
import { ReportHeader } from "@/components/report/report-header"
import { ReportCTA } from "@/components/report/report-cta"
import { ScoreCard } from "@/components/report/score-card"
import type { AuditCategory, AuditReport } from "@/lib/audit"

function normalizeCategoryName(name: string): AuditCategory["name"] {
  if (name === "AI Documentation") {
    return "Agent Guidance Layer"
  }

  if (name === "Agentic Commerce Readiness") {
    return "MCP Compatibility"
  }

  if (name === "Markdown Response") {
    return "AI Content Quality"
  }

  return name as AuditCategory["name"]
}

function normalizeReport(report: AuditReport): AuditReport {
  return {
    ...report,
    categories: report.categories.map((category) => ({
      ...category,
      name: normalizeCategoryName(category.name),
    })),
  }
}

export default function ReportPage() {
  const [report, setReport] = useState<AuditReport | null>(null)
  const [url, setUrl] = useState("")

  useEffect(() => {
    const storedReport = sessionStorage.getItem("auditReport")
    const storedUrl = sessionStorage.getItem("auditUrl")

    if (!storedReport || !storedUrl) {
      window.location.replace("/")
      return
    }

    try {
      setReport(normalizeReport(JSON.parse(storedReport) as AuditReport))
      setUrl(storedUrl)
    } catch {
      window.location.replace("/")
    }
  }, [])

  if (!report) {
    return null
  }

  const sortedCategories = [...report.categories].sort((a, b) => a.score - b.score)
  const blockers = sortedCategories.slice(0, 3)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#ffffff_20%,#ffffff_100%)]">
      <ReportHeader url={url} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8">
          <ScoreCard
            score={report.score}
            status={report.status}
            categories={report.categories}
          />
        </div>

        <div className="mb-12">
          <CategoryBreakdown categories={report.categories} />
        </div>

        <ReportCTA weakestCategories={blockers.slice(0, 2)} />
      </main>
    </div>
  )
}
