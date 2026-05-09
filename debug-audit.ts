import { runAudit } from "./lib/audit.ts"

function printDivider() {
  console.log(
    "\n============================================================"
  )
}

function printSection(title: string) {
  console.log(`\n🔹 ${title}`)
  console.log("------------------------------------------------------------")
}

async function test() {
  const urls = [
    "https://www.williampenn.net/product/fisher-space-cerakote-graphite-black-with-gold-titanium-nitride-accents-ballpoint-pen-with-click-and-release-button-mechanism-1766987889"
  ]

  for (const url of urls) {
    printDivider()
    console.log("🚀 TESTING:", url)
    printDivider()

    const result = await runAudit(url)

    console.log("\n🏁 OVERALL RESULT")
    console.log("------------------------------------------------------------")
    console.log("FINAL SCORE:", result.score)
    console.log("STATUS:", result.status)

    printSection("CATEGORY SCORES")

    for (const category of result.categories) {
      console.log(
        `${category.name}: ${category.score} (${category.status})`
      )
    }

    printSection("SUMMARY")
    console.log(result.summary)

    printSection("PRIORITIES")

    if (result.priorities?.length) {
      result.priorities.forEach((priority, index) => {
        console.log(`${index + 1}. ${priority}`)
      })
    } else {
      console.log("No major priorities detected.")
    }

    if (result.signals) {
      printSection("LLMS.TXT SIGNALS")

      console.log({
        llmsTxtFound:
          result.signals.llmsTxtFound,

        llmsFullFound:
          result.signals.llmsFullFound,

        llmsTxtParsable:
          result.signals.llmsTxtParsable,

        llmsTxtStructured:
          result.signals.llmsTxtStructured,

        llmsTxtHasCanonicalLinks:
          result.signals.llmsTxtHasCanonicalLinks,

        llmsTxtHasMarkdownLinks:
          result.signals.llmsTxtHasMarkdownLinks,

        llmsTxtHasAiGuidance:
          result.signals.llmsTxtHasAiGuidance,

        llmsTxtSectionQuality:
          result.signals.llmsTxtSectionQuality,

        llmsTxtContentDepth:
          result.signals.llmsTxtContentDepth,
      })

      printSection("AI DOC SIGNALS")

      console.log({
        markdownDocsFound:
          result.signals.markdownDocsFound,

        agentDocsFound:
          result.signals.agentDocsFound,

        markdownStructured:
          result.signals.markdownStructured,

        markdownHasWorkflowGuidance:
          result.signals.markdownHasWorkflowGuidance,

        markdownHasApiReferences:
          result.signals.markdownHasApiReferences,

        markdownHasAgentInstructions:
          result.signals.markdownHasAgentInstructions,

        markdownSemanticQuality:
          result.signals.markdownSemanticQuality,
      })

      printSection("AI CONTENT QUALITY SIGNALS")

      console.log({
        descriptionCoverage:
          result.signals.descriptionCoverage,

        attributeCoverage:
          result.signals.attributeCoverage,
      })

      printSection("AI INTEGRATIONS SIGNALS")

      console.log({
        detectedPlatform:
          result.signals.detectedPlatform,

        schemaCoverage:
          result.signals.schemaCoverage,

        cartCoverage:
          result.signals.cartCoverage,
      })

      printSection("GEO / SMART SCHEMA SIGNALS")

      console.log({
        schemaCoverage:
          result.signals.schemaCoverage,

        priceCoverage:
          result.signals.priceCoverage,

        availabilityCoverage:
          result.signals.availabilityCoverage,

        attributeCoverage:
          result.signals.attributeCoverage,

        merchantTrustScore:
          result.signals.merchantTrustScore,

        variantSemanticScore:
          result.signals.variantSemanticScore,

        semanticReliabilityScore:
          result.signals.semanticReliabilityScore,

        knowledgeGraphScore:
          result.signals.knowledgeGraphScore,

        commerceActionabilityScore:
          result.signals.commerceActionabilityScore,

        searchDiscoveryScore:
          result.signals.searchDiscoveryScore,

        crossPageConsistencyScore:
          result.signals.crossPageConsistencyScore,

        aiShoppingReadinessScore:
          result.signals.aiShoppingReadinessScore,
      })

      printSection("MCP COMPATIBILITY SIGNALS")

      console.log({
        mcpEndpointDetected:
          result.signals.mcpEndpointDetected,

        oauthDiscoveryDetected:
          result.signals.oauthDiscoveryDetected,

        authenticatedApiDetected:
          result.signals.authenticatedApiDetected,

        publicApiDetected:
          result.signals.publicApiDetected,

        actionabilityDetected:
          result.signals.actionabilityDetected,

        sessionContinuityDetected:
          result.signals.sessionContinuityDetected,

        hasDefaultContext:
          result.signals.hasDefaultContext,

        clearToolDiscovery:
          result.signals.clearToolDiscovery,

        readCoverage:
          result.signals.readCoverage,

        writeCoverage:
          result.signals.writeCoverage,

        toolCoverage:
          result.signals.toolCoverage,

        successRate:
          result.signals.successRate,

        schemaConsistency:
          result.signals.schemaConsistency,

        latencyScore:
          result.signals.latencyScore,

        surfaceAuthenticityScore:
          result.signals.surfaceAuthenticityScore,

        semanticClarityScore:
          result.signals.semanticClarityScore,
      })
    }

    printDivider()
    console.log("✅ AUDIT COMPLETE:", url)
    printDivider()
  }
}

test()