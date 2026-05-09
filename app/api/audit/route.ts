import { NextRequest, NextResponse } from "next/server"
import { runAudit } from "@/lib/audit"

const inflightAudits = new Map<string, Promise<Awaited<ReturnType<typeof runAudit>>>>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, signals } = body

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    console.log("AUDIT_REQUEST:", { url })
    const dedupeKey = `${String(url).trim().toLowerCase()}::${JSON.stringify(signals ?? {})}`
    const auditPromise =
      inflightAudits.get(dedupeKey) ??
      runAudit({ url, signals }).finally(() => {
        inflightAudits.delete(dedupeKey)
      })

    if (!inflightAudits.has(dedupeKey)) {
      inflightAudits.set(dedupeKey, auditPromise)
    }

    const report = await Promise.race([
      auditPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Audit timeout")), 40000)
      ),
    ])
    console.log("AUDIT_RESULT:", {
      url,
      detectedPlatform: report.signals?.detectedPlatform,
      score: report.score,
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Audit route failed", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof Error && error.message === "Audit timeout" ? 504 : 500 }
    )
  }
}
