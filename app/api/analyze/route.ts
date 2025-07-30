import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  image: z.instanceof(File).refine((file) => file.size > 0, "Image is required."),
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const validatedFields = schema.safeParse({
      image: formData.get("image"),
    })

    if (!validatedFields.success) {
      return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 400 })
    }

    const { image } = validatedFields.data

    const webhookFormData = new FormData()
    webhookFormData.append("image", image)

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    if (!n8nWebhookUrl) {
      throw new Error("N8N_WEBHOOK_URL is not configured in environment variables.")
    }

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      body: webhookFormData,
    })

    // This is the key change: we check if the response is OK before trying to parse it as JSON.
    if (!response.ok) {
      const errorText = await response.text()
      console.error("n8n webhook error:", errorText)
      // We return a proper JSON error object to the client.
      return NextResponse.json(
        { error: `The n8n workflow failed. Status: ${response.status}. Message: ${errorText}` },
        { status: 500 },
      )
    }

    const result = await response.json()

    // Pass the successful result to the client.
    return NextResponse.json(result)
  } catch (error) {
    console.error("API route error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
