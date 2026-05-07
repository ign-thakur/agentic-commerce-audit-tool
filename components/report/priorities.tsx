import { ArrowUpRight, CheckCircle2 } from "lucide-react"

interface PrioritiesProps {
  priorities: string[]
}

function splitPriority(priority: string) {
  const normalized = priority
    .replace(/^make\s+/i, "")
    .replace(/^strengthen\s+/i, "")
    .replace(/^clarify\s+/i, "")
    .replace(/^translate\s+/i, "")
    .trim()

  const parts = normalized.split(/ so | and |, /i).map((part) => part.trim()).filter(Boolean)
  const title = parts.slice(0, 2).join(" ").trim()
  const detail = parts.slice(2).join(" ").trim()

  return {
    title: title.length > 68 ? `${title.slice(0, 68).trimEnd()}...` : title,
    detail: detail.length > 72 ? `${detail.slice(0, 72).trimEnd()}...` : detail,
  }
}

function shortPriorityLabel(priority: string) {
  const lower = priority.toLowerCase()

  if (lower.includes("price") || lower.includes("availability")) return "Price Availability"
  if (lower.includes("description") || lower.includes("attributes")) return "Product Content"
  if (lower.includes("cart") || lower.includes("purchase")) return "Purchase Signals"
  if (lower.includes("sitemap") || lower.includes("robots") || lower.includes("catalog")) return "Catalog Discovery"
  if (lower.includes("integration")) return "AI Integrations"

  const { title } = splitPriority(priority)
  return title
}

export function Priorities({ priorities }: PrioritiesProps) {
  return (
    <div className="rounded-2xl bg-background border border-border p-10 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Priorities</h2>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {priorities.length} actions
        </span>
      </div>

      <ul
        className={`grid gap-5 ${
          priorities.length >= 5
            ? "md:grid-cols-2 xl:grid-cols-3"
            : priorities.length === 4
              ? "md:grid-cols-2 xl:grid-cols-2"
              : priorities.length === 3
                ? "md:grid-cols-3"
                : priorities.length === 2
                  ? "md:grid-cols-2"
                  : "grid-cols-1"
        }`}
      >
        {priorities.map((priority, index) => (
          <li
            key={index}
            className="h-full rounded-[22px] border border-border/70 bg-[linear-gradient(180deg,rgba(15,118,110,0.03)_0%,rgba(248,250,252,0.9)_100%)] px-6 py-5 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            {(() => {
              const label = shortPriorityLabel(priority)
              const { title, detail } = splitPriority(priority)

              return (
                <div className="flex h-full flex-col">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold leading-tight text-foreground">
                        {label}
                      </p>
                      {title !== label ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {title}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 min-h-[72px]">
                    <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                      {detail || priority}
                    </p>
                  </div>

                  <div className="mt-auto pt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>High impact fix</span>
                  </div>
                </div>
              )
            })()}
          </li>
        ))}
      </ul>
    </div>
  )
}
