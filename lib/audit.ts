export type AuditStatus = "weak" | "moderate" | "strong"

export interface AuditCategory {
  name:
    | "LLMs.txt"
    | "AI Documentation"
    | "Markdown Response"
    | "AI Integrations"
    | "Agentic Commerce Readiness"
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
  llmsTxtFound: boolean
  llmsFullFound: boolean
  llmsTxtParsable: boolean
  llmsTxtStructured: boolean
  llmsTxtHasCanonicalLinks: boolean
  llmsTxtHasMarkdownLinks: boolean
  llmsTxtHasAiGuidance: boolean
  llmsTxtSectionQuality: number
  llmsTxtContentDepth: number
  markdownDocsFound: boolean
  agentDocsFound: boolean
  markdownStructured: boolean
  markdownHasWorkflowGuidance: boolean
  markdownHasApiReferences: boolean
  markdownHasAgentInstructions: boolean
  markdownSemanticQuality: number
  schemaCoverage: number
  priceCoverage: number
  attributeCoverage: number
  descriptionCoverage: number
  cartCoverage: number
  detectedPlatform: "shopify" | "magento" | "woocommerce" | "custom" | "kartmaX"
  availabilityCoverage: number
  mcpEndpointDetected: boolean
  publicApiDetected: boolean
  scrapeableDataDetected: boolean
  stableIdentifierCoverage: number
  cartApiCoverage: number
  checkoutFlowCoverage: number
  realtimeCommerceCoverage: number
  structuredDataConsistency: number
  hasGraphQL: boolean
  hasCheckoutApi: boolean
  apiEndpointUrls: string[]
  networkRequestUrls: string[]
  oauthDiscoveryDetected: boolean
  authenticatedApiDetected: boolean
  stepsToFirstSuccess: number
  hasDefaultContext: boolean
  clearToolDiscovery: boolean
  readCoverage: number
  writeCoverage: number
  toolCoverage: number
  successRate: number
  schemaConsistency: number
  latencyScore: number
  surfaceAuthenticityScore: number
  actionabilityDetected: boolean
  sessionContinuityDetected: boolean
  semanticClarityScore: number
}

export interface AuditReport {
  score: number
  status: AuditStatus
  categories: AuditCategory[]
  summary: string
  priorities: string[]
  signals?: AuditSignals
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
  stableIdentifiers: boolean
  cartApi: boolean
  checkoutFlow: boolean
  realtimeCommerce: boolean
}

interface PageNetworkSignals {
  requestUrls: string[]
  hasGraphQL: boolean
  hasCartApi: boolean
  hasCheckout: boolean
  hasApi: boolean
  readCapabilities: string[]
  writeCapabilities: string[]
}

interface LlmsDocumentAssessment {
  found: boolean
  acceptedContentType: boolean
  minimumContentLength: boolean
  parsable: boolean
  structured: boolean
  hasCanonicalLinks: boolean
  hasHeadings: boolean
  hasBulletLists: boolean
  hasMarkdownLinks: boolean
  hasAiGuidance: boolean
  hasAiReadableReferences: boolean
  sectionQuality: number
  contentDepth: number
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

  if (normalized.includes("kartmax")) return "kartmaX"
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

async function probeEndpoint(url: string) {
  try {
    const startedAt = Date.now()
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AuditTool/1.0",
        Accept: "application/json, text/plain, */*",
      },
    })

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? ""
    const body = await response.text().catch(() => "")

    return {
      url,
      ok: response.ok,
      status: response.status,
      contentType,
      body,
      finalUrl: response.url,
      latencyMs: Date.now() - startedAt,
    }
  } catch {
    return null
  }
}

function hasAcceptedLlmsContentType(contentType: string) {
  return (
    contentType.includes("text/plain") ||
    contentType.includes("text/markdown") ||
    contentType.includes("text/x-markdown") ||
    contentType.includes("application/markdown")
  )
}

function isHomepageLikeUrl(candidateUrl: string, expectedPath: string) {
  try {
    const url = new URL(candidateUrl)
    const pathname = url.pathname.replace(/\/+$/, "") || "/"
    const normalizedExpectedPath = expectedPath.replace(/\/+$/, "")
    return pathname === "/" || pathname === "" || pathname === normalizedExpectedPath
  } catch {
    return false
  }
}

function getLlmsSectionQuality(assessment: {
  hasHeadings: boolean
  hasBulletLists: boolean
  hasCanonicalLinks: boolean
  hasMarkdownLinks: boolean
  hasAiGuidance: boolean
  hasAiReadableReferences: boolean
}) {
  return clampCoverage(
    (assessment.hasHeadings ? 0.2 : 0) +
      (assessment.hasBulletLists ? 0.15 : 0) +
      (assessment.hasCanonicalLinks ? 0.2 : 0) +
      (assessment.hasMarkdownLinks ? 0.15 : 0) +
      (assessment.hasAiGuidance ? 0.15 : 0) +
      (assessment.hasAiReadableReferences ? 0.15 : 0)
  )
}

function isValidMarkdownDocDiscovery(
  endpoint: Awaited<ReturnType<typeof probeEndpoint>>,
  expectedPath: string
) {
  if (!endpoint) return false

  const body = endpoint.body.trim()
  const acceptedContentType = hasAcceptedLlmsContentType(endpoint.contentType)
  const minimumContentLength = body.length >= 140
  const redirectsToHomepage =
    endpoint.finalUrl !== endpoint.url &&
    isHomepageLikeUrl(endpoint.finalUrl, expectedPath)

  return endpoint.status === 200 && acceptedContentType && minimumContentLength && !redirectsToHomepage
}

function assessLlmsDocument(
  endpoint: Awaited<ReturnType<typeof probeEndpoint>>,
  expectedPath: string
): LlmsDocumentAssessment {
  if (!endpoint?.ok) {
    return {
      found: false,
      acceptedContentType: false,
      minimumContentLength: false,
      parsable: false,
      structured: false,
      hasCanonicalLinks: false,
      hasHeadings: false,
      hasBulletLists: false,
      hasMarkdownLinks: false,
      hasAiGuidance: false,
      hasAiReadableReferences: false,
      sectionQuality: 0,
      contentDepth: 0,
    }
  }

  const body = endpoint.body.trim()
  const normalizedBody = body.toLowerCase()
  const acceptedContentType = hasAcceptedLlmsContentType(endpoint.contentType)
  const minimumContentLength = body.length >= 140
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const headingCount = lines.filter((line) => /^#{1,6}\s+\S/.test(line)).length
  const bulletCount = lines.filter((line) => /^[-*+]\s+\S/.test(line)).length
  const markdownLinks = [...body.matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g)]
  const canonicalLinks = markdownLinks.filter((match) =>
    /(canonical|primary|official|site|homepage|catalog|docs|documentation|products?)/i.test(match[1] ?? "")
  )
  const groupedSectionCount = headingCount + bulletCount
  const hasHtmlShell = /<html[\s>]|<body[\s>]|<!doctype html/i.test(body)
  const isTinyPlaceholder =
    body.length < 140 ||
    /coming soon|todo|placeholder|tbd|under construction|hello world/i.test(normalizedBody)
  const redirectsToHomepage =
    endpoint.finalUrl !== endpoint.url &&
    isHomepageLikeUrl(endpoint.finalUrl, expectedPath)
  const hasAiGuidance =
    (/(ai|llm|language model|agent|assistant|crawler|bot|mcp|ucp)/i.test(normalizedBody) &&
      /(use|prefer|should|guidance|instruction|instructions|access|consume|read|index|crawl|connect|discover|tools?)/i.test(normalizedBody)) ||
    /(mcp|ucp|agent instructions?|commerce workflows?)/i.test(normalizedBody)
  const hasAiReadableReferences =
    /(api|docs|documentation|catalog|products?|collections?|search|feed|schema|json|markdown|guide|policy|workflow|commerce)/i.test(normalizedBody)
  const hasHeadings = headingCount >= 2
  const hasBulletLists = bulletCount >= 2
  const contentDepth = clampCoverage(
    Math.min(1, body.length / 1200) * 0.45 +
      Math.min(1, groupedSectionCount / 8) * 0.3 +
      Math.min(1, markdownLinks.length / 8) * 0.25
  )
  const parsable =
    endpoint.status === 200 &&
    acceptedContentType &&
    minimumContentLength &&
    !hasHtmlShell &&
    !isTinyPlaceholder &&
    !redirectsToHomepage
  const structured =
    parsable &&
    lines.length >= 4 &&
    hasHeadings &&
    hasBulletLists &&
    groupedSectionCount >= 4 &&
    hasAiReadableReferences
  const sectionQuality = getLlmsSectionQuality({
    hasHeadings,
    hasBulletLists,
    hasCanonicalLinks: canonicalLinks.length > 0,
    hasMarkdownLinks: markdownLinks.length > 0,
    hasAiGuidance,
    hasAiReadableReferences,
  })

  return {
    found: parsable,
    acceptedContentType,
    minimumContentLength,
    parsable,
    structured,
    hasCanonicalLinks: parsable && canonicalLinks.length > 0,
    hasHeadings,
    hasBulletLists,
    hasMarkdownLinks: parsable && markdownLinks.length > 0,
    hasAiGuidance,
    hasAiReadableReferences,
    sectionQuality,
    contentDepth,
  }
}

