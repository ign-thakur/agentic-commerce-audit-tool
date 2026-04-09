import { NextRequest, NextResponse } from "next/server"
import { runAudit } from "@/lib/audit"

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

    const report = await runAudit({ url, signals })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Audit route failed", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
