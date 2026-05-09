export type AuditStatus = "weak" | "moderate" | "strong"

export interface AuditCategory {
  name:
  | "LLMs.txt"
  | "Agent Guidance Layer"
  | "AI Content Quality"
  | "AI Integrations"
  | "MCP Compatibility"
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
  productSchemaCompleteness: number
  offerSchemaCompleteness: number
  merchantTrustScore: number
  variantSemanticScore: number
  knowledgeGraphScore: number
  semanticReliabilityScore: number
  commerceActionabilityScore: number
  searchDiscoveryScore: number
  crossPageConsistencyScore: number
  aiShoppingReadinessScore: number
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

interface SemanticPageSignals extends ProductSignal {
  productSchemaCompleteness: number
  offerSchemaCompleteness: number
  merchantTrustScore: number
  variantSemanticScore: number
  knowledgeGraphScore: number
  semanticReliabilityScore: number
  commerceActionabilityScore: number
  searchDiscoveryScore: number
  aiShoppingReadinessScore: number
  canonicalUrlPresent: boolean
  malformedJsonLdCount: number
  duplicateSchemaCount: number
  disconnectedEntityCount: number
  productSignature: string
  variantSignature: string
  taxonomySignature: string
  currencySignature: string
  merchantSignature: string
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

type JsonLdValue = string | number | boolean | null | JsonLdRecord | JsonLdValue[]

interface JsonLdRecord {
  [key: string]: JsonLdValue
}

interface JsonLdEntity {
  key: string
  types: string[]
  raw: JsonLdRecord
}

interface JsonLdExtractionResult {
  entities: JsonLdEntity[]
  malformedCount: number
}

interface EntityGraphResult {
  connectivityScore: number
  disconnectedNodes: number
  relationCoverage: number
  duplicateEntityCount: number
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function clampCoverage(value: number) {
  return Math.min(1, Math.max(0, value))
}

function averageCoverage(values: number[]) {
  if (values.length === 0) return 0
  return clampCoverage(values.reduce((total, value) => total + value, 0) / values.length)
}

function isRecord(value: unknown): value is JsonLdRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value
  if (value === null || value === undefined) return []
  return [value]
}

function getStringValues(value: JsonLdValue | undefined): string[] {
  if (typeof value === "string") return [value.trim()].filter(Boolean)
  if (Array.isArray(value)) {
    return value.flatMap((entry) => getStringValues(entry))
  }
  if (isRecord(value)) {
    return [
      ...getStringValues(value["@id"]),
      ...getStringValues(value.name),
      ...getStringValues(value.url),
      ...getStringValues(value.identifier),
    ]
  }
  return []
}

function getFirstString(value: JsonLdValue | undefined) {
  return getStringValues(value)[0] ?? ""
}

function hasMeaningfulValue(value: JsonLdValue | undefined) {
  if (typeof value === "string") return value.trim().length > 0
  if (typeof value === "number" || typeof value === "boolean") return true
  if (Array.isArray(value)) return value.some((entry) => hasMeaningfulValue(entry))
  if (isRecord(value)) return Object.keys(value).length > 0
  return false
}

function getEntityTypes(value: JsonLdValue | undefined) {
  return [...new Set(getStringValues(value).map((type) => type.toLowerCase()))]
}

function entityHasType(entity: JsonLdEntity, type: string) {
  return entity.types.includes(type.toLowerCase())
}

function getEntitiesByType(entities: JsonLdEntity[], type: string) {
  const normalizedType = type.toLowerCase()
  return entities.filter((entity) => entity.types.includes(normalizedType))
}

function normalizeSemanticToken(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value)
    url.hash = ""
    url.search = ""
    return url.toString().replace(/\/+$/, "")
  } catch {
    return value.trim().replace(/\/+$/, "")
  }
}

function parseJsonLdPayload(payload: string): JsonLdValue | null {
  const normalized = payload
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/<!--|-->/g, "")

  if (!normalized) return null

  try {
    return JSON.parse(normalized) as JsonLdValue
  } catch {
    return null
  }
}

function collectJsonLdEntities(
  value: JsonLdValue,
  entities: JsonLdEntity[],
  seen: Set<JsonLdRecord>,
  keyPrefix: string
) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectJsonLdEntities(entry, entities, seen, `${keyPrefix}:${index}`))
    return
  }

  if (!isRecord(value) || seen.has(value)) return
  seen.add(value)

  const types = getEntityTypes(value["@type"])
  if (types.length > 0) {
    entities.push({
      key: getFirstString(value["@id"]) || keyPrefix,
      types,
      raw: value,
    })
  }

  if (Array.isArray(value["@graph"])) {
    collectJsonLdEntities(value["@graph"], entities, seen, `${keyPrefix}:graph`)
  }

  for (const [field, nestedValue] of Object.entries(value)) {
    if (field === "@graph") continue
    if (Array.isArray(nestedValue) || isRecord(nestedValue)) {
      collectJsonLdEntities(nestedValue, entities, seen, `${keyPrefix}:${field}`)
    }
  }
}

function extractJsonLd(html: string): JsonLdExtractionResult {
  const entities: JsonLdEntity[] = []
  let malformedCount = 0
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]

  for (let index = 0; index < scripts.length; index += 1) {
    const payload = scripts[index]?.[1] ?? ""
    const parsed = parseJsonLdPayload(payload)

    if (!parsed) {
      malformedCount += 1
      continue
    }

    collectJsonLdEntities(parsed, entities, new Set<JsonLdRecord>(), `jsonld:${index}`)
  }

  return { entities, malformedCount }
}

function extractNumericValues(value: JsonLdValue | undefined): number[] {
  if (typeof value === "number") return [value]
  if (typeof value === "string") {
    const normalized = Number(value.replace(/[^0-9.-]/g, ""))
    return Number.isFinite(normalized) ? [normalized] : []
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractNumericValues(entry))
  }
  return []
}

function extractOfferRecords(value: JsonLdValue | undefined): JsonLdRecord[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractOfferRecords(entry))
  }
  if (!isRecord(value)) return []

  const types = getEntityTypes(value["@type"])
  if (types.includes("offer") || types.includes("aggregateoffer")) {
    return [value]
  }

  return []
}

