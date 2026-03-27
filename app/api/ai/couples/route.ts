import { NextRequest, NextResponse } from "next/server"
import { callGroqJSONWithRetry } from "@/lib/groq"
import { getCached, setCache } from "@/lib/api-cache"
import { isRateLimited } from "@/lib/rate-limiter"
import { couplesInputSchema } from "@/lib/api-schemas"
import type { CouplesResult } from "@/types"

const COUPLES_PROMPT = `
You are ArthMitra, India's first AI-powered joint financial planning advisor for couples.
Respond ONLY in valid JSON. All monetary values in Indian Rupees.

Optimize across both partners' incomes for: HRA claims, NPS matching, SIP splits for tax efficiency,
joint vs individual insurance, and combined net worth tracking.

Response schema:
{
  "partner1": {
    "name": string,
    "income": number,
    "effectiveTaxRate": number,
    "recommendedSIP": number,
    "npsOptimal": number,
    "hraBenefit": number
  },
  "partner2": {
    "name": string,
    "income": number,
    "effectiveTaxRate": number,
    "recommendedSIP": number,
    "npsOptimal": number,
    "hraBenefit": number
  },
  "combinedNetWorth": number,
  "combinedMonthlyInvestment": number,
  "optimizedSplits": [
    {
      "category": string,
      "partner1Share": number,
      "partner2Share": number,
      "reason": string
    }
  ],
  "insuranceRecommendations": [
    {
      "type": string,
      "holder": "partner1" | "partner2" | "both",
      "coverAmount": number,
      "reason": string
    }
  ],
  "recommendations": ["string"],
  "narrative": "2-3 sentence personalized summary"
}
`

function buildCouplesFallback(data: {
  partner1: { name: string; monthlyIncome: number }
  partner2: { name: string; monthlyIncome: number }
}): CouplesResult {
  const p1Income = data.partner1.monthlyIncome
  const p2Income = data.partner2.monthlyIncome
  const total = p1Income + p2Income
  const p1Share = total > 0 ? Math.round((p1Income / total) * 100) : 50
  const p2Share = 100 - p1Share

  return {
    partner1: {
      name: data.partner1.name || "Partner 1",
      income: p1Income,
      effectiveTaxRate: p1Income > 83333 ? 30 : p1Income > 41666 ? 20 : 5,
      recommendedSIP: Math.round(p1Income * 0.25),
      npsOptimal: Math.min(50000, Math.round(p1Income * 0.1)),
      hraBenefit: 0,
    },
    partner2: {
      name: data.partner2.name || "Partner 2",
      income: p2Income,
      effectiveTaxRate: p2Income > 83333 ? 30 : p2Income > 41666 ? 20 : 5,
      recommendedSIP: Math.round(p2Income * 0.25),
      npsOptimal: Math.min(50000, Math.round(p2Income * 0.1)),
      hraBenefit: 0,
    },
    combinedNetWorth: (p1Income + p2Income) * 12,
    combinedMonthlyInvestment: Math.round(total * 0.3),
    optimizedSplits: [
      { category: "Equity SIPs", partner1Share: p1Share, partner2Share: p2Share, reason: "Split proportional to income for tax efficiency." },
      { category: "Debt/FD", partner1Share: p2Share, partner2Share: p1Share, reason: "Lower income partner holds debt for lower tax on interest." },
      { category: "NPS", partner1Share: 50, partner2Share: 50, reason: "Both should maximize 80CCD(1B) deduction of ₹50,000." },
    ],
    insuranceRecommendations: [
      { type: "Term Life", holder: "both", coverAmount: total * 120, reason: "10x annual income each." },
      { type: "Health Insurance", holder: "both", coverAmount: 1000000, reason: "₹10L family floater minimum." },
    ],
    recommendations: [
      "Split SIPs proportional to income for maximum tax efficiency.",
      "Both partners should maximize NPS ₹50,000 deduction.",
      "Get a joint health insurance floater of ₹10L+.",
    ],
    narrative: "This is a mathematical fallback. AI-powered optimization was unavailable.",
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

  const parsed = couplesInputSchema.safeParse(body?.userInputs)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inputs.", details: parsed.error.format() }, { status: 400 })
  }

  const cached = getCached<CouplesResult>(parsed.data)
  if (cached) {
    return NextResponse.json({ result: cached, cached: true, timestamp: new Date().toISOString() })
  }

  let result: CouplesResult

  try {
    result = await callGroqJSONWithRetry<CouplesResult>({
      systemPrompt: COUPLES_PROMPT,
      payload: parsed.data,
      maxRetries: 2,
    })
    setCache(parsed.data, result)
  } catch (error) {
    console.error("Couples Planner API Error:", error)
    result = buildCouplesFallback(parsed.data)
  }

  return NextResponse.json({ result, timestamp: new Date().toISOString() })
}
