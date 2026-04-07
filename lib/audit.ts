export interface AuditReport {
  score: number
  status: "weak" | "moderate" | "strong"
  confidence: number

  categories: {
    llms: number
    markdown: number
    integrations: number
    mcp: number
    geo: number
  }

  issues: {
    text: string
    severity: "high" | "medium" | "low"
  }[]

  priorities: string[]
  summary: string
}

// -----------------------
// HELPERS
// -----------------------

function classify(score: number): "weak" | "moderate" | "strong" {
  if (score >= 70) return "strong"
  if (score >= 40) return "moderate"
  return "weak"
}

function getCoverage(arr: any[], key: string) {
  if (arr.length === 0) return 0
  return arr.filter((a) => a[key]).length / arr.length
}

function detectPlatform(html: string) {
  if (html.includes("cdn.shopify.com")) return "shopify"
  if (html.includes("wp-content")) return "woocommerce"
  if (html.includes("magento")) return "magento"
  return "custom"
}

// -----------------------
// MAIN
// -----------------------

export async function runAudit(url: string): Promise<AuditReport> {
  // -----------------------
  // Fetch homepage
  // -----------------------
  const home = await fetch(url)
  const html = await home.text()

  // -----------------------
  // Extract product links
  // -----------------------
  const links = [...html.matchAll(/href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((l) => l.includes("product") || l.includes("shop"))
    .slice(0, 10)

  // -----------------------
  // Fetch product pages
  // -----------------------
  const productPages = await Promise.all(
    links.map(async (l) => {
      try {
        const full = l.startsWith("http") ? l : url + l
        const res = await fetch(full)
        return await res.text()
      } catch {
        return ""
      }
    })
  )

  // -----------------------
  // Signals
  // -----------------------
  const signals = productPages.map((p) => ({
    schema: /"@type"\s*:\s*"Product"/i.test(p),
    price: /₹|\$|price/i.test(p),
    availability: /in stock|out of stock/i.test(p),
    cart: /add to cart|buy now/i.test(p),
    desc: p.length > 500,
    attrs: /size|color|material/i.test(p),
  }))

  const schemaCoverage = getCoverage(signals, "schema")
  const priceCoverage = getCoverage(signals, "price")
  const attrCoverage = getCoverage(signals, "attrs")
  const descCoverage = getCoverage(signals, "desc")
  const cartCoverage = getCoverage(signals, "cart")

  // -----------------------
  // 1️⃣ LLMs.txt
  // -----------------------
  const llmsScore =
    (html.includes("sitemap") ? 30 : 0) +
    (html.includes("robots") ? 20 : 0) +
    (links.length > 0 ? 30 : 0) +
    (links.length > 20 ? 20 : 10)

  // -----------------------
  // 2️⃣ Markdown
  // -----------------------
  const markdownScore = Math.round(
    descCoverage * 50 + attrCoverage * 50
  )

  // -----------------------
  // 3️⃣ AI Integrations (static + inferred)
  // -----------------------
  const platform = detectPlatform(html)

  let integrationScore = 30
  if (platform === "shopify") integrationScore = 60
  if (platform === "woocommerce") integrationScore = 50
  if (platform === "magento") integrationScore = 30
  if (platform === "custom") integrationScore = 20

  // -----------------------
  // 4️⃣ MCP / Agent
  // -----------------------
  const mcpScore = Math.round(
    (cartCoverage * 0.4 +
      schemaCoverage * 0.3 +
      priceCoverage * 0.3) *
      100
  )

  // -----------------------
  // 5️⃣ GEO / Schema
  // -----------------------
  const geoScore = Math.round(
    (schemaCoverage * 0.5 +
      priceCoverage * 0.25 +
      getCoverage(signals, "availability") * 0.25) *
      100
  )

  // -----------------------
  // FINAL SCORE
  // -----------------------
  const finalScore = Math.round(
    llmsScore * 0.2 +
      markdownScore * 0.2 +
      integrationScore * 0.15 +
      mcpScore * 0.25 +
      geoScore * 0.2
  )

  const confidence = Math.min(100, signals.length * 10)

  // -----------------------
  // ISSUES
  // -----------------------
  const issues = []

  if (!html.includes("sitemap"))
    issues.push({ text: "Missing sitemap.xml", severity: "high" as const })

  if (schemaCoverage < 0.5)
    issues.push({ text: "Missing product schema", severity: "high" as const })

  if (attrCoverage < 0.5)
    issues.push({ text: "Missing product attributes", severity: "medium" as const })

  if (descCoverage < 0.5)
    issues.push({ text: "Weak product descriptions", severity: "medium" as const })

  if (cartCoverage < 0.5)
    issues.push({ text: "Weak add-to-cart signals", severity: "medium" as const })

  const priorities = issues.slice(0, 5).map((i) => i.text)

  const summary = `Your store has ${classify(
    finalScore
  )} AI readiness. Major gaps exist in structured data, crawlability, and agent readiness.`

  // -----------------------
  // RETURN
  // -----------------------
  return {
    score: finalScore,
    status: classify(finalScore),
    confidence,

    categories: {
      llms: llmsScore,
      markdown: markdownScore,
      integrations: integrationScore,
      mcp: mcpScore,
      geo: geoScore,
    },

    issues,
    priorities,
    summary,
  }
}