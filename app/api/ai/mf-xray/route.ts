import { NextRequest, NextResponse } from "next/server"
import { buildMfXrayFallback } from "@/lib/ai-fallbacks"
import { parseCamsStatementText } from "@/lib/cams-parser"
import { callGroqJSON } from "@/lib/groq"
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

  const parsedFunds =
    body?.userInputs?.funds?.length
      ? body.userInputs.funds
      : body?.userInputs?.statementText
        ? parseCamsStatementText(body.userInputs.statementText)
        : []

  if (!parsedFunds.length) {
    return NextResponse.json({ error: "Missing portfolio data." }, { status: 400 })
  }

  let result: MFXrayResult

  try {
    result = await callGroqJSON<MFXrayResult>({
      systemPrompt: MF_XRAY_PROMPT,
      payload: {
        funds: parsedFunds,
        statementName: body.userInputs.statementName,
      },
    })
  } catch {
    result = buildMfXrayFallback(parsedFunds)
  }

  return NextResponse.json({
    result,
    timestamp: new Date().toISOString(),
  })
}
