"use client"

import { useEffect, useState } from "react"
import { CategoryBreakdown } from "@/components/report/category-breakdown"
import { Priorities } from "@/components/report/priorities"
import { ReportHeader } from "@/components/report/report-header"
import { ReportCTA } from "@/components/report/report-cta"
import { ScoreCard } from "@/components/report/score-card"
import type { AuditReport } from "@/lib/audit"

const defaultReport: AuditReport = {
  score: 58,
  status: "moderate",
  categories: [
    {
      name: "LLMs.txt",
      score: 55,
      status: "moderate",
      findings: [
        "Sitemap support is not fully confirmed.",
        "robots.txt guidance may exist, but crawl depth still looks limited.",
        "Product discoverability depends heavily on internal link quality.",
      ],
      impact:
        "If crawl signals are incomplete, AI systems will miss parts of the catalog and produce uneven product coverage.",
    },
    {
      name: "Markdown Response",
      score: 57,
      status: "moderate",
      findings: [
        "Descriptions exist, but they are not consistently rich.",
        "Attribute depth looks uneven across products.",
        "Readable content exists, but factual density is still limited.",
      ],
      impact:
        "AI can summarize products at a high level, but it will struggle with detailed buyer questions when product facts are thin.",
    },
    {
      name: "AI Integrations",
      score: 60,
      status: "moderate",
      findings: [
        "Platform detection suggests some ecosystem support.",
        "Based on platform capabilities, moderate AI tooling may be available.",
        "No direct AI integrations are confirmed from the current sample.",
      ],
      impact:
        "The platform may support AI commerce workflows, but actual readiness depends on what has really been implemented.",
    },
    {
      name: "Agentic Commerce Readiness",
      score: 52,
      status: "moderate",
      findings: [
        "Authenticated agent workflows are only partially visible.",
        "Tool discovery and actionability still look incomplete.",
        "No strong autonomous agent operating surface is confirmed yet.",
      ],
      impact:
        "Autonomous systems may retrieve some commerce data, but reliable multi-step execution and context continuity remain limited.",
    },
    {
      name: "GEO / Smart JSON-LD / Schema",
      score: 66,
      status: "moderate",
      findings: [
        "Some product schema appears to exist.",
        "Price signals are available on parts of the catalog.",
        "Coverage is not yet consistent enough for high trust.",
      ],
      impact:
        "Structured commerce data helps search and AI extraction, but inconsistent coverage lowers trust and answer quality.",
    },
  ],
  summary:
    "Your store is giving AI systems some usable signals, but the experience is still uneven. GEO / Smart JSON-LD / Schema is a positive foundation, while Agentic Commerce Readiness and LLMs.txt are making it harder for AI platforms to trust, recommend, and act on your catalog consistently.",
  priorities: [
    "Make price, availability, and core product data easier for AI systems to trust.",
    "Improve product content so AI can understand products with more confidence.",
    "Clarify purchase signals so discovery has a cleaner path toward action.",
  ],
}

export default function ReportPage() {
  const [report, setReport] = useState<AuditReport | null>(null)
  const [url, setUrl] = useState("")

  useEffect(() => {
    const storedReport = sessionStorage.getItem("auditReport")
    const storedUrl = sessionStorage.getItem("auditUrl")

    if (storedReport) {
      try {
        setReport(JSON.parse(storedReport) as AuditReport)
      } catch {
        setReport(defaultReport)
      }
    } else {
      setReport(defaultReport)
    }

    if (storedUrl) {
      setUrl(storedUrl)
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

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
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

        <div className="mb-12">
          <Priorities priorities={report.priorities} />
        </div>

        <ReportCTA weakestCategories={blockers.slice(0, 2)} />
      </main>
    </div>
  )
}
