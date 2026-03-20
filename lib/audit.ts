export interface AuditReport {
  score: number
  categories: {
    discovery: number
    semantic: number
    agent: number
    trust: number
  }
  issues: {
    text: string
    severity: Severity
  }[]
  priorities: string[]
  summary: string
}

type Severity = "high" | "medium" | "low"

interface Finding {
  severity: Severity
  issue: string
  impact: string
  priority: string
}

interface FetchResult {
  ok: boolean
  status: number
  url: string
  html: string
}

interface PageSignals {
  title: boolean
  metaDescription: boolean
  canonical: boolean
  robotsNoindex: boolean
  openGraph: boolean
  lang: boolean
  h1Count: number
  breadcrumb: boolean
  jsonLd: boolean
  productSchema: boolean
  organizationSchema: boolean
  aggregateRating: boolean
  searchForm: boolean
  cartLink: boolean
  checkoutLink: boolean
  addToCart: boolean
  priceVisible: boolean
  availabilityVisible: boolean
  shippingOrReturns: boolean
  contactLink: boolean
  privacyLink: boolean
  termsLink: boolean
  imageCount: number
  imagesWithAlt: number
  internalLinks: string[]
}

interface AuditContext {
  finalUrl: string
  home: FetchResult
  sitemapFound: boolean
  robotsFound: boolean
  homeSignals: PageSignals
  productPages: FetchResult[]
  productSignals: PageSignals[]
  findings: Finding[]
}

const REQUEST_HEADERS = {
  "user-agent": "Mozilla/5.0 (compatible; AgenticAudit/1.0; +https://example.com/bot)",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

const FETCH_TIMEOUT_MS = 10000

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) {
    throw new Error("URL is required")
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  return new URL(withProtocol).toString()
}

async function fetchText(url: string): Promise<FetchResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: REQUEST_HEADERS,
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    })

    const html = await response.text()

    return {
      ok: response.ok,
      status: response.status,
      url: response.url,
      html,
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchWithProtocolFallback(rawUrl: string): Promise<FetchResult> {
  const normalized = normalizeUrl(rawUrl)

  try {
    return await fetchText(normalized)
  } catch {
    const parsed = new URL(normalized)
    if (parsed.protocol !== "https:") {
      throw new Error("Could not fetch the provided URL")
    }

    parsed.protocol = "http:"
    return fetchText(parsed.toString())
  }
}

function hasMatch(input: string, pattern: RegExp): boolean {
  return pattern.test(input)
}

function matchAll(input: string, pattern: RegExp): string[] {
  return Array.from(input.matchAll(pattern), (match) => match[1] || "")
}

function extractInternalLinks(html: string, baseUrl: string): string[] {
  const rawHrefs = matchAll(html, /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)
  const origin = new URL(baseUrl).origin
  const unique = new Set<string>()

  for (const href of rawHrefs) {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      continue
    }

    try {
      const url = new URL(href, baseUrl)
      if (url.origin !== origin) {
        continue
      }

      url.hash = ""
      unique.add(url.toString())
    } catch {
      continue
    }
  }

  return Array.from(unique)
}

