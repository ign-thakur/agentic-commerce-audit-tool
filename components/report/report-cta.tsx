import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AuditCategory } from "@/lib/audit"

interface ReportCTAProps {
  weakestCategories: AuditCategory[]
}

export function ReportCTA({ weakestCategories }: ReportCTAProps) {
  const focusAreas = weakestCategories.map((category) => category.name).join(" and ")

  return (
    <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8 lg:p-8">
      <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:gap-6">
        <Image
          src="/logo.png"
          alt="GreenHonchos"
          width={120}
          height={28}
          className="h-8 w-auto brightness-0 invert"
          unoptimized
        />
        <div className="h-8 w-px bg-primary-foreground/20 hidden lg:block" />
        <div>
          <h2 className="text-lg font-semibold text-primary-foreground sm:text-xl">
            Want help fixing the gaps this audit surfaced?
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-primary-foreground/80 sm:text-base">We can turn this into a focused 60-90 day plan around {focusAreas}.</p>
        </div>
      </div>
      
      <a href="https://www.greenhonchos.com/digital-commerce/performance-marketing-services#think-digital" target="_blank" rel="noopener noreferrer" className="w-full lg:w-auto">
        <Button size="lg" className="w-full bg-background text-primary hover:bg-background/90 shadow-lg lg:w-auto lg:whitespace-nowrap">
          Book an AI Readiness Consultation
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </a>
    </div>
  )
}
