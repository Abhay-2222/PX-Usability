import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Expect a JSON body with the Base64 string
    const body = await request.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is missing." }, { status: 400 })
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    if (!n8nWebhookUrl) {
      throw new Error("N8N_WEBHOOK_URL is not configured in environment variables.")
    }

    // Forward the JSON payload (or just the base64 string) to the n8n webhook
    // Assuming n8n is set up to receive this JSON format
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64 }), // Forwarding the received structure
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("n8n webhook error:", errorText)
      return NextResponse.json(
        { error: `The n8n workflow failed. Status: ${response.status}. Message: ${errorText}` },
        { status: 500 },
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("API route error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
