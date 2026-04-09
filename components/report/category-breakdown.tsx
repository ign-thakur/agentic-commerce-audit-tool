"use client"

import type { ComponentType } from "react"
import { Bot, FileText, Network, Radar, Sparkles } from "lucide-react"
import type { AuditCategory } from "@/lib/audit"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CategoryBreakdownProps {
  categories: AuditCategory[]
}

const iconMap = {
  "LLMs.txt": FileText,
  "Markdown Response": Sparkles,
  "AI Integrations": Network,
  "MCP / Agent Connectivity": Bot,
  "GEO / Smart JSON-LD / Schema": Radar,
} satisfies Record<AuditCategory["name"], ComponentType<{ className?: string }>>

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const sortedCategories = [...categories].sort((a, b) => a.score - b.score)

  const getBarColor = (score: number) => {
    if (score >= 70) return "bg-primary"
    if (score >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  const getStatusColor = (status: AuditCategory["status"]) => {
    if (status === "strong") return "bg-primary/10 text-primary"
    if (status === "moderate") return "bg-amber-500/10 text-amber-700"
    return "bg-red-500/10 text-red-600"
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Detailed Breakdown
        </h2>
      </div>

      <Accordion type="single" collapsible defaultValue={sortedCategories[0]?.name} className="rounded-2xl border border-border/70">
        {sortedCategories.map((category) => {
          const Icon = iconMap[category.name]
          const keyTakeaway = category.findings[0] ?? "Details coming soon."

          return (
            <AccordionItem key={category.name} value={category.name} className="border-border/70 px-5">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-full flex-col gap-4 pr-3 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{category.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-1">{keyTakeaway}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold tabular-nums text-foreground">{category.score}/100</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusColor(category.status)}`}>
                        {category.status}
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getBarColor(category.score)}`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="grid gap-4 pb-2 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      What We Found
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">Content will be added here.</p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Why It Matters
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">Content will be added here.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