function scoreProbeResult(endpoint: Awaited<ReturnType<typeof probeEndpoint>>) {
  if (!endpoint) return -1
  if (endpoint.ok) return 3
  if (endpoint.status === 401 || endpoint.status === 403) return 2
  return 1
}

function normalizeBaseOrigin(origin: string) {
  try {
    const url = new URL(origin)
    url.pathname = ""
    url.search = ""
    url.hash = ""
    return url.origin
  } catch {
    return null
  }
}

function getProbeBaseVariants(inputUrl: string, extraHosts: string[] = []) {
  const origin = normalizeBaseOrigin(inputUrl)
  if (!origin) return []

  const baseUrl = new URL(origin)
  const hostVariants = new Set<string>([baseUrl.hostname])

  if (baseUrl.hostname.startsWith("www.")) {
    hostVariants.add(baseUrl.hostname.replace(/^www\./, ""))
  } else {
    hostVariants.add(`www.${baseUrl.hostname}`)
  }

  for (const host of extraHosts) {
    const normalizedHost = host.trim().toLowerCase()
    if (!normalizedHost) continue
    hostVariants.add(normalizedHost)
    if (normalizedHost.startsWith("www.")) {
      hostVariants.add(normalizedHost.replace(/^www\./, ""))
    } else {
      hostVariants.add(`www.${normalizedHost}`)
    }
  }

  const variants = new Set<string>()
  for (const protocol of ["https:", "http:"]) {
    for (const host of hostVariants) {
      const candidate = new URL(origin)
      candidate.protocol = protocol
      candidate.hostname = host
      candidate.pathname = ""
      candidate.search = ""
      candidate.hash = ""
      variants.add(candidate.origin)
    }
  }

  return [...variants]
}

