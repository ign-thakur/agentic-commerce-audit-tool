import { runAudit } from "./lib/audit.ts"

async function test() {
  const urls = [
    "http://secretwish.in/",
    "https://www.williampenn.net/",
    "https://india.ray-ban.com/"
  ]

  for (const url of urls) {
    console.log("\n====================")
    console.log("Testing:", url)

    const result = await runAudit(url)

    console.log("FINAL SCORE:", result.score)

    console.log(
      "AGENTIC COMMERCE SCORE:",
      result.categories.find(
        c => c.name === "Agentic Commerce Readiness"
      )?.score
    )

    console.log(
      "LLMS.TXT SCORE:",
      result.categories.find(
        c => c.name === "LLMs.txt"
      )?.score
    )

    console.log(
      "AI DOCUMENTATION SCORE:",
      result.categories.find(
        c => c.name === "AI Documentation"
      )?.score
    )

    if (result.signals) {
      console.log("LLMS_SIGNALS:", {
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
      })

      console.log("AI_DOC_SIGNALS:", {
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
    }
  }
}

test()