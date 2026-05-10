import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportHeaderProps {
  url: string
}

export function ReportHeader({ url }: ReportHeaderProps) {
  const displayUrl = url
    ? (() => {
        let normalized = url.trim()

        try {
          const parsed = new URL(url)
          normalized = `${parsed.hostname}${parsed.pathname}${parsed.search}`
        } catch {
          normalized = normalized.replace(/^https?:\/\//i, "")
        }

        const MAX_LEN = 50
        return normalized.length > MAX_LEN ? `${normalized.slice(0, MAX_LEN)}...` : normalized
      })()
    : ""

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="GreenHonchos"
              width={140}
              height={32}
              className="h-8 w-auto"
              unoptimized
            />
          </Link>
          {displayUrl && (
            <>
              <div className="h-6 w-px bg-border" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={url}
                className="flex min-w-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="truncate">{displayUrl}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </>
          )}
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary">
            <ArrowLeft className="h-4 w-4" />
            New Audit
          </Button>
        </Link>
      </div>
    </header>
  )
}
