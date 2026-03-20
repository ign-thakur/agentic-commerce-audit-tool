import { AlertCircle } from "lucide-react"

interface IssuesListProps {
  issues: string[]
}

export function IssuesList({ issues }: IssuesListProps) {
  return (
    <div className="rounded-2xl bg-background border border-border p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Issues Found</h2>
        <span className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {issues.length} issues
        </span>
      </div>
      
      <ul className="space-y-1">
        {issues.map((issue, index) => (
          <li
            key={index}
            className="flex gap-4 py-3 border-b border-border/50 last:border-0"
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-sm text-foreground leading-relaxed">{issue}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
