import { NextRequest, NextResponse } from "next/server"

const GOOGLE_SHEETS_WEBHOOK_URL =
  process.env.GOOGLE_SHEETS_WEBHOOK_URL ??
  "https://script.google.com/macros/s/AKfycbyLHqVGZk8OffW9M9XNMgfTc9oSengvkADg0ZCK2qieZ9fXmSZddcsTrEkMtB3QtltfwA/exec"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const website = typeof body.website === "string" ? body.website.trim() : ""
    const source = typeof body.source === "string" ? body.source.trim() : "homepage"

    if (!email || !website) {
      return NextResponse.json(
        { error: "Email and website are required" },
        { status: 400 }
      )
    }

    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        website,
        source,
        timestamp: new Date().toISOString(),
      }),
      cache: "no-store",
    })

    const responseText = await response.text().catch(() => "")

    if (!response.ok) {
      console.error("Google Sheets webhook failed", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      })

      return NextResponse.json(
        { error: "Failed to store lead", details: responseText },
        { status: 502 }
      )
    }

    let parsedResponse: unknown = null

    try {
      parsedResponse = responseText ? JSON.parse(responseText) : null
    } catch {
      parsedResponse = responseText || null
    }

    return NextResponse.json({
      ok: true,
      webhook: parsedResponse,
    })
  } catch (error) {
    console.error("Lead capture failed", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
