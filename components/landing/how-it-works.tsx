import { Globe, BarChart3, FileCheck, Store } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Store,
      step: "01",
      title: "Scan",
      description: "Our AI agents scan your entire website, analyze pages, products, and navigation patterns.",
    },
    {
      icon: BarChart3,
      step: "02",
      title: "Analyze",
      description: "We evaluate your site's semantic markup, schema data, and how well AI can interpret your content.",
    },
    {
      icon: FileCheck,
      step: "03",
      title: "Report",
      description: "Receive a comprehensive report with your score, issues found, and a phase wise plan of action.",
    },
  ]

  return (
    <section id="how-it-works" className="bg-background py-16 sm:py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg">
            Get your AI readiness score in three simple steps
          </p>
        </div>

        {/* Horizontal step flow */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-16 left-[10%] right-[10%] hidden h-0.5 bg-gradient-to-r from-border via-primary/50 to-border lg:block" />
          
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className="relative text-center"
              >
                {/* Step indicator */}
                <div className="mb-8 flex flex-col items-center">
                  <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-muted shadow-sm sm:h-32 sm:w-32">
                    <item.icon className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg sm:-top-3 sm:-right-3 sm:h-10 sm:w-10 sm:text-sm">
                      {index + 1}
                    </div>
                  </div>
                </div>
                
                <h3 className="mb-3 text-xl font-semibold text-foreground sm:text-2xl">{item.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
