import { NextRequest, NextResponse } from "next/server"
import { buildFireFallback } from "@/lib/ai-fallbacks"
import { callGroqJSON } from "@/lib/groq"
import type { FireRequestBody, FireResult } from "@/types"

const FIRE_SYSTEM_PROMPT = `
You are ArthMitra, an expert Indian financial advisor.
You must respond ONLY in valid JSON format. No markdown, no explanation outside JSON.
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
  "actionSteps": ["step1", "step2", "step3", "step4"],
  "narrative": "2-3 sentence plain English explanation",
  "warnings": ["any risk warnings"]
}
`

async function generateWithRetry(userInputs: FireRequestBody["userInputs"]) {
  try {
    return await callGroqJSON<FireResult>({
      systemPrompt: FIRE_SYSTEM_PROMPT,
      payload: userInputs,
    })
  } catch {
    return await callGroqJSON<FireResult>({
      systemPrompt: FIRE_SYSTEM_PROMPT,
      payload: userInputs,
    })
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as FireRequestBody

  if (!body?.userInputs) {
    return NextResponse.json({ error: "Missing FIRE inputs." }, { status: 400 })
  }

  let result: FireResult

  try {
    result = await generateWithRetry(body.userInputs)
  } catch {
    result = buildFireFallback(body.userInputs)
    result.warnings = [
      ...result.warnings,
      "AI response unavailable, so ArthMitra used its built-in FIRE calculator.",
    ]
  }

  return NextResponse.json({
    result,
    timestamp: new Date().toISOString(),
  })
}
