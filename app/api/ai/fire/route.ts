import { NextRequest, NextResponse } from "next/server"
import { buildFireFallback } from "@/lib/ai-fallbacks"
import { callGroqStream } from "@/lib/groq"
import { getCached, setCache } from "@/lib/api-cache"
import { isRateLimited } from "@/lib/rate-limiter"
import { fireInputSchema } from "@/lib/api-schemas"
import type { FireRequestBody, FireResult } from "@/types"

const FIRE_SYSTEM_PROMPT = `
You are ArthMitra, an expert Indian financial advisor.
You must respond ONLY in valid JSON format representing the exact schema below. No markdown, no explanation outside JSON.
All monetary values in Indian Rupees. Use Indian number system (lakhs, crores).
Be specific, accurate, and actionable. Assume 12% equity returns, 7% debt returns, 6% inflation.

Response schema:
{
  "canRetireAtAge": number,
  "yearsToFIRE": number,
  "corpusNeeded": number,
  "recommendedMonthlySIP": number,
  "currentSurplus": number,
  "sipGap": number,
  "assetAllocation": {
    "largeCap": number,
    "midCap": number,
    "debt": number,
    "gold": number,
    "emergency": number
  },
  "yearlyProjections": [
    { "year": 2025, "corpus": number },
    ...for 20 years
  ],
  "actionSteps": ["step 1", "step 2", "step 3", "step 4"],
  "narrative": "A 2-3 sentence personalized plain English explanation targeting the user's specific FIRE gap.",
  "warnings": ["Warning 1", "Warning 2"]
}
`

export async function POST(request: NextRequest) {
  const body = (await request.json()) as FireRequestBody & { uid?: string }
  const uid = body.uid || "anonymous"

  if (isRateLimited(uid)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  const parsed = fireInputSchema.safeParse(body?.userInputs)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid FIRE inputs.", details: parsed.error.format() }, { status: 400 })
  }

  const cached = getCached<FireResult>(parsed.data)
  if (cached) {
    return NextResponse.json({ result: cached, cached: true, timestamp: new Date().toISOString() })
  }

  try {
    const stream = await callGroqStream({
      systemPrompt: FIRE_SYSTEM_PROMPT,
      payload: parsed.data,
      temperature: 0.2,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let fullText = ""
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ""
            if (text) {
              fullText += text
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
          
          // Try to safely cache the completed JSON string
          try {
            const resultObj = JSON.parse(fullText) as FireResult
            setCache(parsed.data, resultObj)
          } catch (e) {
            console.error("Failed to parse and cache streaming Groq response", e)
          }

        } catch (streamError) {
          console.error("Stream error:", streamError)
          controller.error(streamError)
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    console.error("FIRE API Error:", error)
    const fallback = buildFireFallback(parsed.data)
    fallback.warnings.push("AI generated response unavailable. Displaying mathematical fallback calculation.")
    return NextResponse.json({
      result: fallback,
      timestamp: new Date().toISOString(),
    })
  }
}
