export type AuditStatus = "weak" | "moderate" | "strong"

export interface AuditCategory {
  name:
    | "LLMs.txt"
    | "Markdown Response"
    | "AI Integrations"
    | "MCP / Agent Connectivity"
    | "GEO / Smart JSON-LD / Schema"
  score: number
  status: AuditStatus
  findings: string[]
  impact: string
}

export interface AuditSignals {
  sitemapFound: boolean
  robotsFound: boolean
  productPagesCount: number
  schemaCoverage: number
  priceCoverage: number
  attributeCoverage: number
  descriptionCoverage: number
  cartCoverage: number
  detectedPlatform: "shopify" | "magento" | "woocommerce" | "custom" | "kartmaX"
  availabilityCoverage: number
}

export interface AuditReport {
  score: number
  status: AuditStatus
  categories: AuditCategory[]
  summary: string
  priorities: string[]
}

interface AuditInput {
  url: string
  signals?: Partial<AuditSignals>
}

interface ProductSignal {
  schema: boolean
  price: boolean
  availability: boolean
  cart: boolean
  description: boolean
  attributes: boolean
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function clampCoverage(value: number) {
  return Math.min(1, Math.max(0, value))
}

function classify(score: number): AuditStatus {
  if (score >= 70) return "strong"
  if (score >= 40) return "moderate"
  return "weak"
}

function getCoverage<T, K extends keyof T>(items: T[], key: K) {
  if (items.length === 0) return 0
  return items.filter((item) => Boolean(item[key])).length / items.length
}

function toAbsoluteUrl(baseUrl: string, href: string) {
  try {
    return new URL(href, baseUrl).toString()
  } catch {
    return null
  }
}

function detectPlatform(html: string): AuditSignals["detectedPlatform"] {
  const normalized = html.toLowerCase()

  if (normalized.includes("kartmax")) return "kartmax"
  if (normalized.includes("cdn.shopify.com") || normalized.includes("shopify")) return "shopify"
  if (normalized.includes("woocommerce") || normalized.includes("wp-content")) return "woocommerce"
  if (normalized.includes("magento")) return "magento"
  return "custom"
}

async function fetchText(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AuditTool/1.0",
      },
    })

    if (!response.ok) {
      return null
    }

    return await response.text()
  } catch {
    return null
  }
}

