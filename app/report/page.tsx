"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ScoreCard } from "@/components/report/score-card"
import { CategoryBreakdown } from "@/components/report/category-breakdown"
import { IssuesList } from "@/components/report/issues-list"
import { Priorities } from "@/components/report/priorities"
import { Roadmap } from "@/components/report/roadmap"
import { ReportHeader } from "@/components/report/report-header"
import { ReportCTA } from "@/components/report/report-cta"

interface AuditReport {
  score: number
  categories: {
    discovery: number
    semantic: number
    agent: number
    trust: number
  }
  issues: string[]
  priorities: string[]
  summary: string
}

const defaultReport: AuditReport = {
  score: 67,
  categories: {
    discovery: 72,
    semantic: 58,
    agent: 71,
    trust: 69,
  },
  issues: [
    "Missing schema.org Product markup on 45% of product pages",
    "Checkout flow requires JavaScript that AI agents cannot execute",
    "Product descriptions lack structured specifications",
    "No machine-readable inventory status",
    "Missing canonical URLs on filtered pages",
    "Images lack descriptive alt text for AI interpretation",
    "Price information not in structured data format",
  ],
  priorities: [
    "Add JSON-LD Product schema to all product pages",
    "Implement server-rendered checkout option",
    "Add structured product specifications",
    "Include availability markup in product data",
    "Add canonical tags to prevent duplicate content",
  ],
  summary: "Your store shows moderate AI readiness with strong discovery capabilities but needs improvement in semantic markup accessibility for AI agents.",
}

export default function ReportPage() {
  const router = useRouter()
  const [report, setReport] = useState<AuditReport | null>(null)
  const [url, setUrl] = useState<string>("")

  useEffect(() => {
    const storedReport = sessionStorage.getItem("auditReport")
    const storedUrl = sessionStorage.getItem("auditUrl")
    
    if (storedReport) {
      try {
        setReport(JSON.parse(storedReport))
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

  return (
    <div className="min-h-screen bg-background">
      <ReportHeader url={url} />
      
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Top section - Score dominant on left */}
        <div className="mb-12 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ScoreCard score={report.score} summary={report.summary} />
          </div>
          <div className="lg:col-span-3">
            <CategoryBreakdown categories={report.categories} />
          </div>
        </div>

        {/* Issues and Priorities */}
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          <IssuesList issues={report.issues} />
          <Priorities priorities={report.priorities} />
        </div>

        {/* Roadmap */}
        <div className="mb-12">
          <Roadmap />
        </div>

        {/* CTA */}
        <ReportCTA />
      </main>
    </div>
  )
}