function extractCanonicalUrl(html: string, pageUrl: string) {
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
  if (canonicalMatch?.[1]) {
    return normalizeUrl(toAbsoluteUrl(pageUrl, canonicalMatch[1]) ?? canonicalMatch[1])
  }

  return ""
}

function hasSemanticField(record: JsonLdRecord, fields: string[]) {
  return fields.some((field) => hasMeaningfulValue(record[field]))
}

function scoreFieldCompleteness(
  record: JsonLdRecord,
  weightedFields: Array<{ fields: string[]; weight: number }>
) {
  const totalWeight = weightedFields.reduce((total, field) => total + field.weight, 0)
  if (!totalWeight) return 0

  const earnedWeight = weightedFields.reduce(
    (total, field) => total + (hasSemanticField(record, field.fields) ? field.weight : 0),
    0
  )

  return clampCoverage(earnedWeight / totalWeight)
}

function buildEntityGraph(entities: JsonLdEntity[]): EntityGraphResult {
  if (entities.length === 0) {
    return {
      connectivityScore: 0,
      disconnectedNodes: 0,
      relationCoverage: 0,
      duplicateEntityCount: 0,
    }
  }

  const idCounts = new Map<string, number>()
  const edges = new Map<string, Set<string>>()
  const entityKeys = new Set(entities.map((entity) => entity.key))
  const relationFields = [
    "brand",
    "category",
    "breadcrumb",
    "seller",
    "merchant",
    "manufacturer",
    "review",
    "aggregateRating",
    "offers",
    "isVariantOf",
    "hasVariant",
    "itemListElement",
    "mainEntity",
    "publisher",
    "provider",
    "potentialAction",
  ]

  for (const entity of entities) {
    idCounts.set(entity.key, (idCounts.get(entity.key) ?? 0) + 1)
    edges.set(entity.key, edges.get(entity.key) ?? new Set<string>())

    for (const field of relationFields) {
      const values = asArray(entity.raw[field])
      for (const value of values) {
        if (!isRecord(value)) continue

        const targetKey = getFirstString(value["@id"]) || `${entity.key}:${field}:${edges.get(entity.key)?.size ?? 0}`
        edges.get(entity.key)?.add(targetKey)
      }
    }
  }

  let connectedCount = 0
  for (const entity of entities) {
    const outgoingEdges = edges.get(entity.key)
    const incomingEdgeExists = [...edges.values()].some((targets) => targets.has(entity.key))
    if ((outgoingEdges && outgoingEdges.size > 0) || incomingEdgeExists) {
      connectedCount += 1
    }
  }

  const disconnectedNodes = entities.length - connectedCount
  const duplicateEntityCount = [...idCounts.values()].filter((count) => count > 1).length
  const realizedEdges = [...edges.values()].reduce((total, targets) => total + targets.size, 0)
  const possibleEdges = Math.max(entities.length, entityKeys.size)

  return {
    connectivityScore: clampCoverage(connectedCount / entities.length),
    disconnectedNodes,
    relationCoverage: clampCoverage(realizedEdges / possibleEdges),
    duplicateEntityCount,
  }
}

function compareNormalizedSets(signatures: string[]) {
  const nonEmptySignatures = signatures.filter(Boolean)
  if (nonEmptySignatures.length <= 1) return nonEmptySignatures.length === 0 ? 0 : 1

  const tokenSets = nonEmptySignatures.map((signature) => new Set(signature.split("|").filter(Boolean)))
  const union = new Set(tokenSets.flatMap((set) => [...set]))
  const intersection = [...union].filter((token) => tokenSets.every((set) => set.has(token)))

  if (union.size === 0) return 0
  return clampCoverage(intersection.length / union.size)
}

