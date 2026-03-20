import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ReportCTA() {
  return (
    <div className="flex flex-col items-start justify-between gap-8 rounded-2xl bg-primary p-8 lg:flex-row lg:items-center">
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center">
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
          <h2 className="text-xl font-semibold text-primary-foreground">
            Ready to fix these issues?
          </h2>
          <p className="mt-1 text-primary-foreground/80">
            Let our experts help you optimize for AI commerce
          </p>
        </div>
      </div>
      
      <a href="https://www.greenhonchos.com/" target="_blank" rel="noopener noreferrer">
        <Button size="lg" className="bg-background text-primary hover:bg-background/90 whitespace-nowrap shadow-lg">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </a>
    </div>
  )
}
