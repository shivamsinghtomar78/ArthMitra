import { NextRequest, NextResponse } from "next/server"
import { callGroqJSONWithRetry } from "@/lib/groq"
import { getCached, setCache } from "@/lib/api-cache"
import { isRateLimited } from "@/lib/rate-limiter"
import { lifeEventInputSchema } from "@/lib/api-schemas"
import type { LifeEventResult } from "@/types"

const LIFE_EVENT_PROMPT = `
You are ArthMitra, an expert Indian financial advisor specializing in life-event-triggered financial decisions.
Respond ONLY in valid JSON. All monetary values in Indian Rupees.

The user is experiencing a life event. Analyze their situation and provide:
1. Immediate financial actions ranked by priority
2. Tax implications specific to this event
3. Portfolio rebalancing recommendations
4. A month-by-month timeline of financial moves

Response schema:
{
  "event": string,
  "eventAmount": number,
  "immediateActions": [
    {
      "title": string,
      "description": string,
      "priority": "immediate" | "within_3_months" | "within_6_months",
      "amount": number (optional)
    }
  ],
  "taxImplications": ["string"],
  "portfolioChanges": [
    { "asset": string, "currentAllocation": number, "recommendedAllocation": number }
  ],
  "timeline": [
    { "month": "Month 1", "action": string }
  ],
  "narrative": "2-3 sentence personalized summary",
  "warnings": ["string"]
}
`

function buildLifeEventFallback(data: { event: string; amount: number }): LifeEventResult {
  return {
    event: data.event as LifeEventResult["event"],
    eventAmount: data.amount,
    immediateActions: [
      { title: "Park in liquid fund", description: "Move the lump sum into a liquid mutual fund while you plan.", priority: "immediate", amount: data.amount },
      { title: "Review emergency fund", description: "Ensure you have 6 months of expenses covered before investing.", priority: "immediate" },
      { title: "Consult a tax advisor", description: "Understand the tax implications of this event before making moves.", priority: "within_3_months" },
      { title: "Rebalance portfolio", description: "Adjust your asset allocation based on your updated financial picture.", priority: "within_6_months" },
    ],
    taxImplications: ["Consult a CA for event-specific tax implications.", "Consider Section 54/54F exemptions if applicable."],
    portfolioChanges: [
      { asset: "Equity", currentAllocation: 60, recommendedAllocation: 50 },
      { asset: "Debt", currentAllocation: 30, recommendedAllocation: 35 },
      { asset: "Gold/Cash", currentAllocation: 10, recommendedAllocation: 15 },
    ],
    timeline: [
      { month: "Month 1", action: "Park funds in liquid fund and assess situation." },
      { month: "Month 2-3", action: "Start SIPs in recommended allocation." },
      { month: "Month 4-6", action: "Complete rebalancing and review insurance." },
    ],
    narrative: "This is a mathematical fallback. AI-powered analysis was unavailable.",
    warnings: ["AI analysis unavailable. Displaying generic fallback advice."],
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { uid?: string; userInputs: unknown }
  const uid = body.uid || "anonymous"

  if (isRateLimited(uid)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" } }
    )
  }

  const parsed = lifeEventInputSchema.safeParse(body?.userInputs)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inputs.", details: parsed.error.format() }, { status: 400 })
  }

  const cached = getCached<LifeEventResult>(parsed.data)
  if (cached) {
    return NextResponse.json({ result: cached, cached: true, timestamp: new Date().toISOString() })
  }

  let result: LifeEventResult

  try {
    result = await callGroqJSONWithRetry<LifeEventResult>({
      systemPrompt: LIFE_EVENT_PROMPT,
      payload: parsed.data,
      maxRetries: 2,
    })
    setCache(parsed.data, result)
  } catch (error) {
    console.error("Life Event API Error:", error)
    result = buildLifeEventFallback(parsed.data)
  }

  return NextResponse.json({ result, timestamp: new Date().toISOString() })
}
