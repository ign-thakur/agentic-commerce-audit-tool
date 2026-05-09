export function SocialProof() {
  const stats = [
    { value: "200+", label: "Brands Analyzed" },
    { value: "15B+", label: "GMV Optimized" },
    { value: "8.2M+", label: "Transactions" },
    { value: "62M+", label: "Monthly User Engagement" },
  ]

  return (
    <section className="py-20 lg:py-24 border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center lg:text-left"
            >
              <div className="text-4xl font-bold text-primary lg:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