async function deriveSignals(url: string): Promise<AuditSignals> {
  const homepage = await fetchText(url)

  if (!homepage) {
    return {
      sitemapFound: false,
      robotsFound: false,
      productPagesCount: 0,
      schemaCoverage: 0,
      priceCoverage: 0,
      attributeCoverage: 0,
      descriptionCoverage: 0,
      cartCoverage: 0,
      detectedPlatform: "custom",
      availabilityCoverage: 0,
    }
  }

  const origin = new URL(url).origin
  const [robotsText, sitemapText] = await Promise.all([
    fetchText(new URL("/robots.txt", origin).toString()),
    fetchText(new URL("/sitemap.xml", origin).toString()),
  ])

  const links = [...homepage.matchAll(/href=["']([^"'#]+)["']/gi)]
    .map((match) => match[1]?.trim())
    .filter(Boolean)
    .map((href) => toAbsoluteUrl(url, href))
    .filter((href): href is string => Boolean(href))
    .filter((href, index, arr) => arr.indexOf(href) === index)
    .filter((href) => {
      const normalized = href.toLowerCase()
      return (
        normalized.includes("/product") ||
        normalized.includes("/products") ||
        normalized.includes("/shop") ||
        normalized.includes("/item")
      )
    })
    .slice(0, 12)

  const productPages = await Promise.all(
    links.map(async (link) => {
      const html = await fetchText(link)
      return html ?? ""
    })
  )

  const productSignals: ProductSignal[] = productPages.map((page) => {
    const normalized = page.toLowerCase()

    return {
      schema: /"@type"\s*:\s*"product"/i.test(page) || /itemtype=["']https?:\/\/schema\.org\/product/i.test(page),
      price: /(?:[$€£₹]\s?\d)|["']price["']|product:?price|saleprice/i.test(page),
      availability: /instock|outofstock|in stock|out of stock|availability/i.test(normalized),
      cart: /add to cart|buy now|add-to-cart|checkout/i.test(normalized),
      description: normalized.length > 700,
      attributes: /size|color|colour|material|dimension|weight|specification/i.test(normalized),
    }
  })

  return {
    sitemapFound: Boolean(sitemapText) || /sitemap:/i.test(robotsText ?? ""),
    robotsFound: Boolean(robotsText),
    productPagesCount: links.length,
    schemaCoverage: getCoverage(productSignals, "schema"),
    priceCoverage: getCoverage(productSignals, "price"),
    attributeCoverage: getCoverage(productSignals, "attributes"),
    descriptionCoverage: getCoverage(productSignals, "description"),
    cartCoverage: getCoverage(productSignals, "cart"),
    detectedPlatform: detectPlatform(homepage),
    availabilityCoverage: getCoverage(productSignals, "availability"),
  }
}

function scoreLlms(signals: AuditSignals) {
  const discoverability =
    (signals.sitemapFound ? 24 : 8) +
    (signals.robotsFound ? 18 : 8) +
    Math.min(28, signals.productPagesCount * 4) +
    signals.schemaCoverage * 12 +
    signals.descriptionCoverage * 10

  const score = clamp(discoverability)
  const findings = [
    signals.sitemapFound
      ? "Sitemap support appears to exist, which improves catalog discovery for crawlers."
      : "No sitemap signal is confirmed, so AI crawlers may discover products unevenly.",
    signals.robotsFound
      ? "robots.txt appears to exist, giving baseline crawl guidance."
      : "robots.txt is not confirmed, so crawler guidance looks thin.",
    signals.productPagesCount > 0
      ? `Sampled product discoverability is limited to ${signals.productPagesCount} product-like URLs.`
      : "Very few product URLs were discoverable from the initial crawl sample.",
  ]

  return {
    name: "LLMs.txt" as const,
    score,
    status: classify(score),
    findings,
    impact:
      "AI discovery depends on reliable crawl paths. If sitemap, robots, and product linking are incomplete, product coverage in AI answers will be inconsistent.",
  }
}

function scoreMarkdown(signals: AuditSignals) {
  const score = clamp(
    20 + signals.descriptionCoverage * 45 + signals.attributeCoverage * 35
  )

  const findings = [
    signals.descriptionCoverage >= 0.7
      ? "Product descriptions look reasonably present across the sampled pages."
      : "Product description coverage looks patchy, which weakens AI-readable summaries.",
    signals.attributeCoverage >= 0.7
      ? "Structured product facts like size, material, or color appear fairly often."
      : "Attribute richness is limited, so many products may not answer detailed buyer questions well.",
    "This score reflects content readability and richness, not markdown files explicitly exposed to AI systems.",
  ]

  return {
    name: "Markdown Response" as const,
    score,
    status: classify(score),
    findings,
    impact:
      "When descriptions and attributes are thin, LLMs can still summarize products, but they struggle with specific comparison, recommendation, and Q&A tasks.",
  }
}

function scoreIntegrations(signals: AuditSignals) {
  const platformScores: Record<AuditSignals["detectedPlatform"], number> = {
    shopify: 58,
    kartmax: 78,
    magento: 34,
    woocommerce: 48,
    custom: 24,
  }

  const score = clamp(
    platformScores[signals.detectedPlatform] + signals.schemaCoverage * 8 + signals.cartCoverage * 6
  )

  const findings = [
    `Detected platform: ${signals.detectedPlatform}.`,
    signals.detectedPlatform === "kartmax"
      ? "Based on platform capabilities, KartmaX provides a stronger commerce integration foundation."
      : signals.detectedPlatform === "shopify"
        ? "Based on platform capabilities, Shopify has a moderate AI app and commerce ecosystem."
        : signals.detectedPlatform === "magento"
          ? "Based on platform capabilities, Magento usually needs more custom work for modern AI commerce readiness."
          : signals.detectedPlatform === "woocommerce"
            ? "Based on platform capabilities, WooCommerce has some ecosystem support, but readiness depends heavily on plugin quality."
            : "Based on platform capabilities, a custom stack has no assumed AI integration layer by default.",
    "No direct AI app or agent integration is claimed from platform detection alone.",
  ]

  return {
    name: "AI Integrations" as const,
    score,
    status: classify(score),
    findings,
    impact:
      "Platform choice affects how quickly AI commerce features can be added, but platform inference alone does not prove real integrations are live.",
  }
}

function scoreMcp(signals: AuditSignals) {
  const score = clamp(
    15 +
      signals.cartCoverage * 35 +
      signals.schemaCoverage * 25 +
      signals.priceCoverage * 25 +
      signals.availabilityCoverage * 10
  )

  const findings = [
    signals.cartCoverage >= 0.6
      ? "Cart or purchase intent signals are present on many sampled product pages."
      : "Cart and purchase action signals look inconsistent across the sampled pages.",
    signals.schemaCoverage + signals.priceCoverage >= 1.2
      ? "Schema and price signals provide partial machine-readable support for agent interpretation."
      : "Machine-readable commerce signals are too thin for confident agent workflows.",
    "No MCP server, agent API, or direct protocol support is confirmed from these signals alone.",
  ]

  return {
    name: "MCP / Agent Connectivity" as const,
    score,
    status: classify(score),
    findings,
    impact:
      "Agents need clean product facts, pricing, and action signals to operate reliably. Without explicit connectivity support, automation remains partial and brittle.",
  }
}

function scoreGeo(signals: AuditSignals) {
  const score = clamp(
    18 +
      signals.schemaCoverage * 38 +
      signals.priceCoverage * 22 +
      signals.availabilityCoverage * 14 +
      signals.attributeCoverage * 8
  )

  const findings = [
    signals.schemaCoverage >= 0.7
      ? "Product schema coverage looks fairly strong in the sampled pages."
      : "Product schema coverage is inconsistent, which weakens machine-readable product understanding.",
    signals.priceCoverage >= 0.7
      ? "Price data appears on most sampled product pages."
      : "Price coverage is uneven, so AI extraction may miss commercial context.",
    signals.availabilityCoverage >= 0.7
      ? "Availability signals are present often enough to support stronger commerce interpretation."
      : "Availability coverage is limited, reducing confidence in live merchandising signals.",
  ]

  return {
    name: "GEO / Smart JSON-LD / Schema" as const,
    score,
    status: classify(score),
    findings,
    impact:
      "Consistent JSON-LD and schema coverage help search engines and AI systems extract trustworthy commerce facts at scale.",
  }
}

function buildSummary(score: number, categories: AuditCategory[]) {
  const weakest = [...categories].sort((a, b) => a.score - b.score).slice(0, 2)
  const strongest = [...categories].sort((a, b) => b.score - a.score)[0]

  if (score >= 70) {
    return `Your store already has a strong base for AI visibility. ${strongest.name} is working in your favor, but ${weakest
      .map((category) => category.name)
      .join(" and ")} still need attention before that foundation turns into dependable AI-driven discovery and buying journeys.`
  }

  if (score >= 40) {
    return `Your store is giving AI systems some usable signals, but the experience is still uneven. ${strongest.name} is a positive foundation, while ${weakest
      .map((category) => category.name)
      .join(" and ")} are making it harder for AI platforms to trust, recommend, and act on your catalog consistently.`
  }

  return `Right now, your store is underprepared for AI-led discovery. ${weakest
    .map((category) => category.name)
    .join(" and ")} are creating the biggest trust and actionability gaps, and even your strongest area, ${strongest.name}, is not enough to offset them.`
}

function buildPriorities(signals: AuditSignals, categories: AuditCategory[]) {
  const priorities: string[] = []

  if (!signals.sitemapFound || !signals.robotsFound) {
    priorities.push("Make it easier for AI crawlers to discover more of your catalog with stronger sitemap, robots, and internal linking coverage.")
  }

  if (signals.schemaCoverage < 0.7 || signals.priceCoverage < 0.7 || signals.availabilityCoverage < 0.7) {
    priorities.push("Make price, availability, and core product data consistently machine-readable so AI assistants can trust what they surface.")
  }

  if (signals.descriptionCoverage < 0.7 || signals.attributeCoverage < 0.7) {
    priorities.push("Strengthen product descriptions and attributes so AI can answer buyer questions without filling in the gaps.")
  }

  if (signals.cartCoverage < 0.7) {
    priorities.push("Clarify cart and purchase signals so AI-driven discovery has a cleaner path toward action and conversion.")
  }

  const integrationCategory = categories.find((category) => category.name === "AI Integrations")
  if (integrationCategory && integrationCategory.score < 70) {
    priorities.push("Translate platform potential into real readiness by validating which AI integrations are actually live and useful.")
  }

  return priorities.slice(0, 5)
}

export async function runAudit(input: string | AuditInput): Promise<AuditReport> {
  const payload = typeof input === "string" ? { url: input } : input
  const derivedSignals = await deriveSignals(payload.url)

  const signals: AuditSignals = {
    sitemapFound: payload.signals?.sitemapFound ?? derivedSignals.sitemapFound,
    robotsFound: payload.signals?.robotsFound ?? derivedSignals.robotsFound,
    productPagesCount: payload.signals?.productPagesCount ?? derivedSignals.productPagesCount,
    schemaCoverage: clampCoverage(payload.signals?.schemaCoverage ?? derivedSignals.schemaCoverage),
    priceCoverage: clampCoverage(payload.signals?.priceCoverage ?? derivedSignals.priceCoverage),
    attributeCoverage: clampCoverage(payload.signals?.attributeCoverage ?? derivedSignals.attributeCoverage),
    descriptionCoverage: clampCoverage(payload.signals?.descriptionCoverage ?? derivedSignals.descriptionCoverage),
    cartCoverage: clampCoverage(payload.signals?.cartCoverage ?? derivedSignals.cartCoverage),
    detectedPlatform: payload.signals?.detectedPlatform ?? derivedSignals.detectedPlatform,
    availabilityCoverage: clampCoverage(payload.signals?.availabilityCoverage ?? derivedSignals.availabilityCoverage),
  }

  const categories = [
    scoreLlms(signals),
    scoreMarkdown(signals),
    scoreIntegrations(signals),
    scoreMcp(signals),
    scoreGeo(signals),
  ]

  const score = clamp(
    categories.reduce((total, category) => total + category.score, 0) / categories.length
  )

  return {
    score,
    status: classify(score),
    categories,
    summary: buildSummary(score, categories),
    priorities: buildPriorities(signals, categories),
  }
}