function extractRelatedHosts(html: string, fallbackOrigin: string) {
  const hosts = new Set<string>()

  for (const match of html.matchAll(/https?:\/\/([^\/"'`\s<>()]+)/gi)) {
    const host = match[1]?.trim().toLowerCase()
    if (!host) continue

    if (/(api|auth|oauth|agent|agents|mcp|ai|account|accounts|login|app)\./i.test(host)) {
      hosts.add(host)
    }
  }

  try {
    hosts.add(new URL(fallbackOrigin).hostname.toLowerCase())
  } catch {
    // ignore invalid fallback
  }

  return [...hosts]
}

function extractHostsFromUrls(urls: string[]) {
  const hosts = new Set<string>()

  for (const value of urls) {
    try {
      hosts.add(new URL(value).hostname.toLowerCase())
    } catch {
      // ignore invalid urls
    }
  }

  return [...hosts]
}

function extractHostsFromProbeResults(
  endpoints: Array<Awaited<ReturnType<typeof probeEndpoint>> | null | undefined>
) {
  const hosts = new Set<string>()

  for (const endpoint of endpoints) {
    if (!endpoint?.finalUrl) continue

    try {
      hosts.add(new URL(endpoint.finalUrl).hostname.toLowerCase())
    } catch {
      // ignore invalid probe urls
    }
  }

  return [...hosts]
}

async function probePathAcrossBases(baseOrigins: string[], path: string) {
  const pathVariants = path.endsWith("/") ? [path, path.slice(0, -1)] : [path, `${path}/`]
  const dedupedPathVariants = [...new Set(pathVariants.filter(Boolean))]
  const requests = baseOrigins.flatMap((baseOrigin) =>
    dedupedPathVariants.map((candidatePath) =>
      probeEndpoint(new URL(candidatePath, baseOrigin).toString())
    )
  )
  const results = await Promise.all(requests)

  return results.sort((a, b) => scoreProbeResult(b) - scoreProbeResult(a))[0] ?? null
}

function isProbablyStructuredEndpoint(endpoint: Awaited<ReturnType<typeof probeEndpoint>>) {
  if (!endpoint) return false

  if (endpoint.ok && (endpoint.contentType.includes("json") || endpoint.contentType.includes("graphql"))) {
    return true
  }

  const normalizedBody = endpoint.body.toLowerCase()
  return (
    normalizedBody.includes("graphql") ||
    normalizedBody.includes("query") ||
    normalizedBody.includes("errors") ||
    normalizedBody.includes("swagger") ||
    normalizedBody.includes("openapi")
  )
}

function requiresAuthentication(endpoint: Awaited<ReturnType<typeof probeEndpoint>>) {
  if (!endpoint) return false

  if (endpoint.status === 401 || endpoint.status === 403) {
    return true
  }

  const normalizedBody = endpoint.body.toLowerCase()
  return (
    normalizedBody.includes("unauthorized") ||
    normalizedBody.includes("forbidden") ||
    normalizedBody.includes("access token") ||
    normalizedBody.includes("bearer") ||
    normalizedBody.includes("sign in") ||
    normalizedBody.includes("login required")
  )
}

function isValidMcpEndpoint(endpoint: Awaited<ReturnType<typeof probeEndpoint>>) {
  if (!endpoint || !endpoint.ok) return false

  const finalPath = (() => {
    try {
      return new URL(endpoint.finalUrl).pathname.toLowerCase().replace(/\/+$/, "")
    } catch {
      return ""
    }
  })()
  const isDedicatedMcpPath = finalPath === "/mcp" || finalPath === "/api/mcp"
  if (!isDedicatedMcpPath) return false

  const body = endpoint.body.toLowerCase()
  const hasJsonRpcTransport =
    body.includes("json-rpc") ||
    body.includes("\"jsonrpc\"") ||
    body.includes("model context protocol")
  const hasToolRegistry =
    body.includes("\"tools\"") &&
    (
      body.includes("inputschema") ||
      body.includes("\"inputschema\"") ||
      body.includes("annotations") ||
      body.includes("\"annotations\"")
    )
  const hasExplicitMcpSignal =
    body.includes("model context protocol") ||
    body.includes("servercapabilities")
  const hasAnthropicMcpShape =
    body.includes("anthropic") &&
    (
      body.includes("\"tools\"") ||
      body.includes("inputschema") ||
      body.includes("\"inputschema\"") ||
      body.includes("servercapabilities")
    )

  return (
    endpoint.contentType.includes("json") &&
    (hasJsonRpcTransport || hasToolRegistry || hasExplicitMcpSignal || hasAnthropicMcpShape)
  )
}

function hasOAuthDiscoveryMetadata(endpoint: Awaited<ReturnType<typeof probeEndpoint>>) {
  if (!endpoint?.ok) return false

  const body = endpoint.body.toLowerCase()
  return body.includes("authorization_endpoint") && body.includes("token_endpoint")
}

function getProtocolEvidenceScore(body: string) {
  const normalized = body.toLowerCase()
  let score = 0

  if (normalized.includes("authorization_endpoint") && normalized.includes("token_endpoint")) score += 0.2
  if (normalized.includes("tools")) score += 0.15
  if (normalized.includes("capabilities")) score += 0.15
  if (normalized.includes("inputschema")) score += 0.15
  if (normalized.includes("annotations")) score += 0.1
  if (normalized.includes("json-rpc") || normalized.includes("\"jsonrpc\"")) score += 0.1
  if (normalized.includes("openapi") || normalized.includes("swagger")) score += 0.05
  if (normalized.includes("__schema") || normalized.includes("introspectionquery")) score += 0.05
  if (normalized.includes("functions") || normalized.includes("tool registry")) score += 0.05

  return clampCoverage(score)
}

function getSemanticClarity(text: string) {
  const normalized = text.toLowerCase()
  let score = 0

  if (/(product|catalog|order|cart|checkout|discount|inventory|analytics|report)/i.test(normalized)) score += 0.35
  if (/(create|update|delete|get|list|search|analy[sz]e|lookup)/i.test(normalized)) score += 0.25
  if (/(inputschema|description|summary|annotations|parameters)/i.test(normalized)) score += 0.25
  if (/(agent|tool|workflow|action|session|context)/i.test(normalized)) score += 0.15

  return clampCoverage(score)
}

function extractQuotedUrls(source: string, baseUrl: string) {
  const urls: string[] = []
  const patterns = [
    /fetch\(\s*["'`]([^"'`]+)["'`]/gi,
    /axios\.(?:get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]/gi,
    /\.open\(\s*["'`][A-Z]+["'`]\s*,\s*["'`]([^"'`]+)["'`]/gi,
    /["'`](\/(?:api|cart|checkout|graphql)[^"'`]*)["'`]/gi,
  ]

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const candidate = match[1]?.trim()
      if (!candidate) continue

      const absoluteUrl = toAbsoluteUrl(baseUrl, candidate)
      if (absoluteUrl) {
        urls.push(absoluteUrl)
      }
    }
  }

  return [...new Set(urls)]
}

function extractNetworkSignals(page: string, baseUrl: string): PageNetworkSignals {
  const normalized = page.toLowerCase()
  const requestUrls = extractQuotedUrls(page, baseUrl)
  const hasGraphQL =
    requestUrls.some((url) => url.toLowerCase().includes("graphql")) ||
    normalized.includes("graphql") ||
    normalized.includes("storefrontapi")
  const hasCartApi =
    requestUrls.some((url) => /\/cart|cart\//i.test(url)) ||
    /cartcreate|cartlinesadd|addtocart|api\/cart/i.test(normalized)
  const hasCheckout =
    requestUrls.some((url) => /\/checkout/i.test(url)) ||
    /checkout|begincheckout|checkouturl|web_url|checkoutsession|createcheckout/i.test(normalized)
  const hasApi =
    requestUrls.some((url) => /\/api\/|graphql/i.test(url)) ||
    /\/api\/|graphql|rest api|openapi|swagger/i.test(normalized)
  const readCapabilities = [
    requestUrls.some((url) => /product|catalog|collection/i.test(url)) || /product|catalog|collection/i.test(normalized)
      ? "products"
      : "",
    requestUrls.some((url) => /order/i.test(url)) || /order/i.test(normalized) ? "orders" : "",
    requestUrls.some((url) => /analytics|report|insight|dashboard/i.test(url)) || /analytics|report|insight|dashboard/i.test(normalized)
      ? "analytics"
      : "",
  ].filter(Boolean)
  const writeCapabilities = [
    hasCartApi ? "cart" : "",
    hasCheckout ? "checkout" : "",
    requestUrls.some((url) => /action|mutation|update|create|delete|post/i.test(url)) ||
    /cartcreate|cartlinesadd|mutation|update|createcheckout/i.test(normalized)
      ? "actions"
      : "",
  ].filter(Boolean)

  return {
    requestUrls,
    hasGraphQL,
    hasCartApi,
    hasCheckout,
    hasApi,
    readCapabilities,
    writeCapabilities,
  }
}

async function deriveSignals(url: string): Promise<AuditSignals> {
  const homepageProbe = await probeEndpoint(url)
  const homepage = homepageProbe?.ok ? homepageProbe.body : null

  if (!homepage) {
    return {
      sitemapFound: false,
      robotsFound: false,
      productPagesCount: 0,
      llmsTxtFound: false,
      llmsFullFound: false,
      llmsTxtParsable: false,
      llmsTxtStructured: false,
      llmsTxtHasCanonicalLinks: false,
      llmsTxtHasMarkdownLinks: false,
      llmsTxtHasAiGuidance: false,
      llmsTxtSectionQuality: 0,
      llmsTxtContentDepth: 0,
      markdownDocsFound: false,
      agentDocsFound: false,
      markdownStructured: false,
      markdownHasWorkflowGuidance: false,
      markdownHasApiReferences: false,
      markdownHasAgentInstructions: false,
      markdownSemanticQuality: 0,
      schemaCoverage: 0,
      priceCoverage: 0,
      attributeCoverage: 0,
      descriptionCoverage: 0,
      cartCoverage: 0,
      detectedPlatform: "custom",
      availabilityCoverage: 0,
      mcpEndpointDetected: false,
      publicApiDetected: false,
      scrapeableDataDetected: false,
      stableIdentifierCoverage: 0,
      cartApiCoverage: 0,
      checkoutFlowCoverage: 0,
      realtimeCommerceCoverage: 0,
      structuredDataConsistency: 0,
      hasGraphQL: false,
      hasCheckoutApi: false,
      apiEndpointUrls: [],
      networkRequestUrls: [],
      oauthDiscoveryDetected: false,
      authenticatedApiDetected: false,
      stepsToFirstSuccess: 5,
      hasDefaultContext: false,
      clearToolDiscovery: false,
      readCoverage: 0,
      writeCoverage: 0,
      toolCoverage: 0,
      successRate: 0,
      schemaConsistency: 0,
      latencyScore: 0,
      surfaceAuthenticityScore: 0,
      actionabilityDetected: false,
      sessionContinuityDetected: false,
      semanticClarityScore: 0,
    }
  }

  const resolvedBaseUrl = homepageProbe?.finalUrl ?? url
  const origin = new URL(resolvedBaseUrl).origin
  const relatedHosts = extractRelatedHosts(homepage, origin)
  const probeBaseOrigins = getProbeBaseVariants(resolvedBaseUrl, relatedHosts)
  const agenticCandidates = [
    "/mcp",
    "/api/mcp",
    "/.well-known/oauth-authorization-server",
    "/.well-known/openid-configuration",
    "/authorize",
    "/token",
    "/register",
    "/ucp",
    "/acp",
    "/agent",
    "/agents",
    "/ai",
    "/api/ai",
  ]
  const discoveryCandidates = [
    "/openapi.json",
    "/swagger.json",
    "/api-docs",
    "/docs",
    "/manifest.json",
  ]
  const llmsCandidates = [
    "/llms.txt",
    "/.well-known/llms.txt",
    "/llms-full.txt",
  ]
  const markdownDocCandidates = [
    "/agents.md",
    "/readme.md",
    "/docs.md",
  ]
  const [robotsText, sitemapText, llmsCandidateResults, markdownDocResults, agenticCandidateResults, discoveryCandidateResults, graphqlEndpoint, apiEndpoint] = await Promise.all([
    fetchText(new URL("/robots.txt", origin).toString()),
    fetchText(new URL("/sitemap.xml", origin).toString()),
    Promise.all(llmsCandidates.map((path) => probePathAcrossBases(probeBaseOrigins, path))),
    Promise.all(markdownDocCandidates.map((path) => probePathAcrossBases(probeBaseOrigins, path))),
    Promise.all(agenticCandidates.map((path) => probePathAcrossBases(probeBaseOrigins, path))),
    Promise.all(discoveryCandidates.map((path) => probePathAcrossBases(probeBaseOrigins, path))),
    probePathAcrossBases(probeBaseOrigins, "/graphql"),
    probePathAcrossBases(probeBaseOrigins, "/api/"),
  ])

  const links = [...homepage.matchAll(/href=["']([^"'#]+)["']/gi)]
    .map((match) => match[1]?.trim())
    .filter(Boolean)
    .map((href) => toAbsoluteUrl(resolvedBaseUrl, href))
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

  const pageNetworkSignals = productPages.map((page, index) =>
    extractNetworkSignals(page, links[index] ?? origin)
  )

  const productSignals: ProductSignal[] = productPages.map((page, index) => {
    const normalized = page.toLowerCase()
    const networkSignals = pageNetworkSignals[index]

    return {
      schema: /"@type"\s*:\s*"product"/i.test(page) || /itemtype=["']https?:\/\/schema\.org\/product/i.test(page),
      price: /\$\s?\d|["']price["']|product:?price|saleprice|amount|currency/i.test(page),
      availability: /instock|outofstock|in stock|out of stock|availability/i.test(normalized),
      cart: /add to cart|buy now|add-to-cart|checkout/i.test(normalized),
      description: normalized.length > 700,
      attributes: /size|color|colour|material|dimension|weight|specification/i.test(normalized),
      stableIdentifiers:
        /["']sku["']|sku:|productsku|variantid|productid|data-sku|data-product-id|gtin|mpn/i.test(page),
      cartApi:
        networkSignals.hasCartApi ||
        /\/cart(?:\/add|\/update|\/change)?|addtocart|cart\/(add|items?)|api\/cart|cartcreate|cartlinesadd/i.test(normalized),
      checkoutFlow:
        networkSignals.hasCheckout ||
        /\/checkout|begincheckout|checkouturl|web_url|checkoutsession|createcheckout/i.test(normalized),
      realtimeCommerce:
        /inventory|inventory_quantity|availableforsale|instock|outofstock|compare_at_price|saleprice|finalprice/i.test(normalized),
    }
  })

  const normalizedHomepage = homepage.toLowerCase()
  const llmsAssessments = llmsCandidateResults.map((endpoint, index) =>
    assessLlmsDocument(endpoint, llmsCandidates[index] ?? "/llms.txt")
  )
  const markdownDocAssessments = markdownDocResults.map((endpoint, index) =>
    assessLlmsDocument(endpoint, markdownDocCandidates[index] ?? "/agents.md")
  )
  const primaryLlmsAssessment =
    [...llmsAssessments].sort(
      (a, b) =>
        Number(b.structured) - Number(a.structured) ||
        Number(b.hasCanonicalLinks) - Number(a.hasCanonicalLinks) ||
        Number(b.hasMarkdownLinks) - Number(a.hasMarkdownLinks) ||
        Number(b.hasAiGuidance) - Number(a.hasAiGuidance) ||
        Number(b.parsable) - Number(a.parsable) ||
        b.sectionQuality - a.sectionQuality ||
        Number(b.found) - Number(a.found)
    )[0]
  const primaryMarkdownAssessment =
    [...markdownDocAssessments].sort(
      (a, b) =>
        Number(b.structured) - Number(a.structured) ||
        Number(b.hasCanonicalLinks) - Number(a.hasCanonicalLinks) ||
        Number(b.hasMarkdownLinks) - Number(a.hasMarkdownLinks) ||
        Number(b.hasAiGuidance) - Number(a.hasAiGuidance) ||
        b.sectionQuality - a.sectionQuality ||
        b.contentDepth - a.contentDepth ||
        Number(b.found) - Number(a.found)
    )[0]
  const markdownDiscoveryFlags = markdownDocResults.map((endpoint, index) =>
    isValidMarkdownDocDiscovery(endpoint, markdownDocCandidates[index] ?? "/agents.md")
  )
  const markdownDocsFound = markdownDiscoveryFlags.some(Boolean)
  const agentDocsFound = Boolean(markdownDiscoveryFlags[0])
  const hasValidMarkdownGuidance = markdownDocsFound || agentDocsFound
  const markdownStructured = hasValidMarkdownGuidance && Boolean(primaryMarkdownAssessment?.structured)
  const markdownHasWorkflowGuidance = hasValidMarkdownGuidance && markdownDocAssessments.some(
    (assessment) => assessment.hasAiGuidance || assessment.hasAiReadableReferences
  )
  const markdownHasApiReferences = hasValidMarkdownGuidance && markdownDocAssessments.some(
    (assessment) =>
      (assessment.hasMarkdownLinks || assessment.hasCanonicalLinks || assessment.hasAiReadableReferences)
  )
  const markdownHasAgentInstructions = hasValidMarkdownGuidance && markdownDocAssessments.some(
    (assessment) => assessment.hasAiGuidance
  )
  const markdownSemanticQuality = hasValidMarkdownGuidance
    ? clampCoverage(
        primaryMarkdownAssessment
          ? primaryMarkdownAssessment.sectionQuality * 0.6 + primaryMarkdownAssessment.contentDepth * 0.4
          : 0
      )
    : 0
  const primaryGuidanceAssessment =
    [primaryLlmsAssessment, primaryMarkdownAssessment].sort(
      (a, b) =>
        Number(b.structured) - Number(a.structured) ||
        Number(b.hasCanonicalLinks) - Number(a.hasCanonicalLinks) ||
        Number(b.hasMarkdownLinks) - Number(a.hasMarkdownLinks) ||
        Number(b.hasAiGuidance) - Number(a.hasAiGuidance) ||
        b.sectionQuality - a.sectionQuality ||
        b.contentDepth - a.contentDepth ||
        Number(b.parsable) - Number(a.parsable) ||
        Number(b.found) - Number(a.found)
    )[0]
  const llmsFullAssessment = llmsAssessments[2] ?? {
    found: false,
    acceptedContentType: false,
    minimumContentLength: false,
    parsable: false,
    structured: false,
    hasCanonicalLinks: false,
    hasHeadings: false,
    hasBulletLists: false,
    hasMarkdownLinks: false,
    hasAiGuidance: false,
    hasAiReadableReferences: false,
    sectionQuality: 0,
    contentDepth: 0,
  }
  const networkRequestUrls = [...new Set(pageNetworkSignals.flatMap((signal) => signal.requestUrls))]
  const initialProbeHosts = extractHostsFromProbeResults([
    ...llmsCandidateResults,
    ...markdownDocResults,
    ...agenticCandidateResults,
    ...discoveryCandidateResults,
    graphqlEndpoint,
    apiEndpoint,
  ])
  const expandedRelatedHosts = [
    ...new Set([
      ...relatedHosts,
      ...extractRelatedHosts(productPages.join("\n"), origin),
      ...extractHostsFromUrls(networkRequestUrls),
      ...initialProbeHosts,
    ]),
  ]
  const expandedProbeBases = getProbeBaseVariants(resolvedBaseUrl, expandedRelatedHosts)
  const [refinedMcpEndpoint, refinedApiMcpEndpoint, refinedOauthDiscoveryEndpoint, refinedOpenIdDiscoveryEndpoint] =
    await Promise.all([
      probePathAcrossBases(expandedProbeBases, "/mcp"),
      probePathAcrossBases(expandedProbeBases, "/api/mcp"),
      probePathAcrossBases(expandedProbeBases, "/.well-known/oauth-authorization-server"),
      probePathAcrossBases(expandedProbeBases, "/.well-known/openid-configuration"),
    ])
  const apiEndpointUrls = networkRequestUrls.filter((url) => /\/api\/|graphql/i.test(url))
  const readCapabilities = [...new Set(pageNetworkSignals.flatMap((signal) => signal.readCapabilities))]
  const writeCapabilities = [...new Set(pageNetworkSignals.flatMap((signal) => signal.writeCapabilities))]
  const effectiveAgenticCandidateResults = [...agenticCandidateResults]
  effectiveAgenticCandidateResults[0] = refinedMcpEndpoint ?? effectiveAgenticCandidateResults[0]
  effectiveAgenticCandidateResults[1] = refinedApiMcpEndpoint ?? effectiveAgenticCandidateResults[1]
  effectiveAgenticCandidateResults[2] = refinedOauthDiscoveryEndpoint ?? effectiveAgenticCandidateResults[2]
  effectiveAgenticCandidateResults[3] = refinedOpenIdDiscoveryEndpoint ?? effectiveAgenticCandidateResults[3]
  const agenticBodies = effectiveAgenticCandidateResults
    .map((endpoint) => endpoint?.body ?? "")
    .filter(Boolean)
  const combinedAgenticText = `${homepage}\n${productPages.join("\n")}\n${agenticBodies.join("\n")}`.toLowerCase()
  const dedicatedMcpEndpoints = effectiveAgenticCandidateResults.slice(0, 2)
  const oauthDiscoveryEndpoint = effectiveAgenticCandidateResults[2]
  const openIdDiscoveryEndpoint = effectiveAgenticCandidateResults[3]
  const schemaCoverage = getCoverage(productSignals, "schema")
  const priceCoverage = getCoverage(productSignals, "price")
  const stableIdentifierCoverage = getCoverage(productSignals, "stableIdentifiers")
  const cartApiCoverage = getCoverage(productSignals, "cartApi")
  const checkoutFlowCoverage = getCoverage(productSignals, "checkoutFlow")
  const realtimeCommerceCoverage = getCoverage(productSignals, "realtimeCommerce")
  const oauthDiscoveryDetected =
    hasOAuthDiscoveryMetadata(oauthDiscoveryEndpoint) ||
    hasOAuthDiscoveryMetadata(openIdDiscoveryEndpoint)
  const hasGraphQL =
    pageNetworkSignals.some((signal) => signal.hasGraphQL) ||
    isProbablyStructuredEndpoint(graphqlEndpoint)
  const hasCheckoutApi = pageNetworkSignals.some((signal) => signal.hasCheckout)
  const toolRegistryDetected = agenticBodies.some((body) => {
    const normalizedBody = body.toLowerCase()
    return (
      normalizedBody.includes("\"tools\"") &&
      (
        normalizedBody.includes("inputschema") ||
        normalizedBody.includes("\"inputschema\"") ||
        normalizedBody.includes("annotations") ||
        normalizedBody.includes("\"annotations\"")
      )
    )
  })
  const structuredActionSchemasDetected = agenticBodies.some((body) => {
    const normalizedBody = body.toLowerCase()
    return (
      normalizedBody.includes("inputschema") ||
      normalizedBody.includes("\"inputschema\"") ||
      normalizedBody.includes("parameters") ||
      normalizedBody.includes("\"parameters\"") ||
      normalizedBody.includes("annotations")
    )
  })
  const explicitMcpProtocolDetected = agenticBodies.some((body) => {
    const normalizedBody = body.toLowerCase()
    const hasAnthropicMcpShape =
      normalizedBody.includes("anthropic") &&
      (
        normalizedBody.includes("\"tools\"") ||
        normalizedBody.includes("inputschema") ||
        normalizedBody.includes("\"inputschema\"") ||
        normalizedBody.includes("servercapabilities")
      )
    return (
      normalizedBody.includes("model context protocol") ||
      normalizedBody.includes("\"jsonrpc\"") ||
      normalizedBody.includes("json-rpc") ||
      normalizedBody.includes("servercapabilities") ||
      hasAnthropicMcpShape
    )
  })
  const mcpEndpointDetected =
    dedicatedMcpEndpoints.some((endpoint) => isValidMcpEndpoint(endpoint)) ||
    explicitMcpProtocolDetected ||
    (oauthDiscoveryDetected && toolRegistryDetected && structuredActionSchemasDetected)
  const authenticatedApiDetected =
    effectiveAgenticCandidateResults.some((endpoint) => requiresAuthentication(endpoint)) ||
    requiresAuthentication(graphqlEndpoint) ||
    requiresAuthentication(apiEndpoint)
  const publicApiDetected =
    hasGraphQL ||
    isProbablyStructuredEndpoint(apiEndpoint) ||
    apiEndpointUrls.length > 0 ||
    /\/graphql|storefrontapi|api\/(products|catalog|cart|checkout)|rest api|openapi|swagger/i.test(normalizedHomepage) ||
    productPages.some((page) =>
      /\/graphql|storefrontapi|api\/(products|catalog|cart|checkout)|rest api|openapi|swagger/i.test(page.toLowerCase())
    )
  const scrapeableDataDetected =
    links.length > 0 &&
    (schemaCoverage > 0 || priceCoverage > 0 || stableIdentifierCoverage > 0)
  const structuredDataConsistency =
    productSignals.length > 0 && schemaCoverage >= 0.5 ? schemaCoverage : 0
  const actionabilityDetected =
    writeCapabilities.length > 0 ||
    cartApiCoverage > 0 ||
    checkoutFlowCoverage > 0 ||
    /order workflow|mutation|transaction|createcheckout|cartcreate|cartlinesadd|state transition|checkoutsession/i.test(combinedAgenticText)
  const sessionContinuityDetected =
    /session|selected site|site_token|context|localstorage|sessionstorage|bearer|cookie|store selection|tenant/i.test(combinedAgenticText)
  const hasDefaultContext =
    mcpEndpointDetected || sessionContinuityDetected
  const clearToolDiscovery =
    mcpEndpointDetected ||
    oauthDiscoveryDetected ||
    hasOAuthDiscoveryMetadata(openIdDiscoveryEndpoint) ||
    discoveryCandidateResults.some((endpoint) => Boolean(endpoint?.ok)) ||
    /openapi|swagger|graphql|tools|capabilities|inputschema|annotations|manifest/i.test(combinedAgenticText)
  const stepsToFirstSuccess = mcpEndpointDetected
    ? 1
    : oauthDiscoveryDetected
      ? 2
      : authenticatedApiDetected
        ? 3
        : publicApiDetected
          ? 2
          : 3
  const detectedReadCoverage = clampCoverage(readCapabilities.length / 3)
  const detectedWriteCoverage = clampCoverage(
    (writeCapabilities.includes("cart") ? 0.4 : 0) +
      (writeCapabilities.includes("checkout") ? 0.3 : 0) +
      (writeCapabilities.includes("actions") ? 0.3 : 0)
  )
  let readCoverage =
    (publicApiDetected || authenticatedApiDetected) && detectedReadCoverage > 0
      ? detectedReadCoverage
      : 0
  let writeCoverage =
    (publicApiDetected || authenticatedApiDetected) && detectedWriteCoverage > 0
      ? detectedWriteCoverage
      : 0
  let toolCoverage = Math.min(1, new Set([...readCapabilities, ...writeCapabilities]).size / 6)
  if (!publicApiDetected && !authenticatedApiDetected) {
    toolCoverage = 0
  }
  const toolRegistryScore = clampCoverage(
    Math.max(
      ...agenticBodies.map((body) => getProtocolEvidenceScore(body)),
      getSemanticClarity(combinedAgenticText)
    )
  )
  toolCoverage = clampCoverage(Math.max(toolCoverage, toolRegistryScore))
  const probeResults = [...effectiveAgenticCandidateResults, ...discoveryCandidateResults, graphqlEndpoint, apiEndpoint].filter(
    (endpoint): endpoint is NonNullable<typeof endpoint> => Boolean(endpoint)
  )
  const successfulProbeCount = probeResults.filter((endpoint) => endpoint.ok).length
  const successRate = probeResults.length > 0 ? successfulProbeCount / probeResults.length : 0
  if (!successRate || successRate < 0.3) {
    readCoverage = 0
    writeCoverage = 0
  }
  const surfaceAuthenticityScore = clampCoverage(
    Math.max(
      ...agenticBodies.map((body) => getProtocolEvidenceScore(body)),
      0
    ) * 0.55 +
      (authenticatedApiDetected ? 1 : 0) * 0.15 +
      (sessionContinuityDetected ? 1 : 0) * 0.15 +
      (actionabilityDetected ? 1 : 0) * 0.15
  )
  const schemaConsistency = clampCoverage(
    (cartApiCoverage + checkoutFlowCoverage + realtimeCommerceCoverage) / 3
  )
  const averageLatency =
    probeResults.length > 0
      ? probeResults.reduce((total, endpoint) => total + endpoint.latencyMs, 0) / probeResults.length
      : null
  const latencyScore =
    averageLatency === null ? 0 : averageLatency <= 500 ? 1 : averageLatency <= 1200 ? 0.7 : averageLatency <= 2500 ? 0.4 : 0.2
  const semanticClarityScore = clampCoverage(
    Math.max(
      getSemanticClarity(combinedAgenticText),
      toolRegistryScore
    )
  )

  return {
    sitemapFound: Boolean(sitemapText) || /sitemap:/i.test(robotsText ?? ""),
    robotsFound: Boolean(robotsText),
    productPagesCount: links.length,
    llmsTxtFound: primaryLlmsAssessment.found,
    llmsFullFound: llmsFullAssessment.found,
    llmsTxtParsable: primaryGuidanceAssessment.parsable,
    llmsTxtStructured: primaryGuidanceAssessment.structured,
    llmsTxtHasCanonicalLinks: primaryGuidanceAssessment.hasCanonicalLinks,
    llmsTxtHasMarkdownLinks: primaryGuidanceAssessment.hasMarkdownLinks,
    llmsTxtHasAiGuidance: primaryGuidanceAssessment.hasAiGuidance,
    llmsTxtSectionQuality: primaryGuidanceAssessment.sectionQuality,
    llmsTxtContentDepth: primaryGuidanceAssessment.contentDepth,
    markdownDocsFound,
    agentDocsFound,
    markdownStructured,
    markdownHasWorkflowGuidance,
    markdownHasApiReferences,
    markdownHasAgentInstructions,
    markdownSemanticQuality,
    schemaCoverage,
    priceCoverage,
    attributeCoverage: getCoverage(productSignals, "attributes"),
    descriptionCoverage: getCoverage(productSignals, "description"),
    cartCoverage: getCoverage(productSignals, "cart"),
    detectedPlatform: detectPlatform(homepage),
    availabilityCoverage: getCoverage(productSignals, "availability"),
    mcpEndpointDetected,
    publicApiDetected,
    scrapeableDataDetected,
    stableIdentifierCoverage,
    cartApiCoverage,
    checkoutFlowCoverage,
    realtimeCommerceCoverage,
    structuredDataConsistency,
    hasGraphQL,
    hasCheckoutApi,
    apiEndpointUrls,
    networkRequestUrls,
    oauthDiscoveryDetected,
    authenticatedApiDetected,
    stepsToFirstSuccess,
    hasDefaultContext,
    clearToolDiscovery,
    readCoverage,
    writeCoverage,
    toolCoverage,
    successRate,
    schemaConsistency,
    latencyScore,
    surfaceAuthenticityScore,
    actionabilityDetected,
    sessionContinuityDetected,
    semanticClarityScore,
  }
}

function scoreLlms(signals: AuditSignals) {
  const score = clamp(
    (signals.llmsTxtFound ? 20 : 0) +
      (signals.llmsFullFound ? 8 : 0) +
      (signals.llmsTxtParsable ? 8 : 0) +
      (signals.llmsTxtStructured ? 18 : 0) +
      (signals.llmsTxtHasCanonicalLinks ? 14 : 0) +
      (signals.llmsTxtHasMarkdownLinks ? 10 : 0) +
      (signals.llmsTxtHasAiGuidance ? 16 : 0) +
      signals.llmsTxtSectionQuality * 10 +
      signals.llmsTxtContentDepth * 6
  )

  const findings = [
    signals.llmsTxtFound
      ? "A valid llms.txt-style document was found at an expected discovery path."
      : signals.llmsTxtStructured || signals.llmsTxtHasAiGuidance
        ? "No primary llms.txt document was confirmed, but other markdown guidance docs appear to provide some AI-facing documentation."
        : "No primary llms.txt document was confirmed at /llms.txt or /.well-known/llms.txt.",
    signals.llmsTxtParsable
      ? `The document passes basic validation for status, content type, and content depth (${Math.round(signals.llmsTxtContentDepth * 100)}% depth).`
      : "The discovered file does not yet pass basic llms.txt validation for machine use.",
    signals.llmsTxtStructured
      ? `The document uses recognizable markdown structure with grouped sections (quality ${Math.round(signals.llmsTxtSectionQuality * 100)}%).`
      : "The document is missing strong markdown structure, so agents may struggle to extract dependable guidance.",
    signals.llmsTxtHasCanonicalLinks
      ? "Canonical or primary resource links are present, which helps agents find the preferred destinations."
      : "Canonical resource links are missing, so the file gives weaker guidance about preferred destinations.",
    signals.llmsTxtHasMarkdownLinks
      ? "Structured markdown links are present, which gives agents explicit destinations to follow."
      : "Structured markdown links are limited or missing, so the file provides weak navigational guidance for agents.",
    signals.llmsTxtHasAiGuidance
      ? "The file includes explicit AI or agent guidance rather than only generic site links."
      : "The file does not clearly explain how AI systems should use, access, or prioritize site resources.",
    signals.llmsFullFound
      ? "An extended llms-full.txt resource is also available for deeper agent context."
      : "No llms-full.txt companion file was confirmed.",
  ]

  return {
    name: "LLMs.txt" as const,
    score,
    status: classify(score),
    findings,
    impact:
      "This category measures whether the brand has intentionally published structured AI-ingestion guidance and canonical AI-readable resources, not whether generic SEO crawl signals happen to exist.",
  }
}

function scoreAiDocumentation(signals: AuditSignals) {
  const hasDetectedMarkdownDocs = signals.markdownDocsFound || signals.agentDocsFound
  if (!hasDetectedMarkdownDocs) {
    return {
      name: "AI Documentation" as const,
      score: 0,
      status: classify(0),
      findings: [
        "No supplemental markdown documentation was confirmed at /agents.md, /readme.md, or /docs.md.",
        "Advanced markdown quality analysis is skipped until a valid markdown document is discovered.",
      ],
      impact:
        "AI documentation only scores when the brand intentionally exposes machine-readable markdown docs for agents, workflows, or APIs.",
    }
  }

  const score = clamp(
    (signals.markdownDocsFound ? 24 : 0) +
      (signals.agentDocsFound ? 14 : 0) +
      (signals.markdownStructured ? 18 : 0) +
      (signals.markdownHasWorkflowGuidance ? 14 : 0) +
      (signals.markdownHasApiReferences ? 12 : 0) +
      (signals.markdownHasAgentInstructions ? 10 : 0) +
      signals.markdownSemanticQuality * 8
  )

  const findings = [
    signals.markdownDocsFound
      ? "Supplemental markdown documentation was found at one or more expected documentation endpoints."
      : "No supplemental markdown documentation was confirmed at /agents.md, /readme.md, or /docs.md.",
    signals.agentDocsFound
      ? "An agent-oriented markdown document appears to be available."
      : "No dedicated /agents.md-style document was confirmed.",
    signals.markdownStructured
      ? `The markdown documentation is reasonably structured for machine reading (quality ${Math.round(signals.markdownSemanticQuality * 100)}%).`
      : "The markdown documentation lacks clear structure, so it is less useful for agents and automated ingestion.",
    signals.markdownHasWorkflowGuidance
      ? "The documentation includes workflow or usage guidance relevant to agents."
      : "Workflow guidance for agents is limited or missing from the markdown docs.",
    signals.markdownHasApiReferences
      ? "The markdown documentation references APIs, docs, or other machine-relevant resources."
      : "API or resource references are limited in the markdown documentation.",
    signals.markdownHasAgentInstructions
      ? "The documentation contains explicit agent or AI-oriented instructions."
      : "Explicit agent instructions were not clearly detected in the markdown documentation.",
  ]

  return {
    name: "AI Documentation" as const,
    score,
    status: classify(score),
    findings,
    impact:
      "AI documentation measures whether the brand publishes supplemental markdown docs that help agents understand workflows, resources, and usage expectations beyond storefront content alone.",
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
    kartmaX: 78,
    magento: 34,
    woocommerce: 48,
    custom: 24,
  }

  const score = clamp(
    platformScores[signals.detectedPlatform] + signals.schemaCoverage * 8 + signals.cartCoverage * 6
  )

  const findings = [
    `Detected platform: ${signals.detectedPlatform}.`,
    signals.detectedPlatform === "kartmaX"
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
  console.log("MCP_SIGNALS:", {
    mcpEndpointDetected: signals.mcpEndpointDetected,
    oauthDiscoveryDetected: signals.oauthDiscoveryDetected,
    authenticatedApiDetected: signals.authenticatedApiDetected,
    publicApiDetected: signals.publicApiDetected,
    actionabilityDetected: signals.actionabilityDetected,
    sessionContinuityDetected: signals.sessionContinuityDetected,
    surfaceAuthenticityScore: signals.surfaceAuthenticityScore,
    semanticClarityScore: signals.semanticClarityScore,
    successRate: signals.successRate,
    hasDefaultContext: signals.hasDefaultContext,
    clearToolDiscovery: signals.clearToolDiscovery,
    readCoverage: signals.readCoverage,
    writeCoverage: signals.writeCoverage,
    toolCoverage: signals.toolCoverage,
    latencyScore: signals.latencyScore,
  })

  const discoveryScore = clampCoverage(
    (signals.mcpEndpointDetected ? 1 : 0) * 0.55 +
      (signals.oauthDiscoveryDetected ? 1 : 0) * 0.3 +
      (signals.authenticatedApiDetected ? 1 : 0) * 0.15
  )
  const authSessionScore = clampCoverage(
    (signals.authenticatedApiDetected ? 1 : 0) * 0.45 +
      (signals.sessionContinuityDetected ? 1 : 0) * 0.35 +
      (signals.hasDefaultContext ? 1 : 0) * 0.2
  )
  const actionabilityScore = clampCoverage(
    (signals.actionabilityDetected ? 1 : 0) * 0.5 +
      signals.writeCoverage * 0.3 +
      signals.readCoverage * 0.2
  )
  const toolScore = clampCoverage(
    signals.toolCoverage * 0.65 +
      signals.semanticClarityScore * 0.2 +
      (signals.clearToolDiscovery ? 1 : 0) * 0.15
  )
  const publicApiContribution = Math.min(0.15, signals.publicApiDetected ? 0.15 : 0)
  const reliabilityScore = clampCoverage(
    signals.successRate * 0.45 +
      signals.surfaceAuthenticityScore * 0.35 +
      signals.latencyScore * 0.2
  )
  const confidence = clampCoverage(
    signals.successRate * 0.35 +
      signals.surfaceAuthenticityScore * 0.25 +
      discoveryScore * 0.2 +
      authSessionScore * 0.2
  )
  const weightedScore =
    toolScore * 35 +
    actionabilityScore * 25 +
    authSessionScore * 20 +
    discoveryScore * 15 +
    publicApiContribution * 100 * 0.05
  const finalScore = clamp(weightedScore * confidence)

  console.log("MCP_ACCESS_DECISION:", {
    reason:
      signals.mcpEndpointDetected ? "Structured MCP surface" :
      signals.oauthDiscoveryDetected ? "OAuth metadata and auth discovery" :
      signals.authenticatedApiDetected ? "Authenticated commerce surface" :
      signals.publicApiDetected ? "Public API only" :
      "Weak discovery",
    discoveryScore,
    authSessionScore,
  })

  console.log("MCP_USABILITY_BREAKDOWN:", {
    stepsToFirstSuccess: signals.stepsToFirstSuccess,
    hasDefaultContext: signals.hasDefaultContext,
    clearToolDiscovery: signals.clearToolDiscovery,
    sessionContinuityDetected: signals.sessionContinuityDetected,
    authSessionScore,
  })

  console.log("MCP_CAPABILITY_BREAKDOWN:", {
    readCoverage: signals.readCoverage,
    writeCoverage: signals.writeCoverage,
    toolCoverage: signals.toolCoverage,
    semanticClarityScore: signals.semanticClarityScore,
    actionabilityDetected: signals.actionabilityDetected,
    actionabilityScore,
    toolScore,
  })

  console.log("MCP_RELIABILITY_BREAKDOWN:", {
    successRate: signals.successRate,
    surfaceAuthenticityScore: signals.surfaceAuthenticityScore,
    latencyScore: signals.latencyScore,
    reliabilityScore,
    confidence,
  })

  console.log("MCP_FINAL_DEBUG:", {
    discoveryScore,
    authSessionScore,
    actionabilityScore,
    toolScore,
    publicApiContribution,
    reliabilityScore,
    confidence,
    weightedScore,
    finalScore,
  })

  const findings = [
    signals.mcpEndpointDetected
      ? "A structured agent protocol surface is exposed, which gives autonomous systems a clearer path to discover tools and workflows."
      : signals.oauthDiscoveryDetected || signals.authenticatedApiDetected
        ? "Authentication and protocol discovery signals exist, but operability still depends on how clearly tools and workflows are exposed."
        : signals.publicApiDetected
          ? "Some commerce APIs are exposed, but that alone does not yet indicate a strong autonomous agent operating surface."
          : "No strong agent-facing protocol or workflow surface is confirmed from the sampled commerce ecosystem.",
    toolScore >= 0.7
      ? "Tool discovery and semantic clarity look strong enough for agents to identify what actions they can take."
      : "Tool discovery still looks weak or ambiguous, so autonomous agents may struggle to understand the available workflows.",
    actionabilityScore >= 0.7
      ? "Transactional actions such as cart, checkout, or authenticated state transitions appear sufficiently exposed for agent execution."
      : "Execution surfaces for cart, checkout, or stateful workflows are still too limited for reliable autonomous commerce actions.",
    authSessionScore >= 0.7
      ? "Authentication and session continuity signals suggest agents can maintain context across multi-step workflows."
      : "Context continuity still looks fragile, which makes multi-step autonomous commerce flows harder to sustain safely.",
  ]

  return {
    name: "Agentic Commerce Readiness" as const,
    score: finalScore,
    status: classify(finalScore),
    findings,
    impact:
      "Strong agentic readiness means autonomous systems can discover capabilities, authenticate, preserve context, and execute commerce workflows reliably rather than merely read storefront data.",
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

  if (!signals.llmsTxtFound || !signals.llmsTxtStructured || !signals.llmsTxtHasAiGuidance) {
    priorities.push("Publish a real llms.txt guide with structured markdown sections, canonical resource links, and explicit instructions for AI agents and crawlers.")
  }

  if (signals.llmsTxtFound && !signals.llmsFullFound) {
    priorities.push("Consider adding llms-full.txt with deeper canonical resources, grouped references, and extended AI-ingestion guidance.")
  }

  if (!signals.markdownDocsFound || !signals.markdownHasAgentInstructions) {
    priorities.push("Publish machine-readable markdown docs like /agents.md or /docs.md with agent instructions, workflow guidance, and API references.")
  }

  if (!signals.sitemapFound || !signals.robotsFound) {
    priorities.push("Make it easier for AI crawlers to discover more of your catalog with stronger sitemap, robots, and internal linking coverage.")
  }

  if (signals.schemaCoverage < 0.7 || signals.priceCoverage < 0.7 || signals.availabilityCoverage < 0.7) {
    priorities.push("Make price, availability, and core product data consistently machine-readable so AI assistants can trust what they surface.")
  }

  if (signals.descriptionCoverage < 0.7 || signals.attributeCoverage < 0.7) {
    priorities.push("Strengthen product descriptions and attributes so AI can answer buyer questions without filling in the gaps.")
  }

  if (
    !signals.mcpEndpointDetected &&
    !signals.oauthDiscoveryDetected &&
    !signals.authenticatedApiDetected &&
    !signals.publicApiDetected
  ) {
    priorities.push("Expose a clearer agent connectivity layer with discovery, authentication, and dependable action surfaces instead of relying on brittle scraping.")
  }

  if (signals.stepsToFirstSuccess > 2 || !signals.hasDefaultContext || !signals.clearToolDiscovery) {
    priorities.push("Reduce agent setup friction by shortening time-to-first-success, improving default context, and making tool discovery more explicit.")
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
    llmsTxtFound: payload.signals?.llmsTxtFound ?? derivedSignals.llmsTxtFound,
    llmsFullFound: payload.signals?.llmsFullFound ?? derivedSignals.llmsFullFound,
    llmsTxtParsable: payload.signals?.llmsTxtParsable ?? derivedSignals.llmsTxtParsable,
    llmsTxtStructured: payload.signals?.llmsTxtStructured ?? derivedSignals.llmsTxtStructured,
    llmsTxtHasCanonicalLinks:
      payload.signals?.llmsTxtHasCanonicalLinks ?? derivedSignals.llmsTxtHasCanonicalLinks,
    llmsTxtHasMarkdownLinks:
      payload.signals?.llmsTxtHasMarkdownLinks ?? derivedSignals.llmsTxtHasMarkdownLinks,
    llmsTxtHasAiGuidance:
      payload.signals?.llmsTxtHasAiGuidance ?? derivedSignals.llmsTxtHasAiGuidance,
    llmsTxtSectionQuality: clampCoverage(
      payload.signals?.llmsTxtSectionQuality ?? derivedSignals.llmsTxtSectionQuality
    ),
    llmsTxtContentDepth: clampCoverage(
      payload.signals?.llmsTxtContentDepth ?? derivedSignals.llmsTxtContentDepth
    ),
    markdownDocsFound: payload.signals?.markdownDocsFound ?? derivedSignals.markdownDocsFound,
    agentDocsFound: payload.signals?.agentDocsFound ?? derivedSignals.agentDocsFound,
    markdownStructured: payload.signals?.markdownStructured ?? derivedSignals.markdownStructured,
    markdownHasWorkflowGuidance:
      payload.signals?.markdownHasWorkflowGuidance ?? derivedSignals.markdownHasWorkflowGuidance,
    markdownHasApiReferences:
      payload.signals?.markdownHasApiReferences ?? derivedSignals.markdownHasApiReferences,
    markdownHasAgentInstructions:
      payload.signals?.markdownHasAgentInstructions ?? derivedSignals.markdownHasAgentInstructions,
    markdownSemanticQuality: clampCoverage(
      payload.signals?.markdownSemanticQuality ?? derivedSignals.markdownSemanticQuality
    ),
    schemaCoverage: clampCoverage(payload.signals?.schemaCoverage ?? derivedSignals.schemaCoverage),
    priceCoverage: clampCoverage(payload.signals?.priceCoverage ?? derivedSignals.priceCoverage),
    attributeCoverage: clampCoverage(payload.signals?.attributeCoverage ?? derivedSignals.attributeCoverage),
    descriptionCoverage: clampCoverage(payload.signals?.descriptionCoverage ?? derivedSignals.descriptionCoverage),
    cartCoverage: clampCoverage(payload.signals?.cartCoverage ?? derivedSignals.cartCoverage),
    detectedPlatform: payload.signals?.detectedPlatform ?? derivedSignals.detectedPlatform,
    availabilityCoverage: clampCoverage(payload.signals?.availabilityCoverage ?? derivedSignals.availabilityCoverage),
    mcpEndpointDetected: payload.signals?.mcpEndpointDetected ?? derivedSignals.mcpEndpointDetected,
    publicApiDetected: payload.signals?.publicApiDetected ?? derivedSignals.publicApiDetected,
    scrapeableDataDetected: payload.signals?.scrapeableDataDetected ?? derivedSignals.scrapeableDataDetected,
    stableIdentifierCoverage: clampCoverage(
      payload.signals?.stableIdentifierCoverage ?? derivedSignals.stableIdentifierCoverage
    ),
    cartApiCoverage: clampCoverage(payload.signals?.cartApiCoverage ?? derivedSignals.cartApiCoverage),
    checkoutFlowCoverage: clampCoverage(
      payload.signals?.checkoutFlowCoverage ?? derivedSignals.checkoutFlowCoverage
    ),
    realtimeCommerceCoverage: clampCoverage(
      payload.signals?.realtimeCommerceCoverage ?? derivedSignals.realtimeCommerceCoverage
    ),
    structuredDataConsistency: clampCoverage(
      payload.signals?.structuredDataConsistency ?? derivedSignals.structuredDataConsistency
    ),
    hasGraphQL: payload.signals?.hasGraphQL ?? derivedSignals.hasGraphQL,
    hasCheckoutApi: payload.signals?.hasCheckoutApi ?? derivedSignals.hasCheckoutApi,
    apiEndpointUrls: payload.signals?.apiEndpointUrls ?? derivedSignals.apiEndpointUrls,
    networkRequestUrls: payload.signals?.networkRequestUrls ?? derivedSignals.networkRequestUrls,
    oauthDiscoveryDetected: payload.signals?.oauthDiscoveryDetected ?? derivedSignals.oauthDiscoveryDetected,
    authenticatedApiDetected: payload.signals?.authenticatedApiDetected ?? derivedSignals.authenticatedApiDetected,
    stepsToFirstSuccess: Math.max(
      1,
      payload.signals?.stepsToFirstSuccess ?? derivedSignals.stepsToFirstSuccess
    ),
    hasDefaultContext: payload.signals?.hasDefaultContext ?? derivedSignals.hasDefaultContext,
    clearToolDiscovery: payload.signals?.clearToolDiscovery ?? derivedSignals.clearToolDiscovery,
    readCoverage: clampCoverage(payload.signals?.readCoverage ?? derivedSignals.readCoverage),
    writeCoverage: clampCoverage(payload.signals?.writeCoverage ?? derivedSignals.writeCoverage),
    toolCoverage: clampCoverage(payload.signals?.toolCoverage ?? derivedSignals.toolCoverage),
    successRate: clampCoverage(payload.signals?.successRate ?? derivedSignals.successRate),
    schemaConsistency: clampCoverage(payload.signals?.schemaConsistency ?? derivedSignals.schemaConsistency),
    latencyScore: clampCoverage(payload.signals?.latencyScore ?? derivedSignals.latencyScore),
    surfaceAuthenticityScore: clampCoverage(
      payload.signals?.surfaceAuthenticityScore ?? derivedSignals.surfaceAuthenticityScore
    ),
    actionabilityDetected: payload.signals?.actionabilityDetected ?? derivedSignals.actionabilityDetected,
    sessionContinuityDetected:
      payload.signals?.sessionContinuityDetected ?? derivedSignals.sessionContinuityDetected,
    semanticClarityScore: clampCoverage(
      payload.signals?.semanticClarityScore ?? derivedSignals.semanticClarityScore
    ),
  }

  const categories = [
    scoreLlms(signals),
    scoreAiDocumentation(signals),
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
    signals,
  }
}
