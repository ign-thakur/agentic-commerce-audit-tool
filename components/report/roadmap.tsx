import { Layers, Cpu, Sparkles } from "lucide-react"

export function Roadmap() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Foundation",
      icon: Layers,
      description: "Establish core AI-readable infrastructure",
      items: [
        "Implement JSON-LD structured data",
        "Add semantic HTML markup",
        "Create sitemap for AI crawlers",
        "Set up canonical URLs",
      ],
    },
    {
      phase: "Phase 2",
      title: "Agent Execution",
      icon: Cpu,
      description: "",
      items: [
        "Build API-accessible checkout",
        "Add real-time inventory API",
        "Create product comparison endpoints",
        "Implement cart management API",
      ],
    },
    {
      phase: "Phase 3",
      title: "Advanced AI Layer",
      icon: Sparkles,
      description: "Full AI commerce capabilities",
      items: [
        "Deploy AI shopping assistant",
        "Enable voice commerce",
        "Add personalized recommendations",
        "Integrate multi-agent support",
      ],
    },
  ]

  return (
    <div className="rounded-2xl bg-background border border-border p-8 shadow-sm">
      <h2 className="mb-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">Implementation Roadmap</h2>
      
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-10 left-[5%] right-[5%] hidden h-0.5 bg-gradient-to-r from-border via-primary/30 to-border lg:block" />
        
        <div className="grid gap-8 lg:grid-cols-3">
          {phases.map((phase) => (
            <div key={phase.phase} className="relative">
              {/* Phase header */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <phase.icon className="h-9 w-9 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">{phase.phase}</span>
                  <h3 className="text-lg font-semibold text-foreground">{phase.title}</h3>
                </div>
              </div>
              
              <p className="mb-5 text-sm text-muted-foreground">{phase.description}</p>
              
              <ul className="space-y-2.5">
                {phase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
