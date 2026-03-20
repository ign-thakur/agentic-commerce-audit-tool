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
      icon: CreditCard,
      title: "Transaction Readiness",
      description: "Analyze your checkout flow and payment systems for AI-assisted purchasing and automated transaction capabilities.",
    },
    {
      icon: Bot,
      title: "Agent Compatibility",
      description: "Test compatibility with popular AI shopping agents, voice assistants, and autonomous purchasing systems.",
    },
  ]

  return (
    <section id="features" className="py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Comprehensive AI Audit
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            We analyze every aspect of your store&apos;s AI readiness
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:gap-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl bg-background border border-border p-8 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
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
