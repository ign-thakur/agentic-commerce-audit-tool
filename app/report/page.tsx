"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ArrowUpRight, CheckCircle2 } from "lucide-react"
import { CategoryBreakdown } from "@/components/report/category-breakdown"
import { Priorities } from "@/components/report/priorities"
import { Roadmap } from "@/components/report/roadmap"
import { ReportHeader } from "@/components/report/report-header"
import { ReportCTA } from "@/components/report/report-cta"
import { ScoreCard } from "@/components/report/score-card"
import type { AuditCategory, AuditReport } from "@/lib/audit"

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
      name: "MCP / Agent Connectivity",
      score: 52,
      status: "moderate",
      findings: [
        "Cart and transaction signals are only partially visible.",
        "Machine-readable actionability looks incomplete.",
        "No direct MCP or agent protocol support is confirmed.",
      ],
      impact:
        "Agents may understand parts of the purchase path, but reliable end-to-end actionability is still limited.",
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
    "Your store is giving AI systems some usable signals, but the experience is still uneven. GEO / Smart JSON-LD / Schema is a positive foundation, while MCP / Agent Connectivity and LLMs.txt are making it harder for AI platforms to trust, recommend, and act on your catalog consistently.",
  priorities: [
    "Make price, availability, and core product data easier for AI systems to trust.",
    "Improve product content so AI can understand products with more confidence.",
    "Clarify purchase signals so discovery has a cleaner path toward action.",
  ],
}

function getHeroContent(score: number, blockers: AuditCategory[], strongestCategory: AuditCategory) {
  if (score >= 70) {
    return {
      headline: "Your store has a strong AI foundation, but a few weak spots still need attention.",
      subcopy: `${strongestCategory.name} is working well. ${blockers[0].name} and ${blockers[1].name} are the main gaps.`,
    }
  }

  if (score >= 40) {
    return {
      headline: "AI can see parts of your store, but it still does not trust the full journey enough.",
      subcopy: `${strongestCategory.name} is a useful starting point. ${blockers[0].name} and ${blockers[1].name} are still the main gaps.`,
    }
  }

  return {
    headline: "Your store is still underprepared for AI-driven discovery and commerce.",
    subcopy: `${blockers[0].name} and ${blockers[1].name} need attention first.`,
  }
}

function getBlockerHeadline(category: AuditCategory) {
  switch (category.name) {
    case "LLMs.txt":
      return "AI can only find part of the catalog."
    case "Markdown Response":
      return "Product pages are readable, but not convincing enough."
    case "AI Integrations":
      return "Platform potential is ahead of implementation."
    case "MCP / Agent Connectivity":
      return "The buying path is still hard for AI to follow."
    case "GEO / Smart JSON-LD / Schema":
      return "The structured product layer is not reliable enough."
  }
}

function getMerchantExplanation(category: AuditCategory) {
  switch (category.name) {
    case "LLMs.txt":
      return "Some products may still stay invisible."
    case "Markdown Response":
      return "AI may describe products, but miss important detail."
    case "AI Integrations":
      return "There is still a gap between platform potential and live readiness."
    case "MCP / Agent Connectivity":
      return "That creates friction between discovery and action."
    case "GEO / Smart JSON-LD / Schema":
      return "That weakens trust in important product details."
  }
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
  const strongestCategory = [...report.categories].sort((a, b) => b.score - a.score)[0]
  const hero = getHeroContent(report.score, blockers, strongestCategory)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#ffffff_20%,#ffffff_100%)]">
      <ReportHeader url={url} />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0d1f2d_0%,#13283d_100%)] p-8 text-white shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
          <div className="grid gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-300">AI Audit Report</p>
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight lg:text-5xl">{hero.headline}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/78">{hero.subcopy}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-red-300/35 bg-red-500/12 px-5 py-3 shadow-[0_10px_30px_rgba(239,68,68,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Score</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{report.score}/100</div>
                </div>
                <div className="rounded-2xl border border-red-300/35 bg-red-500/12 px-5 py-3 shadow-[0_10px_30px_rgba(239,68,68,0.10),inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Biggest Gap</div>
                  <div className="mt-1 text-base font-semibold text-white">{blockers[0].name}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ScoreCard
              score={report.score}
              status={report.status}
              summary={report.summary}
              summaryLabel="What This Means"
            />
          </div>
          <div className="lg:col-span-3">
            <Priorities priorities={report.priorities} />
          </div>
        </div>

        <section className="mb-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Summary</p>
            <h3 className="mt-3 text-lg font-semibold text-foreground">AI visibility exists, but trust is uneven.</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Parts of the storefront are readable, but weaker trust and action signals still limit confidence.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best Next Move</p>
            <h3 className="mt-3 text-lg font-semibold text-foreground">Fix the weakest two layers first.</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Start with {blockers[0].name} and {blockers[1].name}, then build on what is already working.
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-border bg-background p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Biggest Gaps</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">The main blockers right now.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {blockers.map((category, index) => (
              <div key={category.name} className="rounded-2xl border border-border/70 bg-muted/20 p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Priority {index + 1}</p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">{category.name}</h3>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    category.status === "strong"
                      ? "bg-primary/10 text-primary"
                      : category.status === "moderate"
                        ? "bg-amber-500/10 text-amber-700"
                        : "bg-red-500/10 text-red-600"
                  }`}>
                    {category.score}/100
                  </span>
                </div>

                <p className="text-sm font-medium leading-relaxed text-foreground">{getBlockerHeadline(category)}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{getMerchantExplanation(category)}</p>

                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-foreground">{category.findings[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-border bg-background p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Why This Matters</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
              <div className="flex items-center gap-3">
                <ArrowUpRight className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">More Recommendation Trust</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">AI is more likely to recommend products when core details are easy to verify.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-semibold text-foreground">Less Drop-Off</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Better action signals make it easier to move from discovery toward conversion.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Clearer Next Steps</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">The strongest results usually come from fixing a few high-impact gaps first.</p>
            </div>
          </div>
        </section>

        <div className="mb-12">
          <CategoryBreakdown categories={report.categories} />
        </div>

        <div className="mb-12">
          <Roadmap categories={report.categories} />
        </div>

        <ReportCTA weakestCategories={blockers.slice(0, 2)} />
      </main>
    </div>
  )
}
