"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

interface HeroProps {
  onAnalyze: (url: string, email: string) => void
  isLoading: boolean
}
const sources = [
  { name: "ChatGPT", logo: "/chatgpt.png" },
  { name: "Gemini", logo: "/gemini.png" },
  { name: "Perplexity", logo: "/perplexity.png" },
  { name: "Bing", logo: "/bing.png" },
]

export function Hero({ onAnalyze, isLoading }: HeroProps) {
  const [url, setUrl] = useState("")
  const [email, setEmail] = useState("")

  const [aiSource, setAiSource] = useState(sources[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url && email) {
      onAnalyze(url, email)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setAiSource((prev) => {
        const currentIndex = sources.findIndex(s => s.name === prev.name)
        return sources[(currentIndex + 1) % sources.length]
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">

          {/* Left */}
          <div className="text-left">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Agentic Commerce Readiness
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Are <span className="text-primary">AI shoppers</span> discovering your store?
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl">
              Find out if your store is discovered and understood by AI platforms like{" "}
              <span
                key={aiSource.name}
                className="inline-flex items-center gap-2 text-primary font-semibold animate-fade"
              >
                {aiSource.name}
                {/* <img
                  src={aiSource.logo}
                  alt={aiSource.name}
                  className="h-4 w-4 object-contain opacity-80"
                /> */}
              </span>{" "}
              - in under <span className="text-primary">60 seconds.</span>
            </p>

            <form onSubmit={handleSubmit} className="mt-10 max-w-md">
              <div className="space-y-4">
                <Input
                  type="url"
                  placeholder="Enter your website URL (e.g. nike.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="h-14 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                />
                <Input
                  type="email"
                  placeholder="Work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-6 h-14 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base shadow-lg shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Check Your AI Visibility Score"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>

          {/* Right */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square">

              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-3xl" />

              <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full border-2 border-primary/20 animate-pulse" />
              <div className="absolute top-1/3 right-1/4 h-24 w-24 rounded-full bg-primary/10" />
              <div className="absolute bottom-1/4 left-1/3 h-16 w-16 rounded-full border-2 border-primary/30" />

              <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 400">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-primary"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              <div className="absolute top-20 right-20 flex h-20 w-20 items-center justify-center rounded-xl bg-background border border-border shadow-xl">
                <span className="text-3xl font-bold text-primary">AI</span>
              </div>

              <div className="absolute bottom-32 left-16 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                <div className="h-3 w-3 rounded-full bg-primary" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fade {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade {
          animation: fade 0.5s ease;
        }
      `}</style>
    </section>
  )
}