import { Search, Brain, CreditCard, Bot } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Search,
      title: "Discovery Analysis",
      description: "Evaluate how easily AI agents can find and index your products, categories, and pages across search and recommendation systems.",
    },
    {
      icon: Brain,
      title: "Semantic Understanding",
      description: "Assess your site's schema markup, metadata, and content structure for AI comprehension and accurate product representation.",
    },
    {
      icon: Bot,
      title: "Agent Compatibility",
      description: "Test compatibility with popular AI shopping agents, voice assistants, and autonomous purchasing systems.",
    },
  ]

  return (
    <section id="features" className="bg-muted/30 py-16 sm:py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Comprehensive AI Audit
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg">
            We analyze every aspect of your store&apos;s AI readiness
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:p-8"
            >
              {/* Icon */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              
              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
