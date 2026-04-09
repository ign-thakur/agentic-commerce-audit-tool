"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Hero } from "@/components/landing/hero"
import { SocialProof } from "@/components/landing/social-proof"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Features } from "@/components/landing/features"
import { CTASection } from "@/components/landing/cta-section"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async (url: string, email: string) => {
    setIsLoading(true)

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website: url,
          source: "homepage",
        }),
      })
    } catch (error) {
      console.error("Lead capture request failed", error)
    }

    // Store the URL and email in sessionStorage for the loading page
    sessionStorage.setItem("auditUrl", url)
    sessionStorage.setItem("auditEmail", email)
    router.push("/loading")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero onAnalyze={handleAnalyze} isLoading={isLoading} />
        <SocialProof />
        <HowItWorks />
        <Features />
        <CTASection onAnalyze={handleAnalyze} isLoading={isLoading} />
      </main>
      <Footer />
    </div>
  )
}