function analyzeSemanticCommercePage(
  page: string,
  pageUrl: string,
  networkSignals: PageNetworkSignals,
  merchantSignals: { merchantTrustScore: number; searchDiscoveryScore: number }
): SemanticPageSignals {
  const normalized = page.toLowerCase()
  const { entities, malformedCount } = extractJsonLd(page)
  const productEntities = getEntitiesByType(entities, "product")
  const offerEntities = [
    ...getEntitiesByType(entities, "offer"),
    ...productEntities.flatMap((entity) =>
      extractOfferRecords(entity.raw.offers).map((offer, index) => ({
        key: `${entity.key}:offer:${index}`,
        types: getEntityTypes(offer["@type"]).length > 0 ? getEntityTypes(offer["@type"]) : ["offer"],
        raw: offer,
      }))
    ),
  ]
  const organizationEntities = getEntitiesByType(entities, "organization")
  const websiteEntities = getEntitiesByType(entities, "website")
  const breadcrumbEntities = getEntitiesByType(entities, "breadcrumblist")
  const itemListEntities = getEntitiesByType(entities, "itemlist")
  const faqEntities = getEntitiesByType(entities, "faqpage")
  const searchActionEntities = getEntitiesByType(entities, "searchaction")
  const actionEntities = entities.filter((entity) =>
    entity.types.some((type) =>
      ["addtocartaction", "buyaction", "searchaction", "entrypoint"].includes(type)
    )
  )
  const graph = buildEntityGraph(entities)
  const canonicalUrl = extractCanonicalUrl(page, pageUrl)

  const productSchemaCompleteness = clampCoverage(
    Math.max(
      ...productEntities.map((entity) => {
        const coreScore = scoreFieldCompleteness(entity.raw, [
          { fields: ["name"], weight: 0.25 },
          { fields: ["image"], weight: 0.15 },
          { fields: ["description"], weight: 0.20 },
          { fields: ["sku"], weight: 0.20 },
          { fields: ["brand"], weight: 0.20 },
        ])

        const advancedBonus =
          scoreFieldCompleteness(entity.raw, [
            { fields: ["aggregateRating"], weight: 0.15 },
            { fields: ["review"], weight: 0.15 },
            { fields: ["gtin", "gtin13", "gtin14", "gtin8"], weight: 0.25 },
            { fields: ["mpn"], weight: 0.15 },
            { fields: ["category"], weight: 0.15 },
            { fields: ["isVariantOf", "hasVariant"], weight: 0.15 },
          ]) * 0.3

        return Math.min(
          1,
          (coreScore * 0.7) + advancedBonus
        )
      }),
      productEntities.length > 0 ? 0.35 : 0
    )
  )

  const offerSchemaCompleteness = clampCoverage(
    Math.max(
      ...offerEntities.map((entity) => {
        const coreScore = scoreFieldCompleteness(entity.raw, [
          { fields: ["price"], weight: 0.25 },
          { fields: ["priceCurrency"], weight: 0.20 },
          { fields: ["availability"], weight: 0.20 },
          { fields: ["url"], weight: 0.15 },
          { fields: ["itemCondition"], weight: 0.20 },
        ])

        const advancedBonus =
          scoreFieldCompleteness(entity.raw, [
            { fields: ["priceValidUntil"], weight: 0.15 },
            { fields: ["seller"], weight: 0.20 },
            { fields: ["shippingDetails"], weight: 0.25 },
            { fields: ["hasMerchantReturnPolicy", "returnPolicy"], weight: 0.25 },
            { fields: ["inventoryLevel"], weight: 0.15 },
          ]) * 0.3

        return Math.min(
          1,
          (coreScore * 0.7) + advancedBonus
        )
      }),
      offerEntities.length > 0 ? 0.30 : 0
    )
  )

  const variantFieldScore = clampCoverage(
    productEntities.length === 0
      ? 0
      : averageCoverage(
        productEntities.map((entity) =>
          scoreFieldCompleteness(entity.raw, [
            { fields: ["color"], weight: 0.13 },
            { fields: ["size"], weight: 0.13 },
            { fields: ["material"], weight: 0.11 },
            { fields: ["gender"], weight: 0.09 },
            { fields: ["ageGroup"], weight: 0.09 },
            { fields: ["pattern"], weight: 0.09 },
            { fields: ["style"], weight: 0.09 },
            { fields: ["depth", "width", "height", "size"], weight: 0.14 },
            { fields: ["weight"], weight: 0.13 },
          ])
        )
      )
  )
  const variantRelationshipScore = clampCoverage(
    productEntities.some((entity) => hasSemanticField(entity.raw, ["isVariantOf", "hasVariant", "inProductGroupWithID"]))
      ? 1
      : 0
  )
  const variantSemanticScore = clampCoverage(variantFieldScore * 0.7 + variantRelationshipScore * 0.3)

  const brandCoverage = clampCoverage(
  productEntities.some((entity) =>
    hasSemanticField(entity.raw, ["brand"])
  )
    ? 1
    : 0
)

const canonicalCoverage = canonicalUrl ? 1 : 0

const breadcrumbCoverage =
  breadcrumbEntities.length > 0 ? 1 : 0
  const merchantTrustScore = clampCoverage(
    averageCoverage([
      brandCoverage,
      canonicalCoverage,
      breadcrumbCoverage,
      offerEntities.length > 0 ? 1 : 0,
      productEntities.length > 0 ? 1 : 0,
    ])
  )

  const relationshipCoverage = clampCoverage(
    productEntities.length === 0
      ? 0
      : averageCoverage(
        productEntities.map((entity) =>
          scoreFieldCompleteness(entity.raw, [
            { fields: ["brand"], weight: 0.18 },
            { fields: ["category"], weight: 0.14 },
            { fields: ["breadcrumb"], weight: 0.12 },
            { fields: ["seller", "manufacturer"], weight: 0.14 },
            { fields: ["isVariantOf", "hasVariant"], weight: 0.14 },
            { fields: ["review", "aggregateRating"], weight: 0.14 },
            { fields: ["offers"], weight: 0.14 },
          ])
        )
      )
  )
  const knowledgeGraphScore = clampCoverage(
    relationshipCoverage * 0.55 + graph.connectivityScore * 0.3 + graph.relationCoverage * 0.15
  )

  const potentialActionInProduct = productEntities.some((entity) =>
    hasSemanticField(entity.raw, ["potentialAction"])
  )
  const structuredActionability = clampCoverage(
    (actionEntities.length > 0 ? 0.45 : 0) +
    (potentialActionInProduct ? 0.2 : 0) +
    (networkSignals.hasCartApi ? 0.15 : 0) +
    (networkSignals.hasCheckout ? 0.1 : 0) +
    (networkSignals.hasApi ? 0.1 : 0)
  )
  const commerceActionabilityScore = clampCoverage(
    structuredActionability * 0.75 + (networkSignals.hasCheckout || networkSignals.hasCartApi ? 0.25 : 0)
  )

  const searchDiscoveryScore = clampCoverage(
    Math.max(
      merchantSignals.searchDiscoveryScore,
      (searchActionEntities.length > 0 ? 0.35 : 0) +
      (breadcrumbEntities.length > 0 ? 0.2 : 0) +
      (itemListEntities.length > 0 ? 0.2 : 0) +
      (faqEntities.length > 0 ? 0.1 : 0) +
      (/collectionpage|searchresultspage|filter|sort/i.test(normalized) ? 0.15 : 0)
    )
  )

  const allOfferPrices = offerEntities.flatMap((entity) => extractNumericValues(entity.raw.price))
  const conflictingPrices = new Set(allOfferPrices.map((price) => price.toFixed(2))).size > 1
  const staleAvailability =
    offerEntities.length > 0 &&
    !offerEntities.some((entity) => hasMeaningfulValue(entity.raw.priceValidUntil)) &&
    !/inventory|inventory_quantity|availableforsale|updatedat|last updated/i.test(normalized)
  const semanticReliabilityScore = clampCoverage(
    1 -
    Math.min(
      0.85,
      malformedCount * 0.12 +
      graph.duplicateEntityCount * 0.1 +
      graph.disconnectedNodes * 0.05 +
      (conflictingPrices ? 0.18 : 0) +
      (staleAvailability ? 0.1 : 0) +
      (canonicalUrl ? 0 : 0.12)
    )
  )

  const productCategories = productEntities.flatMap((entity) => getStringValues(entity.raw.category)).map(normalizeSemanticToken)
  const productBrands = productEntities.flatMap((entity) => getStringValues(entity.raw.brand)).map(normalizeSemanticToken)
  const productIdentifiers = productEntities.flatMap((entity) =>
    [
      ...getStringValues(entity.raw.sku),
      ...getStringValues(entity.raw.gtin),
      ...getStringValues(entity.raw.gtin13),
      ...getStringValues(entity.raw.gtin14),
      ...getStringValues(entity.raw.gtin8),
      ...getStringValues(entity.raw.mpn),
      ...getStringValues(entity.raw.productID),
      ...getStringValues(entity.raw.inProductGroupWithID),
    ].map(normalizeSemanticToken)
  )

  const aiShoppingReadinessScore = clampCoverage(
    productSchemaCompleteness * 0.22 +
    offerSchemaCompleteness * 0.22 +
    variantSemanticScore * 0.16 +
    commerceActionabilityScore * 0.16 +
    semanticReliabilityScore * 0.12 +
    (offerEntities.some((entity) => hasMeaningfulValue(entity.raw.availability)) ? 0.06 : 0) +
    (productCategories.length > 0 ? 0.03 : 0) +
    (productIdentifiers.length > 0 ? 0.03 : 0)
  )

  return {
    schema: productEntities.length > 0,
    price:
      offerEntities.some((entity) => hasMeaningfulValue(entity.raw.price)) ||
      /\$\s?\d|["']price["']|product:?price|saleprice|amount|currency/i.test(page),
    availability:
      offerEntities.some((entity) => hasMeaningfulValue(entity.raw.availability)) ||
      /instock|outofstock|in stock|out of stock|availability/i.test(normalized),
    cart: /add to cart|buy now|add-to-cart|checkout/i.test(normalized),
    description:
      productEntities.some((entity) => hasMeaningfulValue(entity.raw.description)) || normalized.length > 700,
    attributes:
      variantFieldScore > 0.2 || /size|color|colour|material|dimension|weight|specification/i.test(normalized),
    stableIdentifiers:
      productIdentifiers.length > 0 ||
      /["']sku["']|sku:|productsku|variantid|productid|data-sku|data-product-id|gtin|mpn/i.test(page),
    cartApi:
      networkSignals.hasCartApi ||
      /\/cart(?:\/add|\/update|\/change)?|addtocart|cart\/(add|items?)|api\/cart|cartcreate|cartlinesadd/i.test(normalized),
    checkoutFlow:
      networkSignals.hasCheckout ||
      /\/checkout|begincheckout|checkouturl|web_url|checkoutsession|createcheckout/i.test(normalized),
    realtimeCommerce:
      offerEntities.some((entity) => hasMeaningfulValue(entity.raw.availability)) &&
      offerEntities.some((entity) => hasMeaningfulValue(entity.raw.price)) ||
      /inventory|inventory_quantity|availableforsale|instock|outofstock|compare_at_price|saleprice|finalprice/i.test(normalized),
    productSchemaCompleteness,
    offerSchemaCompleteness,
    merchantTrustScore,
    variantSemanticScore,
    knowledgeGraphScore,
    semanticReliabilityScore,
    commerceActionabilityScore,
    searchDiscoveryScore,
    aiShoppingReadinessScore,
    canonicalUrlPresent: Boolean(canonicalUrl),
    malformedJsonLdCount: malformedCount,
    duplicateSchemaCount: graph.duplicateEntityCount,
    disconnectedEntityCount: graph.disconnectedNodes,
    productSignature: [...new Set(productIdentifiers)].sort().join("|"),
    variantSignature: [...new Set(
      [
        ...productEntities.flatMap((entity) => getStringValues(entity.raw.color)),
        ...productEntities.flatMap((entity) => getStringValues(entity.raw.size)),
        ...productEntities.flatMap((entity) => getStringValues(entity.raw.material)),
        ...productEntities.flatMap((entity) => getStringValues(entity.raw.pattern)),
        ...productEntities.flatMap((entity) => getStringValues(entity.raw.style)),
      ].map(normalizeSemanticToken)
    )].sort().join("|"),
    taxonomySignature: [...new Set([...productCategories, ...productBrands])].sort().join("|"),
    currencySignature: [...new Set(offerEntities.flatMap((entity) => getStringValues(entity.raw.priceCurrency)).map(normalizeSemanticToken))].sort().join("|"),
    merchantSignature: [...new Set([
      ...organizationEntities.flatMap((entity) => getStringValues(entity.raw.name)),
      ...websiteEntities.flatMap((entity) => getStringValues(entity.raw.name)),
      ...productBrands,
    ].map(normalizeSemanticToken))].sort().join("|"),
  }
}

function analyzeMerchantTrustLayer(homepage: string, homepageUrl: string) {
  const { entities } = extractJsonLd(homepage)
  const organizationEntities = getEntitiesByType(entities, "organization")
  const websiteEntities = getEntitiesByType(entities, "website")
  const searchActionEntities = getEntitiesByType(entities, "searchaction")
  const breadcrumbEntities = getEntitiesByType(entities, "breadcrumblist")
  const itemListEntities = getEntitiesByType(entities, "itemlist")
  const faqEntities = getEntitiesByType(entities, "faqpage")
  const canonicalUrl = extractCanonicalUrl(homepage, homepageUrl)

  const merchantTrustScore = averageCoverage(
    organizationEntities.concat(websiteEntities).map((entity) =>
      scoreFieldCompleteness(entity.raw, [
        { fields: ["name"], weight: 0.18 },
        { fields: ["url"], weight: 0.12 },
        { fields: ["sameAs"], weight: 0.18 },
        { fields: ["contactPoint"], weight: 0.16 },
        { fields: ["logo"], weight: 0.08 },
        { fields: ["hasMerchantReturnPolicy", "returnPolicy"], weight: 0.14 },
        { fields: ["shippingDetails", "makesOffer"], weight: 0.14 },
      ])
    )
  )

  const searchDiscoveryScore = clampCoverage(
    (searchActionEntities.length > 0 ? 0.35 : 0) +
    (breadcrumbEntities.length > 0 ? 0.2 : 0) +
    (itemListEntities.length > 0 ? 0.2 : 0) +
    (faqEntities.length > 0 ? 0.1 : 0) +
    (/searchaction|collectionpage|itemlist|faceted|breadcrumb/i.test(homepage.toLowerCase()) ? 0.15 : 0)
  )

  return {
    merchantTrustScore: clampCoverage(merchantTrustScore + (canonicalUrl ? 0.08 : 0)),
    searchDiscoveryScore,
  }
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
      productSchemaCompleteness: 0,
      offerSchemaCompleteness: 0,
      merchantTrustScore: 0,
      variantSemanticScore: 0,
      knowledgeGraphScore: 0,
      semanticReliabilityScore: 0,
      commerceActionabilityScore: 0,
      searchDiscoveryScore: 0,
      crossPageConsistencyScore: 0,
      aiShoppingReadinessScore: 0,
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
  const merchantLayerSignals = analyzeMerchantTrustLayer(homepage, resolvedBaseUrl)

  const productSignals: SemanticPageSignals[] = productPages.map((page, index) =>
    analyzeSemanticCommercePage(
      page,
      links[index] ?? origin,
      pageNetworkSignals[index],
      merchantLayerSignals
    )
  )

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
  const productSchemaCompleteness = averageCoverage(
    productSignals.map((signal) => signal.productSchemaCompleteness)
  )
  const offerSchemaCompleteness = averageCoverage(
    productSignals.map((signal) => signal.offerSchemaCompleteness)
  )
  const merchantTrustScore = clampCoverage(
    Math.max(
      merchantLayerSignals.merchantTrustScore,
      averageCoverage(productSignals.map((signal) => signal.merchantTrustScore))
    )
  )
  const variantSemanticScore = averageCoverage(
    productSignals.map((signal) => signal.variantSemanticScore)
  )
  const knowledgeGraphScore = averageCoverage(
    productSignals.map((signal) => signal.knowledgeGraphScore)
  )
  const semanticReliabilityScore = averageCoverage(
    productSignals.map((signal) => signal.semanticReliabilityScore)
  )
  const commerceActionabilityScore = clampCoverage(
    Math.max(
      averageCoverage(productSignals.map((signal) => signal.commerceActionabilityScore)),
      clampCoverage((cartApiCoverage + checkoutFlowCoverage) / 2)
    )
  )
  const searchDiscoveryScore = clampCoverage(
    Math.max(
      merchantLayerSignals.searchDiscoveryScore,
      averageCoverage(productSignals.map((signal) => signal.searchDiscoveryScore))
    )
  )
  const crossPageConsistencyScore = clampCoverage(
    productSignals.length === 0
      ? 0
      : compareNormalizedSets(productSignals.map((signal) => signal.productSignature)) * 0.35 +
      compareNormalizedSets(productSignals.map((signal) => signal.variantSignature)) * 0.2 +
      compareNormalizedSets(productSignals.map((signal) => signal.taxonomySignature)) * 0.2 +
      compareNormalizedSets(productSignals.map((signal) => signal.currencySignature)) * 0.1 +
      compareNormalizedSets(productSignals.map((signal) => signal.merchantSignature)) * 0.15
  )
  const aiShoppingReadinessScore = clampCoverage(
    averageCoverage(productSignals.map((signal) => signal.aiShoppingReadinessScore))
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
    productSchemaCompleteness,
    offerSchemaCompleteness,
    merchantTrustScore,
    variantSemanticScore,
    knowledgeGraphScore,
    semanticReliabilityScore,
    commerceActionabilityScore,
    searchDiscoveryScore,
    crossPageConsistencyScore,
    aiShoppingReadinessScore,
  }
}

function scoreLlms(signals: AuditSignals) {
  console.log("LLMS_SIGNALS:", {
    llmsTxtFound: signals.llmsTxtFound,
    llmsFullFound: signals.llmsFullFound,
    llmsTxtParsable: signals.llmsTxtParsable,
    llmsTxtStructured: signals.llmsTxtStructured,
    llmsTxtHasCanonicalLinks: signals.llmsTxtHasCanonicalLinks,
    llmsTxtHasMarkdownLinks: signals.llmsTxtHasMarkdownLinks,
    llmsTxtHasAiGuidance: signals.llmsTxtHasAiGuidance,
    llmsTxtSectionQuality: signals.llmsTxtSectionQuality,
    llmsTxtContentDepth: signals.llmsTxtContentDepth,
  })

  const llmsBreakdown = {
    llmsTxtFoundContribution: signals.llmsTxtFound ? 20 : 0,
    llmsFullFoundContribution: signals.llmsFullFound ? 8 : 0,
    llmsTxtParsableContribution: signals.llmsTxtParsable ? 8 : 0,
    llmsTxtStructuredContribution: signals.llmsTxtStructured ? 18 : 0,
    canonicalLinksContribution: signals.llmsTxtHasCanonicalLinks ? 14 : 0,
    markdownLinksContribution: signals.llmsTxtHasMarkdownLinks ? 10 : 0,
    aiGuidanceContribution: signals.llmsTxtHasAiGuidance ? 16 : 0,
    sectionQualityContribution: signals.llmsTxtSectionQuality * 10,
    contentDepthContribution: signals.llmsTxtContentDepth * 6,
  }

  console.log("LLMS_BREAKDOWN:", llmsBreakdown)

  console.log("LLMS_PENALTIES:", {
    missingPrimaryLlmsTxt: !signals.llmsTxtFound,
    missingLlmsFull: !signals.llmsFullFound,
    unparsableDocument: !signals.llmsTxtParsable,
    weakStructure: !signals.llmsTxtStructured,
    missingCanonicalLinks: !signals.llmsTxtHasCanonicalLinks,
    missingMarkdownLinks: !signals.llmsTxtHasMarkdownLinks,
    missingAiGuidance: !signals.llmsTxtHasAiGuidance,
    thinSections: signals.llmsTxtSectionQuality < 0.6,
    shallowContentDepth: signals.llmsTxtContentDepth < 0.6,
  })

  const score = clamp(
    llmsBreakdown.llmsTxtFoundContribution +
    llmsBreakdown.llmsFullFoundContribution +
    llmsBreakdown.llmsTxtParsableContribution +
    llmsBreakdown.llmsTxtStructuredContribution +
    llmsBreakdown.canonicalLinksContribution +
    llmsBreakdown.markdownLinksContribution +
    llmsBreakdown.aiGuidanceContribution +
    llmsBreakdown.sectionQualityContribution +
    llmsBreakdown.contentDepthContribution
  )
  const status = classify(score)

  console.log("LLMS_FINAL_DEBUG:", {
    weightedScore: score,
    finalScore: score,
    status,
  })

  console.log("LLMS_REASON:", {
    reason:
      signals.llmsTxtFound && signals.llmsTxtStructured && signals.llmsTxtHasAiGuidance
        ? "Score is supported by a discoverable llms.txt surface with meaningful AI guidance and structured sections."
        : !signals.llmsTxtFound
          ? "Score dropped because no valid llms.txt document was confirmed at the expected discovery paths."
          : !signals.llmsTxtStructured
            ? "Score dropped because the discovered llms guidance is not structured enough for dependable machine extraction."
            : "Score dropped because AI guidance, canonical references, or document depth are still incomplete.",
  })

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
    status,
    findings,
    impact:
      "This category measures whether the brand has intentionally published structured AI-ingestion guidance and canonical AI-readable resources, not whether generic SEO crawl signals happen to exist.",
  }
}

function scoreAiDocumentation(signals: AuditSignals) {
  const hasDetectedMarkdownDocs = signals.markdownDocsFound || signals.agentDocsFound
  console.log("AGENT_GUIDANCE_SIGNALS:", {
    markdownDocsFound: signals.markdownDocsFound,
    agentDocsFound: signals.agentDocsFound,
    markdownStructured: signals.markdownStructured,
    markdownHasWorkflowGuidance: signals.markdownHasWorkflowGuidance,
    markdownHasApiReferences: signals.markdownHasApiReferences,
    markdownHasAgentInstructions: signals.markdownHasAgentInstructions,
    markdownSemanticQuality: signals.markdownSemanticQuality,
  })

  if (!hasDetectedMarkdownDocs) {
    console.log("AGENT_GUIDANCE_BREAKDOWN:", {
      markdownDocsContribution: 0,
      agentDocsContribution: 0,
      structuredContribution: 0,
      workflowGuidanceContribution: 0,
      apiReferencesContribution: 0,
      agentInstructionsContribution: 0,
      semanticQualityContribution: 0,
    })
    console.log("AGENT_GUIDANCE_PENALTIES:", {
      missingMarkdownDocs: true,
      missingAgentDoc: true,
      weakStructure: true,
      missingWorkflowGuidance: true,
      missingApiReferences: true,
      missingAgentInstructions: true,
      lowSemanticQuality: true,
    })
    console.log("AGENT_GUIDANCE_FINAL_DEBUG:", {
      weightedScore: 0,
      finalScore: 0,
      status: classify(0),
    })
    console.log("AGENT_GUIDANCE_REASON:", {
      reason: "Score is zero because no valid markdown guidance document was confirmed at the expected agent-facing documentation paths.",
    })
    return {
      name: "Agent Guidance Layer" as const,
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

  const agentGuidanceBreakdown = {
    markdownDocsContribution: signals.markdownDocsFound ? 24 : 0,
    agentDocsContribution: signals.agentDocsFound ? 14 : 0,
    structuredContribution: signals.markdownStructured ? 18 : 0,
    workflowGuidanceContribution: signals.markdownHasWorkflowGuidance ? 14 : 0,
    apiReferencesContribution: signals.markdownHasApiReferences ? 12 : 0,
    agentInstructionsContribution: signals.markdownHasAgentInstructions ? 10 : 0,
    semanticQualityContribution: signals.markdownSemanticQuality * 8,
  }

  console.log("AGENT_GUIDANCE_BREAKDOWN:", agentGuidanceBreakdown)

  console.log("AGENT_GUIDANCE_PENALTIES:", {
    missingMarkdownDocs: !signals.markdownDocsFound,
    missingAgentDoc: !signals.agentDocsFound,
    weakStructure: !signals.markdownStructured,
    missingWorkflowGuidance: !signals.markdownHasWorkflowGuidance,
    missingApiReferences: !signals.markdownHasApiReferences,
    missingAgentInstructions: !signals.markdownHasAgentInstructions,
    lowSemanticQuality: signals.markdownSemanticQuality < 0.6,
  })

  const score = clamp(
    agentGuidanceBreakdown.markdownDocsContribution +
    agentGuidanceBreakdown.agentDocsContribution +
    agentGuidanceBreakdown.structuredContribution +
    agentGuidanceBreakdown.workflowGuidanceContribution +
    agentGuidanceBreakdown.apiReferencesContribution +
    agentGuidanceBreakdown.agentInstructionsContribution +
    agentGuidanceBreakdown.semanticQualityContribution
  )
  const status = classify(score)

  console.log("AGENT_GUIDANCE_FINAL_DEBUG:", {
    weightedScore: score,
    finalScore: score,
    status,
  })

  console.log("AGENT_GUIDANCE_REASON:", {
    reason:
      signals.markdownStructured && signals.markdownHasAgentInstructions && signals.markdownHasApiReferences
        ? "Score is supported by structured markdown guidance with explicit agent instructions and machine-relevant references."
        : !signals.markdownStructured
          ? "Score dropped because the discovered guidance docs are not structured enough for dependable agent ingestion."
          : !signals.markdownHasAgentInstructions
            ? "Score dropped because the guidance docs do not clearly tell agents how to operate or what to prefer."
            : "Score dropped because workflow guidance, API references, or semantic richness are still incomplete.",
  })

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
    name: "Agent Guidance Layer" as const,
    score,
    status,
    findings,
    impact:
      "AI documentation measures whether the brand publishes supplemental markdown docs that help agents understand workflows, resources, and usage expectations beyond storefront content alone.",
  }
}

function scoreMarkdown(signals: AuditSignals) {
  console.log("AI_CONTENT_QUALITY_SIGNALS:", {
    descriptionCoverage: signals.descriptionCoverage,
    attributeCoverage: signals.attributeCoverage,
  })

  const aiContentBreakdown = {
    baseContribution: 20,
    descriptionContribution: signals.descriptionCoverage * 45,
    attributeContribution: signals.attributeCoverage * 35,
  }

  console.log("AI_CONTENT_QUALITY_BREAKDOWN:", aiContentBreakdown)

  console.log("AI_CONTENT_QUALITY_PENALTIES:", {
    weakDescriptionCoverage: signals.descriptionCoverage < 0.7,
    weakAttributeCoverage: signals.attributeCoverage < 0.7,
    thinProductNarrative: signals.descriptionCoverage < 0.5,
    lowStructuredAttributeDepth: signals.attributeCoverage < 0.5,
  })

  const score = clamp(
    aiContentBreakdown.baseContribution +
    aiContentBreakdown.descriptionContribution +
    aiContentBreakdown.attributeContribution
  )
  const status = classify(score)

  console.log("AI_CONTENT_QUALITY_FINAL_DEBUG:", {
    weightedScore: score,
    finalScore: score,
    status,
  })

  console.log("AI_CONTENT_QUALITY_REASON:", {
    reason:
      signals.descriptionCoverage >= 0.7 && signals.attributeCoverage >= 0.7
        ? "Score is supported by strong description coverage and enough structured product detail for AI summarization and comparison."
        : signals.descriptionCoverage < signals.attributeCoverage
          ? "Score dropped mainly because product descriptions are too thin or inconsistent across sampled pages."
          : "Score dropped mainly because structured product attributes are too sparse for confident AI comparison and Q&A.",
  })

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
    name: "AI Content Quality" as const,
    score,
    status,
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

  console.log("AI_INTEGRATIONS_SIGNALS:", {
    detectedPlatform: signals.detectedPlatform,
    schemaCoverage: signals.schemaCoverage,
    cartCoverage: signals.cartCoverage,
    platformBaseScore: platformScores[signals.detectedPlatform],
  })

  const integrationsBreakdown = {
    platformContribution: platformScores[signals.detectedPlatform],
    schemaContribution: signals.schemaCoverage * 8,
    cartContribution: signals.cartCoverage * 6,
  }

  console.log("AI_INTEGRATIONS_BREAKDOWN:", integrationsBreakdown)

  console.log("AI_INTEGRATIONS_PENALTIES:", {
    customOrWeakPlatformBase: signals.detectedPlatform === "custom" || signals.detectedPlatform === "magento",
    weakSchemaCoverage: signals.schemaCoverage < 0.6,
    weakCartCoverage: signals.cartCoverage < 0.6,
    noDirectIntegrationEvidence: true,
  })

  const score = clamp(
    integrationsBreakdown.platformContribution +
    integrationsBreakdown.schemaContribution +
    integrationsBreakdown.cartContribution
  )
  const status = classify(score)

  console.log("AI_INTEGRATIONS_FINAL_DEBUG:", {
    weightedScore: score,
    finalScore: score,
    status,
  })

  console.log("AI_INTEGRATIONS_REASON:", {
    reason:
      signals.detectedPlatform === "kartmaX"
        ? "Score is buoyed by a stronger inferred platform foundation, with schema and cart signals adding incremental support."
        : signals.detectedPlatform === "custom"
          ? "Score is constrained because a custom stack provides no assumed AI integration layer, so readiness depends on live implementations not proven here."
          : signals.schemaCoverage < 0.6 || signals.cartCoverage < 0.6
            ? "Score dropped because platform potential is not yet reinforced by strong schema or commerce interaction signals."
            : "Score reflects moderate platform potential, but not confirmed live AI integrations.",
  })

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
    status,
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
    name: "MCP Compatibility" as const,
    score: finalScore,
    status: classify(finalScore),
    findings,
    impact:
      "Strong agentic readiness means autonomous systems can discover capabilities, authenticate, preserve context, and execute commerce workflows reliably rather than merely read storefront data.",
  }
}

function scoreGeo(signals: AuditSignals) {
  console.log("GEO_SIGNALS:", {
    productSchemaCompleteness: signals.productSchemaCompleteness,
    offerSchemaCompleteness: signals.offerSchemaCompleteness,
    merchantTrustScore: signals.merchantTrustScore,
    variantSemanticScore: signals.variantSemanticScore,
    knowledgeGraphScore: signals.knowledgeGraphScore,
    semanticReliabilityScore: signals.semanticReliabilityScore,
    commerceActionabilityScore: signals.commerceActionabilityScore,
    searchDiscoveryScore: signals.searchDiscoveryScore,
    crossPageConsistencyScore: signals.crossPageConsistencyScore,
    aiShoppingReadinessScore: signals.aiShoppingReadinessScore,
  })

  const geoBreakdown = {
    productContribution: signals.productSchemaCompleteness * 0.35,
offerContribution: signals.offerSchemaCompleteness * 0.25,
semanticReliabilityContribution: signals.semanticReliabilityScore * 0.15,
merchantContribution: signals.merchantTrustScore * 0.10,
commerceActionabilityContribution: signals.commerceActionabilityScore * 0.10,
searchDiscoveryContribution: signals.searchDiscoveryScore * 0.05,

variantBonus: signals.variantSemanticScore * 0.03,
knowledgeGraphBonus: signals.knowledgeGraphScore * 0.03,
crossPageConsistencyBonus: signals.crossPageConsistencyScore * 0.02,
aiShoppingReadinessBonus: signals.aiShoppingReadinessScore * 0.02,
  }

  const foundationScore =
    geoBreakdown.productContribution +
    geoBreakdown.offerContribution +
    geoBreakdown.semanticReliabilityContribution +
    geoBreakdown.merchantContribution +
    geoBreakdown.commerceActionabilityContribution +
    geoBreakdown.searchDiscoveryContribution

  const maturityBonus =
    geoBreakdown.variantBonus +
    geoBreakdown.knowledgeGraphBonus +
    geoBreakdown.crossPageConsistencyBonus +
    geoBreakdown.aiShoppingReadinessBonus

  console.log("GEO_BREAKDOWN:", geoBreakdown)

  console.log("GEO_PENALTIES:", {
    weakProductSchema: signals.productSchemaCompleteness < 0.7,
    weakOfferSchema: signals.offerSchemaCompleteness < 0.7,
    weakMerchantTrust: signals.merchantTrustScore < 0.6,
    malformedOrUnreliableSchema: signals.semanticReliabilityScore < 0.7,
    weakCommerceActions: signals.commerceActionabilityScore < 0.6,
    weakSearchDiscovery: signals.searchDiscoveryScore < 0.6,
    weakVariantsNonBlocking: signals.variantSemanticScore < 0.6,
    disconnectedEntitiesNonBlocking: signals.knowledgeGraphScore < 0.6,
    inconsistentSchemaNonBlocking: signals.crossPageConsistencyScore < 0.6,
    weakAiShoppingReadinessNonBlocking: signals.aiShoppingReadinessScore < 0.6,
  })

  const score = clamp(
    (foundationScore + maturityBonus) * 100
  )
  const status = classify(score)

  console.log("GEO_FINAL_DEBUG:", {
    foundationScore: foundationScore * 100,
    maturityBonus: maturityBonus * 100,
    weightedScore: (foundationScore + maturityBonus) * 100,
    finalScore: score,
    status,
  })

  console.log("GEO_REASON:", {
    reason:
      signals.productSchemaCompleteness < 0.7 && signals.offerSchemaCompleteness < 0.7
        ? "Score is held back mainly by weak foundational Product and Offer schema coverage, which now drives most of GEO."
        : signals.offerSchemaCompleteness < 0.7
          ? "Score is held back mainly by incomplete offer schema, especially around price, availability, and machine-readable commerce context."
          : signals.semanticReliabilityScore < 0.7
            ? "Score reduced because structured commerce data still looks unreliable or inconsistent across the sampled catalog."
            : signals.variantSemanticScore < 0.6 || signals.knowledgeGraphScore < 0.6
              ? "Foundational schema is reasonably in place, but advanced semantic maturity signals are only adding a limited bonus."
              : "Score is supported by strong foundational product and offer schema, with advanced semantic layers providing additional uplift.",
  })

  const findings = [
    signals.productSchemaCompleteness >= 0.7
      ? `Product schema is semantically rich across sampled pages (${Math.round(signals.productSchemaCompleteness * 100)}% completeness).`
      : `Product schema remains incomplete or uneven (${Math.round(signals.productSchemaCompleteness * 100)}% completeness), so agents may miss key product meaning.`,
    signals.offerSchemaCompleteness >= 0.7
      ? `Offer schema exposes strong machine-readable pricing and availability context (${Math.round(signals.offerSchemaCompleteness * 100)}%).`
      : `Offer intelligence is still thin (${Math.round(signals.offerSchemaCompleteness * 100)}%), which weakens price, inventory, and trust-aware buying guidance.`,
    signals.variantSemanticScore >= 0.6
      ? "Variant attributes and grouping signals are strong enough to support comparison and recommendation flows."
      : "Variant semantics are still weak, so shopping agents may struggle with size, color, material, and product-family reasoning.",
    signals.knowledgeGraphScore >= 0.6
      ? "Schema entities are reasonably connected through brand, merchant, breadcrumb, review, and offer relationships."
      : "The commerce graph still looks fragmented, which lowers confidence in multi-entity reasoning.",
    signals.semanticReliabilityScore >= 0.7
      ? "Structured data looks fairly reliable, with fewer signs of malformed or conflicting commerce entities."
      : "Reliability issues such as malformed JSON-LD, disconnected entities, stale availability, or missing canonicals may reduce AI trust.",
    signals.commerceActionabilityScore >= 0.6
      ? "Machine-readable action surfaces are present, which helps agents move from understanding into execution."
      : "Commerce actionability is limited, so the schema layer still reads better than it acts.",
    signals.crossPageConsistencyScore >= 0.6
      ? "Schema patterns look reasonably consistent across the sampled product pages."
      : "Cross-page schema consistency is still uneven, which makes extraction and normalization less dependable at catalog scale.",
  ]

  return {
    name: "GEO / Smart JSON-LD / Schema" as const,
    score,
    status,
    findings,
    impact:
      "This category measures AI-commerce semantic readiness: whether autonomous systems can reliably understand products, trust commerce facts, preserve relationships, and act on structured buying signals across the storefront.",
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

  if (
    signals.productSchemaCompleteness < 0.7 ||
    signals.offerSchemaCompleteness < 0.7 ||
    signals.semanticReliabilityScore < 0.7
  ) {
    priorities.push("Strengthen JSON-LD so products, offers, canonicals, and merchant relationships are complete, reliable, and trustworthy for AI extraction.")
  }

  if (
    signals.variantSemanticScore < 0.6 ||
    signals.crossPageConsistencyScore < 0.6 ||
    signals.aiShoppingReadinessScore < 0.6
  ) {
    priorities.push("Normalize variant attributes, taxonomy, and cross-page schema patterns so shopping agents can compare, filter, and recommend products consistently.")
  }

  if (signals.commerceActionabilityScore < 0.6 || signals.searchDiscoveryScore < 0.6) {
    priorities.push("Expose stronger discovery and action semantics with SearchAction, breadcrumbs, item lists, and machine-readable transactional flows.")
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
    productSchemaCompleteness: clampCoverage(
      payload.signals?.productSchemaCompleteness ?? derivedSignals.productSchemaCompleteness
    ),
    offerSchemaCompleteness: clampCoverage(
      payload.signals?.offerSchemaCompleteness ?? derivedSignals.offerSchemaCompleteness
    ),
    merchantTrustScore: clampCoverage(
      payload.signals?.merchantTrustScore ?? derivedSignals.merchantTrustScore
    ),
    variantSemanticScore: clampCoverage(
      payload.signals?.variantSemanticScore ?? derivedSignals.variantSemanticScore
    ),
    knowledgeGraphScore: clampCoverage(
      payload.signals?.knowledgeGraphScore ?? derivedSignals.knowledgeGraphScore
    ),
    semanticReliabilityScore: clampCoverage(
      payload.signals?.semanticReliabilityScore ?? derivedSignals.semanticReliabilityScore
    ),
    commerceActionabilityScore: clampCoverage(
      payload.signals?.commerceActionabilityScore ?? derivedSignals.commerceActionabilityScore
    ),
    searchDiscoveryScore: clampCoverage(
      payload.signals?.searchDiscoveryScore ?? derivedSignals.searchDiscoveryScore
    ),
    crossPageConsistencyScore: clampCoverage(
      payload.signals?.crossPageConsistencyScore ?? derivedSignals.crossPageConsistencyScore
    ),
    aiShoppingReadinessScore: clampCoverage(
      payload.signals?.aiShoppingReadinessScore ?? derivedSignals.aiShoppingReadinessScore
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
