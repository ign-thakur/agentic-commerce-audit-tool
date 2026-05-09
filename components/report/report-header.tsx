import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportHeaderProps {
  url: string
}

export function ReportHeader({ url }: ReportHeaderProps) {
  const displayUrl = url ? (() => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  })() : ""

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
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {displayUrl}
                <ExternalLink className="h-3.5 w-3.5" />
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
