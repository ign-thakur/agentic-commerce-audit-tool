"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

interface CTASectionProps {
  onAnalyze: (url: string, email: string) => void
  isLoading: boolean
}

export function CTASection({ onAnalyze, isLoading }: CTASectionProps) {
  const [url, setUrl] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url && email) {
      onAnalyze(url, email)
    }
  }

  return (
    <section className="py-24 lg:py-32 bg-primary">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          {/* Text */}
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-primary-foreground lg:text-5xl">
              Ready to optimize
              <br />
              for AI commerce?
            </h2>
            <p className="mt-6 text-lg text-primary-foreground/80">
              Get your free AI readiness report and start improving today. No credit card required.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl bg-background p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="url"
                placeholder="Enter your website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="h-14 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Get Free Report"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
