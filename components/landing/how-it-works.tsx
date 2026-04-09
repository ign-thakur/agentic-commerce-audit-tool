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
    <section id="how-it-works" className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            How it works
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your AI readiness score in three simple steps
          </p>
        </div>

        {/* Horizontal step flow */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-16 left-[10%] right-[10%] hidden h-0.5 bg-gradient-to-r from-border via-primary/50 to-border lg:block" />
          
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className="relative text-center"
              >
                {/* Step indicator */}
                <div className="mb-8 flex flex-col items-center">
                  <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-muted border border-border shadow-sm">
                    <item.icon className="h-10 w-10 text-primary" />
                    <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                </div>
                
                <h3 className="mb-3 text-2xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
