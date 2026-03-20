import { CheckCircle2 } from "lucide-react"

interface PrioritiesProps {
  priorities: string[]
}

export function Priorities({ priorities }: PrioritiesProps) {
  return (
    <div className="rounded-2xl bg-background border border-border p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Top Priorities</h2>
        <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {priorities.length} actions
        </span>
      </div>
      
      <ul className="space-y-1">
        {priorities.map((priority, index) => (
          <li
            key={index}
            className="flex items-start gap-4 py-3 border-b border-border/50 last:border-0"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm text-foreground leading-relaxed">{priority}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
