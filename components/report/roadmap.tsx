import { Cpu, Layers, Sparkles } from "lucide-react"
import type { AuditCategory } from "@/lib/audit"

interface RoadmapProps {
  categories: AuditCategory[]
}

const phaseTitles = {
  "LLMs.txt": "Fix What AI Cannot Find",
  "Markdown Response": "Improve What AI Can Explain",
  "AI Integrations": "Turn Platform Potential Into Real Capability",
  "Agentic Commerce Readiness": "Make Autonomous Commerce Actions Work Reliably",
  "GEO / Smart JSON-LD / Schema": "Fix What AI Cannot Trust",
} satisfies Record<AuditCategory["name"], string>

const actionMap = {
  "LLMs.txt": [
    "Improve catalog discoverability signals",
    "Strengthen product URL visibility",
    "Reduce crawl friction",
  ],
  "Markdown Response": [
    "Improve product content quality",
    "Strengthen attribute depth",
    "Make product detail more consistent",
  ],
  "AI Integrations": [
    "Review live integrations",
    "Prioritize high-impact capabilities",
    "Close the gap between platform potential and live readiness",
  ],
  "Agentic Commerce Readiness": [
    "Expose explicit agent tools and workflows",
    "Strengthen authentication and session continuity",
    "Improve transactional actionability for autonomous commerce journeys",
  ],
  "GEO / Smart JSON-LD / Schema": [
    "Improve structured product trust",
    "Strengthen core schema coverage",
    "Increase catalog consistency",
  ],
} satisfies Record<AuditCategory["name"], string[]>

export function Roadmap({ categories }: RoadmapProps) {
  const weakest = [...categories].sort((a, b) => a.score - b.score).slice(0, 2)
  const strongest = [...categories].sort((a, b) => b.score - a.score)[0]

  const phases = [
    {
      phase: "Phase 1",
      title: phaseTitles[weakest[0].name],
      icon: Layers,
      description: `Start with ${weakest[0].name}.`,
      items: actionMap[weakest[0].name],
    },
    {
      phase: "Phase 2",
      title: phaseTitles[weakest[1].name],
      icon: Cpu,
      description: `Then improve ${weakest[1].name}.`,
      items: actionMap[weakest[1].name],
    },
    {
      phase: "Phase 3",
      title: `Build On ${strongest.name}`,
      icon: Sparkles,
      description: `Finally, build on ${strongest.name}.`,
      items: [
        `Protect what is already working in ${strongest.name}`,
        "Turn stronger foundations into better visibility",
        "Keep improvements consistent over time",
      ],
    },
  ]

  return (
    <div className="rounded-2xl bg-background border border-border p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Suggested Roadmap</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          A simple phased view of what to address first.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {phases.map((phase) => (
          <div key={phase.phase} className="rounded-2xl border border-border/70 bg-muted/20 p-5">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <phase.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">{phase.phase}</span>
                <h3 className="mt-1 text-lg font-semibold leading-snug text-foreground">{phase.title}</h3>
              </div>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">{phase.description}</p>

            <ul className="space-y-2.5">
              {phase.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                  <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
