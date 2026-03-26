import { NextRequest, NextResponse } from "next/server"
import { buildMfXrayFallback } from "@/lib/ai-fallbacks"
import { parseCamsStatementText } from "@/lib/cams-parser"
import { callGroqJSONWithRetry } from "@/lib/groq"
import { getCached, setCache } from "@/lib/api-cache"
import { isRateLimited } from "@/lib/rate-limiter"
import { mfXrayInputSchema } from "@/lib/api-schemas"
import type { ManualFundEntry, MFXrayResult } from "@/types"

const MF_XRAY_PROMPT = `
You are ArthMitra, an expert mutual fund analyst focused on Indian portfolios.
Respond ONLY in valid JSON.

Response schema:
{
  "totalInvested": number,
  "currentValue": number,
  "xirr": number,
  "fundsHeld": number,
  "overlapMatrix": [
    {
      "source": string,
      "values": [{ "target": string, "overlap": number }]
    }
  ],
  "allocation": [
    { "name": string, "actual": number, "recommended": number }
  ],
  "expenseRatios": [
    { "fund": string, "ratio": number }
  ],
  "warning": string,
  "recommendations": [string],
  "projectedImprovement": number
}
`

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    uid: string
    userInputs: {
      funds: ManualFundEntry[]
      statementName?: string
      statementText?: string
    }
  }
  const uid = body.uid || "anonymous"

  if (isRateLimited(uid)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  const parsedFunds =
    body?.userInputs?.funds?.length
      ? body.userInputs.funds
      : body?.userInputs?.statementText
        ? parseCamsStatementText(body.userInputs.statementText)
        : []

  const payloadToValidate = {
    funds: parsedFunds,
    statementName: body?.userInputs?.statementName,
  }

  const parsed = mfXrayInputSchema.safeParse(payloadToValidate)
  if (!parsed.success || parsed.data.funds.length === 0) {
    return NextResponse.json({ error: "Missing or invalid portfolio data." }, { status: 400 })
  }

  const cached = getCached<MFXrayResult>(parsed.data)
  if (cached) {
    return NextResponse.json({ result: cached, cached: true, timestamp: new Date().toISOString() })
  }

  let result: MFXrayResult

  try {
    result = await callGroqJSONWithRetry<MFXrayResult>({
      systemPrompt: MF_XRAY_PROMPT,
      payload: parsed.data,
      maxRetries: 2,
    })
    setCache(parsed.data, result)
  } catch (error) {
    console.error("MF X-Ray API Error:", error)
    result = buildMfXrayFallback(parsed.data.funds as ManualFundEntry[])
  }

  return NextResponse.json({
    result,
    timestamp: new Date().toISOString(),
  })
}
