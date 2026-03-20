"use client"

import { Search, Brain, CreditCard, Bot, Shield } from "lucide-react"

interface CategoryBreakdownProps {
  categories: {
    discovery: number
    semantic: number
    agent: number
    trust: number
  }
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const categoryData = [
    { key: "discovery", label: "Discovery", icon: Search, score: categories.discovery },
    { key: "semantic", label: "Semantic", icon: Brain, score: categories.semantic },
    { key: "agent", label: "Agent", icon: Bot, score: categories.agent },
    { key: "trust", label: "Trust", icon: Shield, score: categories.trust },
  ]

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-primary"
    if (score >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  const getTextColor = (score: number) => {
    if (score >= 80) return "text-primary"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="h-full rounded-2xl bg-background border border-border p-8 shadow-sm">
      <h2 className="mb-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">Category Breakdown</h2>
      
      <div className="space-y-6">
        {categoryData.map((category) => (
          <div key={category.key}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <category.icon className="h-4 w-4 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{category.label}</span>
              </div>
              <span className={`text-sm font-bold tabular-nums ${getTextColor(category.score)}`}>
                {category.score}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getBarColor(category.score)}`}
                style={{ width: `${category.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
