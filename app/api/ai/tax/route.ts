import { NextRequest, NextResponse } from "next/server"
import { buildTaxFallback } from "@/lib/ai-fallbacks"
import { callGroqJSONWithRetry } from "@/lib/groq"
import { getCached, setCache } from "@/lib/api-cache"
import { isRateLimited } from "@/lib/rate-limiter"
import { taxInputSchema } from "@/lib/api-schemas"
import type { TaxRequestBody, TaxResult } from "@/types"

const TAX_SYSTEM_PROMPT = `
You are ArthMitra, an expert Indian tax advisor for FY 2024-25.
Respond ONLY in valid JSON. Apply exact Indian tax slabs.

Old Regime slabs: 0-2.5L=0%, 2.5-5L=5%, 5-10L=20%, >10L=30%
New Regime slabs (2024): 0-3L=0%, 3-7L=5%, 7-10L=10%, 10-12L=15%, 12-15L=20%, >15L=30%
Standard deduction: Old=50000, New=75000
Add 4% health & education cess on tax.

Response schema:
{
  "oldRegime": {
    "grossIncome": number,
    "totalDeductions": number,
    "taxableIncome": number,
    "taxBeforeCess": number,
    "cess": number,
    "totalTax": number,
    "effectiveRate": number
  },
  "newRegime": { "grossIncome": number, "totalDeductions": number, "taxableIncome": number, "taxBeforeCess": number, "cess": number, "totalTax": number, "effectiveRate": number },
  "betterRegime": "old" | "new",
  "taxSaving": number,
  "missedDeductions": [
    {
      "section": "80CCD(1B)",
      "description": "NPS investment",
      "maxAmount": 50000,
      "estimatedTaxSaving": number,
      "action": "what to do"
    }
  ],
  "totalPotentialSaving": number
}
`

export async function POST(request: NextRequest) {
  const body = (await request.json()) as TaxRequestBody & { uid?: string }
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

  const parsed = taxInputSchema.safeParse(body?.userInputs)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inputs.", details: parsed.error.format() }, { status: 400 })
  }

  const cached = getCached<TaxResult>(parsed.data)
  if (cached) {
    return NextResponse.json({ result: cached, cached: true, timestamp: new Date().toISOString() })
  }

  let result: TaxResult

  try {
    result = await callGroqJSONWithRetry<TaxResult>({
      systemPrompt: TAX_SYSTEM_PROMPT,
      payload: parsed.data,
      maxRetries: 2,
    })
    setCache(parsed.data, result)
  } catch (error) {
    console.error("Tax API Error:", error)
    result = buildTaxFallback(parsed.data as TaxRequestBody["userInputs"])
  }

  return NextResponse.json({
    result,
    timestamp: new Date().toISOString(),
  })
}
