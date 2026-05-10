import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#ffffff_30%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-3xl border border-border bg-background p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-14">
          <div className="mb-10">
            <Image
              src="/logo.png"
              alt="GreenHonchos"
              width={180}
              height={40}
              className="h-9 w-auto"
              unoptimized
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Error 404</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                This page does not exist.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                The URL may be incorrect or the page might have moved. You can return to the homepage and start a
                fresh AI commerce audit.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Homepage
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-border">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Start New Audit
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tips</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground sm:text-base">
                <li>Check for typos in the URL path.</li>
                <li>Use the homepage form to run an audit.</li>
                <li>Open the report link again if it was copied partially.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
