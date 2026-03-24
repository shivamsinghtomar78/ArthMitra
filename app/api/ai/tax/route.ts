import { NextRequest, NextResponse } from "next/server"
import { buildTaxFallback } from "@/lib/ai-fallbacks"
import { callGroqJSON } from "@/lib/groq"
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
  const body = (await request.json()) as TaxRequestBody

  if (!body?.userInputs) {
    return NextResponse.json({ error: "Missing tax inputs." }, { status: 400 })
  }

  let result: TaxResult

  try {
    result = await callGroqJSON<TaxResult>({
      systemPrompt: TAX_SYSTEM_PROMPT,
      payload: body.userInputs,
    })
  } catch {
    result = buildTaxFallback(body.userInputs)
  }

  return NextResponse.json({
    result,
    timestamp: new Date().toISOString(),
  })
}