function extractPageSignals(html: string, pageUrl: string): PageSignals {
  const lowerHtml = html.toLowerCase()
  const internalLinks = extractInternalLinks(html, pageUrl)
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? []
  const imagesWithAlt = imageTags.filter((tag) => /\balt\s*=\s*["'][^"']+["']/i.test(tag)).length
  const priceRegex = /((?:&#36;|&#8377;|&#8364;|&#163;|\$|₹|€|£)\s?\d)|(\b(?:usd|eur|inr|gbp)\b\s?\d)/i

  return {
    title: hasMatch(html, /<title>\s*[^<]{4,}\s*<\/title>/i),
    metaDescription: hasMatch(html, /<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']{20,}["'][^>]*>/i),
    canonical: hasMatch(html, /<link\b[^>]*rel=["']canonical["'][^>]*href=["'][^"']+["'][^>]*>/i),
    robotsNoindex: hasMatch(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i),
    openGraph: hasMatch(html, /<meta\b[^>]*property=["']og:(title|description|image|url)["'][^>]*>/i),
    lang: hasMatch(html, /<html\b[^>]*lang=["'][^"']+["']/i),
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    breadcrumb: hasMatch(lowerHtml, /breadcrumblist|breadcrumbs?|aria-label=["']breadcrumb["']/i),
    jsonLd: hasMatch(html, /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/i),
    productSchema: hasMatch(lowerHtml, /"@type"\s*:\s*"product"|schema\.org\/product/i),
    organizationSchema: hasMatch(lowerHtml, /"@type"\s*:\s*"organization"|schema\.org\/organization/i),
    aggregateRating: hasMatch(lowerHtml, /aggregaterating|ratingvalue|reviews?\b/i),
    searchForm: hasMatch(lowerHtml, /<input\b[^>]*(type=["']search["']|name=["']q["']|name=["']query["'])|<form\b[^>]*action=["'][^"']*search/i),
    cartLink: hasMatch(lowerHtml, /href=["'][^"']*(cart|bag)["']|>\s*(cart|bag)\s*</i),
    checkoutLink: hasMatch(lowerHtml, /href=["'][^"']*checkout["']|>\s*checkout\s*</i),
    addToCart: hasMatch(lowerHtml, />\s*(add to cart|buy now|add to bag|purchase)\s*</i),
    priceVisible: hasMatch(html, priceRegex),
    availabilityVisible: hasMatch(lowerHtml, /in stock|out of stock|availability|ships in|delivery/i),
    shippingOrReturns: hasMatch(lowerHtml, /shipping|delivery|returns?|refund/i),
    contactLink: hasMatch(lowerHtml, /href=["'][^"']*contact["']|>\s*contact\s*</i),
    privacyLink: hasMatch(lowerHtml, /href=["'][^"']*privacy["']|>\s*privacy\s*</i),
    termsLink: hasMatch(lowerHtml, /href=["'][^"']*(terms|conditions)["']|>\s*terms/i),
    imageCount: imageTags.length,
    imagesWithAlt,
    internalLinks,
  }
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function scoreFromChecks(checks: Array<{ passed: boolean; weight: number }>): number {
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0)
  const earned = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0)
  return Math.round((earned / totalWeight) * 100)
}

function addFinding(findings: Finding[], finding: Finding): void {
  findings.push(finding)
}

function buildSummary(categories: AuditReport["categories"]): string {
  const entries = [
    { label: "discovery", score: categories.discovery },
    { label: "semantic markup", score: categories.semantic },
    { label: "agent accessibility", score: categories.agent },
    { label: "trust signals", score: categories.trust },
  ]

  const strengths = [...entries].sort((a, b) => b.score - a.score).slice(0, 2).map((entry) => entry.label)
  const gaps = [...entries].sort((a, b) => a.score - b.score).slice(0, 2).map((entry) => entry.label)
  const overall = Math.round(
    categories.discovery * 0.25 +
categories.semantic * 0.30 +
categories.agent * 0.25 +
categories.trust * 0.20
  )

  if (overall >= 80) {
    return `Your store is showing strong AI readiness overall, especially in ${strengths.join(" and ")}. The main opportunities are in ${gaps.join(" and ")}.`
  }

  if (overall >= 60) {
    return `Your store has a workable AI foundation with the strongest signals in ${strengths.join(" and ")}. The biggest gaps are in ${gaps.join(" and ")} and those are likely holding the score back.`
  }

  return `Your store needs foundational work before AI agents can reliably discover and understand it. The biggest gaps are in ${gaps.join(" and ")}, while ${strengths.join(" and ")} are comparatively stronger.`
}

function buildFailureReport(message: string): AuditReport {
  return {
    score: 12,
    categories: {
      discovery: 10,
      semantic: 15,
      agent: 10,
      trust: 20,
    },
    issues: [
  {
    text: message,
    severity: "high",
  },
  {
    text: "The audit could not fetch enough HTML to inspect metadata, schema, navigation, or transactional signals.",
    severity: "high",
  },
  {
    text: "No live page analysis was completed, so the score reflects fetch failure rather than site quality.",
    severity: "high",
  },
],
    priorities: [
      "Confirm the site URL is publicly reachable and not blocking server-side requests.",
      "Allow homepage and product pages to be fetched without login or bot challenges.",
      "Retry the audit after connectivity and redirect issues are resolved.",
    ],
    summary: "We could not complete a live audit of this site, so the report is based on access failure rather than a full website review." + ` These gaps are directly limiting your chances of appearing in AI-generated recommendations.`,
  }
}

async function fetchOptionalText(url: string): Promise<string> {
  try {
    const response = await fetchText(url)
    return response.ok ? response.html : ""
  } catch {
    return ""
  }
}

function pickProductCandidates(urls: string[]): string[] {
  const candidates = urls.filter((url) =>
    /\/(product|products|item|items|shop|collections)\b/i.test(url) &&
    !/\/(cart|checkout|account|login|register|search|blog)\b/i.test(url)
  )

  return candidates.slice(0, 2)
}

function scoreDiscovery(context: AuditContext): number {
  const checks = [
    { passed: context.home.ok, weight: 20 },
    { passed: context.homeSignals.title, weight: 10 },
    { passed: context.homeSignals.metaDescription, weight: 10 },
    { passed: context.homeSignals.canonical, weight: 10 },
    { passed: !context.homeSignals.robotsNoindex, weight: 15 },
    { passed: context.robotsFound, weight: 10 },
    { passed: context.sitemapFound, weight: 10 },
    { passed: context.homeSignals.internalLinks.length >= 10, weight: 5 },
    { passed: context.productPages.length > 0, weight: 5 },
    { passed: context.homeSignals.openGraph, weight: 5 },
  ]

  if (!context.robotsFound) {
    addFinding(context.findings, {
      severity: "medium",
      issue: "robots.txt is missing or not reachable, which makes crawler rules less explicit.",
      impact: "AI crawlers lack clear crawl instructions → inefficient or incomplete site discovery.",
      priority: "Publish a reachable robots.txt file with clear crawl rules and sitemap references.",
    })
  }

  if (!context.sitemapFound) {
    addFinding(context.findings, {
      severity: "high",
      issue: "No sitemap.xml detected.",
      impact: "AI crawlers cannot efficiently discover key pages → reduced coverage in AI indexing.",
      priority: "Publish a sitemap.xml and reference it from robots.txt.",
    })
  }

  if (!context.homeSignals.canonical) {
    addFinding(context.findings, {
      severity: "medium",
      issue: "The homepage is missing a canonical tag, which can weaken URL consistency for crawlers.",
      impact: "AI systems may treat duplicate URLs as separate entities → weakens content authority and ranking consistency.",
      priority: "Add canonical URLs to the homepage and key template pages.",
    })
  }

  if (context.homeSignals.robotsNoindex) {
    addFinding(context.findings, {
      severity: "high",
      issue: "The homepage appears to contain a noindex directive, which can block discovery in search and AI retrieval flows.",
      impact: "AI systems cannot access or index your pages → your site will not appear in AI-generated answers.",
      priority: "Remove noindex from pages that should be discoverable.",
    })
  }

  if (context.productPages.length === 0) {
    addFinding(context.findings, {
      severity: "high",
      issue: `0 product links found from ${context.homeSignals.internalLinks.length} internal links on homepage.`,
      impact: "AI crawlers cannot reach product pages → products won’t be discovered or recommended.",
      priority: "Expose product and collection links in server-rendered HTML navigation so crawlers can reach them.",
    })
  }

  if (!context.homeSignals.metaDescription) {
    addFinding(context.findings, {
      severity: "low",
      issue: "The homepage is missing a meaningful meta description.",
      impact: "AI systems lack a concise summary of your page → reduces clarity in AI-generated descriptions.",
      priority: "Add descriptive meta descriptions to key landing and category pages.",
    })
  }

  return scoreFromChecks(checks)
}

function scoreSemantic(context: AuditContext): number {
  const altCoverage = context.productSignals
    .filter((signal) => signal.imageCount > 0)
    .map((signal) => signal.imagesWithAlt / signal.imageCount)

  const checks = [
    { passed: context.homeSignals.lang, weight: 8 },
    { passed: context.homeSignals.h1Count === 1, weight: 8 },
    { passed: context.homeSignals.jsonLd, weight: 12 },
    { passed: context.homeSignals.organizationSchema, weight: 8 },
    { passed: context.homeSignals.breadcrumb, weight: 8 },
    { passed: context.productSignals.some((signal) => signal.productSchema), weight: 24 },
    { passed: context.productSignals.some((signal) => signal.priceVisible), weight: 10 },
    { passed: context.productSignals.some((signal) => signal.availabilityVisible), weight: 10 },
    { passed: average(altCoverage) >= 0.7 || altCoverage.length === 0, weight: 12 },
  ]

  if (!context.homeSignals.jsonLd) {
    addFinding(context.findings, {
      severity: "high",
      issue: "No JSON-LD structured data detected on homepage.",
      impact: "AI lacks structured context about your brand and site → weak understanding in LLMs.",
      priority: "Add JSON-LD structured data for organization, website, and page entities.",
    })
  }

  if (!context.productSignals.some((signal) => signal.productSchema)) {
    addFinding(context.findings, {
      severity: "high",
      issue: `Product schema missing on ${context.productSignals.length} sampled product pages.`,
      impact: "AI systems cannot extract price, availability, or ratings → reduces chances of appearing in AI shopping and product recommendation queries.",
      priority: "Implement Product + Offer schema across PDPs to expose price, stock, and ratings to AI systems (high impact on AI visibility)",
    })
  }

  if (!context.homeSignals.breadcrumb && !context.productSignals.some((signal) => signal.breadcrumb)) {
    addFinding(context.findings, {
      severity: "medium",
      issue: "Breadcrumb markup was not detected, which reduces page context for crawlers and AI agents.",
      impact: "AI lacks hierarchical context of pages → weaker understanding of product relationships and navigation.",
      priority: "Add breadcrumb navigation markup or BreadcrumbList schema to category and product pages.",
    })
  }

  if (altCoverage.length > 0 && average(altCoverage) < 0.7) {
    const percent = Math.round(average(altCoverage) * 100)
    addFinding(context.findings, {
      severity: "medium",
      issue: `Sampled product pages show weak image alt coverage at about ${percent}%, limiting machine interpretation of product images.`,
      impact: "AI cannot interpret product images → reduces visibility in visual and product-related AI recommendations.",
      priority: "Add meaningful alt text to product and merchandising images.",
    })
  }

  if (context.homeSignals.h1Count !== 1) {
    addFinding(context.findings, {
      severity: "low",
      issue: `The homepage has ${context.homeSignals.h1Count} H1 tags instead of a clean single primary heading.`,
      impact: "AI struggles to identify the primary topic of the page → weaker content understanding.",
      priority: "Use a single descriptive H1 on each important page.",
    })
  }

  return scoreFromChecks(checks)
}

function scoreAgent(context: AuditContext): number {
  const checks = [
    { passed: context.home.ok, weight: 15 },
    { passed: !context.homeSignals.robotsNoindex, weight: 10 },
    { passed: context.sitemapFound, weight: 10 },
    { passed: context.productPages.length > 0, weight: 15 },
    { passed: context.productSignals.some((signal) => signal.productSchema), weight: 20 },
    { passed: context.homeSignals.searchForm, weight: 10 },
    { passed: context.productSignals.some((signal) => signal.addToCart), weight: 10 },
    { passed: context.productSignals.some((signal) => signal.priceVisible && signal.availabilityVisible), weight: 10 },
  ]

  if (!context.homeSignals.searchForm) {
    addFinding(context.findings, {
      severity: "low",
      issue: "No obvious crawlable search form was found on the homepage.",
      impact: "AI agents cannot easily navigate or retrieve products → limits discoverability via AI-driven queries.",
      priority: "Provide a simple server-rendered site search form to help agents and users reach products faster.",
    })
  }

  if (!context.productSignals.some((signal) => signal.priceVisible && signal.availabilityVisible)) {
    addFinding(context.findings, {
      severity: "medium",
      issue: `Pricing and availability not clearly exposed on ${context.productSignals.length} sampled product pages.`,
      impact: "AI agents cannot make purchase decisions → reduces chances of being recommended for buying queries.",
      priority: "Ensure product pages expose price and availability together in HTML and structured data.",
    })
  }

  return scoreFromChecks(checks)
}

function scoreTrust(context: AuditContext): number {
  const parsed = new URL(context.finalUrl)
  const checks = [
    { passed: parsed.protocol === "https:", weight: 20 },
    { passed: context.homeSignals.contactLink, weight: 15 },
    { passed: context.homeSignals.privacyLink, weight: 15 },
    { passed: context.homeSignals.termsLink, weight: 10 },
    { passed: context.homeSignals.organizationSchema, weight: 10 },
    { passed: context.productSignals.some((signal) => signal.shippingOrReturns) || context.homeSignals.shippingOrReturns, weight: 10 },
    { passed: context.productSignals.some((signal) => signal.aggregateRating), weight: 10 },
    { passed: context.homeSignals.openGraph, weight: 10 },
  ]

  if (parsed.protocol !== "https:") {
    addFinding(context.findings, {
      severity: "high",
      issue: "The audited URL resolved over HTTP rather than HTTPS.",
      impact: "Lack of secure protocol reduces trust signals → AI systems may deprioritize the site.",
      priority: "Redirect all traffic to HTTPS and keep canonical URLs on secure pages.",
    })
  }

  if (!context.homeSignals.privacyLink) {
    addFinding(context.findings, {
      severity: "medium",
      issue: "Privacy policy link not detected on homepage.",
      impact: "Missing trust signals reduce credibility → AI systems may deprioritize your site.",
      priority: "Link to a privacy policy from the footer or primary navigation.",
    })
  }

  if (!context.homeSignals.contactLink) {
    addFinding(context.findings, {
      severity: "medium",
      issue: "A contact page or contact link was not detected on the homepage sample.",
      impact: "Missing business identity signals → reduces trust and credibility for AI systems.",
      priority: "Expose contact information or a contact page in the footer or navigation.",
    })
  }

  if (!context.productSignals.some((signal) => signal.aggregateRating)) {
    addFinding(context.findings, {
      severity: "low",
      issue: `No reviews detected across ${context.productSignals.length} sampled product pages.`,
      impact: "No social proof signals → lowers chances of being recommended in AI-driven product comparisons.",      
      priority: "Surface product reviews or aggregate ratings where available.",
    })
  }

  return scoreFromChecks(checks)
}

function uniquePriorities(findings: Finding[]): string[] {
  const order: Record<Severity, number> = {
    high: 0,
    medium: 1,
    low: 2,
  }

  return Array.from(
    new Set(
      findings
        .sort((a, b) => order[a.severity] - order[b.severity])
        .map((f) => f.priority)
    )
  ).slice(0, 5)
}

function rankFindings(findings: Finding[]): Finding[] {
  const order: Record<Severity, number> = {
    high: 0,
    medium: 1,
    low: 2,
  }

  return [...findings].sort((a, b) => order[a.severity] - order[b.severity])
}

export async function runAudit(rawUrl: string): Promise<AuditReport> {
  let home: FetchResult

  try {
    home = await fetchWithProtocolFallback(rawUrl)
  } catch {
    return buildFailureReport("We could not fetch the submitted homepage. The site may be blocking automated requests, redirecting unexpectedly, or the URL may be invalid.")
  }

  if (!home.ok || !/html/i.test(home.html)) {
    return buildFailureReport(`The submitted homepage returned status ${home.status}, so a full HTML audit could not be completed.`)
  }

  const finalUrl = home.url
  const robotsUrl = new URL("/robots.txt", finalUrl).toString()
  const sitemapUrl = new URL("/sitemap.xml", finalUrl).toString()
  const homeSignals = extractPageSignals(home.html, finalUrl)

  const [robotsTxt, sitemapText] = await Promise.all([
    fetchOptionalText(robotsUrl),
    fetchOptionalText(sitemapUrl),
  ])

  const productCandidates = pickProductCandidates(homeSignals.internalLinks)
  const productResults = await Promise.all(
    productCandidates.map(async (url) => {
      try {
        return await fetchText(url)
      } catch {
        return null
      }
    })
  )

  const productPages = productResults.filter((result): result is FetchResult => Boolean(result && result.ok))
  const productSignals = productPages.map((page) => extractPageSignals(page.html, page.url))

  const context: AuditContext = {
    finalUrl,
    home,
    sitemapFound: Boolean(sitemapText) || /sitemap:/i.test(robotsTxt),
    robotsFound: Boolean(robotsTxt),
    homeSignals,
    productPages,
    productSignals,
    findings: [],
  }

  const categories = {
    discovery: scoreDiscovery(context),
    semantic: scoreSemantic(context),
    agent: scoreAgent(context),
    trust: scoreTrust(context),
  }

  const rankedFindings = rankFindings(context.findings)
  const issues = rankedFindings.slice(0, 10).map((finding) => ({
    text: `[${finding.severity.toUpperCase()}] ${finding.issue}\n→ ${finding.impact}`,
    severity: finding.severity,
  }))
  const priorities = uniquePriorities(rankedFindings)
  const score = Math.round(
    categories.discovery * 0.25 +
categories.semantic * 0.30 +
categories.agent * 0.25 +
categories.trust * 0.20
  )
  const estimatedLift = Math.min(100, score + 20)
  const lowest = Object.entries(categories).sort((a, b) => a[1] - b[1])[0]

return {
  score: clamp(score, 0, 100),
  categories,

  issues:
    issues.length > 0
      ? issues
      : [
          {
            text: "No major blockers were detected in the sampled pages, though deeper analysis may reveal additional gaps.",
            severity: "low",
          },
        ],

  priorities,

  summary:
    buildSummary(categories) +
    ` Biggest gap is in ${lowest[0]} (${lowest[1]} score).` +
    ` Based on analysis of ${context.productSignals.length} product pages.` +
    ` These gaps are directly limiting your chances of appearing in AI-generated recommendations.` +
    ` Fixing key issues can improve your score from ${score} → ~${estimatedLift}.`,
}
}