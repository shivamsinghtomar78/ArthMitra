import { NextRequest, NextResponse } from "next/server"
import { buildHealthFallback } from "@/lib/ai-fallbacks"
import { callGroqJSONWithRetry } from "@/lib/groq"
import { getCached, setCache } from "@/lib/api-cache"
import { isRateLimited } from "@/lib/rate-limiter"
import { healthInputSchema } from "@/lib/api-schemas"
import type { HealthAnswer, HealthResult } from "@/types"

const HEALTH_SYSTEM_PROMPT = `
You are ArthMitra. Score the user's financial health from 0-100.
Respond ONLY in valid JSON.

Response schema:
{
  "overallScore": number,
  "grade": "A" | "B" | "C" | "D" | "F",
  "label": "Excellent" | "Good" | "Fair" | "Poor" | "Critical",
  "dimensions": {
    "emergencyFund": { "score": number, "feedback": string },
    "insurance": { "score": number, "feedback": string },
    "investments": { "score": number, "feedback": string },
    "debtHealth": { "score": number, "feedback": string },
    "taxEfficiency": { "score": number, "feedback": string },
    "retirement": { "score": number, "feedback": string }
  },
  "topPriorities": [
    { "priority": 1, "action": string, "impact": "high"|"medium"|"low", "timeframe": string }
  ],
  "summary": "2 sentence personalized summary"
}
`

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    uid: string
    userInputs: {
      answers: HealthAnswer[]
    }
  }
  const uid = body.uid || "anonymous"

  if (isRateLimited(uid)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
      }
    )
  }

  const parsed = healthInputSchema.safeParse(body?.userInputs)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inputs.", details: parsed.error.format() }, { status: 400 })
  }

  const cached = getCached<HealthResult>(parsed.data)
  if (cached) {
    return NextResponse.json({ result: cached, cached: true, timestamp: new Date().toISOString() })
  }

  let result: HealthResult

  try {
    result = await callGroqJSONWithRetry<HealthResult>({
      systemPrompt: HEALTH_SYSTEM_PROMPT,
      payload: parsed.data,
      maxRetries: 2,
    })
    setCache(parsed.data, result)
  } catch (error) {
    console.error("Health API Error:", error)
    result = buildHealthFallback(parsed.data.answers as unknown as HealthAnswer[])
  }

  return NextResponse.json({
    result,
    timestamp: new Date().toISOString(),
  })
}
