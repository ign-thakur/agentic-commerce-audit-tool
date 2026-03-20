"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

const steps = [
  { id: 1, text: "Scanning product pages", duration: 1000 },
  { id: 2, text: "Analyzing checkout flow", duration: 1500 },
  { id: 3, text: "Evaluating AI compatibility", duration: 1000 },
]

export default function LoadingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    const url = sessionStorage.getItem("auditUrl")
    if (!url) {
      router.push("/")
      return
    }

    const progressSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)
        await new Promise((resolve) => setTimeout(resolve, steps[i].duration))
        setCompletedSteps((prev) => [...prev, i])
      }
      
      try {
        const response = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        const data = await response.json()
        sessionStorage.setItem("auditReport", JSON.stringify(data))
        router.push("/report")
      } catch {
        router.push("/report")
      }
    }

    progressSteps()
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-16 flex justify-start">
          <Image
            src="/logo.png"
            alt="GreenHonchos"
            width={160}
            height={36}
            className="h-9 w-auto"
            unoptimized
          />
        </div>

        {/* Loading text */}
        <h1 className="mb-12 text-4xl font-bold text-foreground">
          Analyzing your store<span className="text-primary">...</span>
        </h1>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index)
            const isCurrent = currentStep === index && !isCompleted

            return (
              <div
                key={step.id}
                className={`flex items-center gap-5 transition-all duration-300 ${
                  isCompleted || isCurrent ? "opacity-100" : "opacity-40"
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : isCurrent ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <span
                  className={`text-lg ${
                    isCompleted ? "text-muted-foreground line-through" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {step.text}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-12">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${((completedSteps.length + (currentStep >= 0 ? 0.3 : 0)) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}