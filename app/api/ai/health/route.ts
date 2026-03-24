import { NextRequest, NextResponse } from "next/server"
import { buildHealthFallback } from "@/lib/ai-fallbacks"
import { callGroqJSON } from "@/lib/groq"
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

  if (!body?.userInputs?.answers?.length) {
    return NextResponse.json({ error: "Missing health answers." }, { status: 400 })
  }

  let result: HealthResult

  try {
    result = await callGroqJSON<HealthResult>({
      systemPrompt: HEALTH_SYSTEM_PROMPT,
      payload: body.userInputs,
    })
  } catch {
    result = buildHealthFallback(body.userInputs.answers)
  }

  return NextResponse.json({
    result,
    timestamp: new Date().toISOString(),
  })
}
