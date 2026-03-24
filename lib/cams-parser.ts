import type { ManualFundEntry } from "@/types"

function parseAmount(value?: string | null) {
  if (!value) {
    return 0
  }

  return Number(value.replace(/[^\d.]/g, "")) || 0
}

function inferCategory(name: string) {
  const text = name.toLowerCase()

  if (text.includes("index") || text.includes("nifty")) return "Index"
  if (text.includes("international")) return "International"
  if (text.includes("small")) return "Small Cap"
  if (text.includes("mid")) return "Mid Cap"
  if (text.includes("debt") || text.includes("liquid") || text.includes("bond")) return "Hybrid / Debt"
  if (text.includes("flexi") || text.includes("multi")) return "Flexi Cap"
  return "Large Cap"
}

function cleanFundName(line: string) {
  return line
    .replace(/\s+/g, " ")
    .replace(/folio.*$/i, "")
    .replace(/isin.*$/i, "")
    .replace(/advisor.*$/i, "")
    .trim()
}

function isFundLine(line: string) {
  const text = line.trim().toLowerCase()

  if (!text || text.length < 10) {
    return false
  }

  if (!/(fund|etf)/.test(text)) {
    return false
  }

  if (
    /(statement|summary|mutual fund|folio|registrar|email|mobile|phone|advisor|distributor|broker|address|pan|scheme code|closing unit balance|opening unit balance|cost value|market value|valuation|transaction|dividend|redemption|switch|purchase|cams|consolidated account|page \d+)/.test(
      text
    )
  ) {
    return false
  }

  return true
}

function extractFundFromBlock(name: string, block: string): ManualFundEntry | null {
  const normalized = block.replace(/\s+/g, " ")
  const currentValue =
    parseAmount(
      normalized.match(
        /(?:valuation|market value|current value|value of investment|current valuation|market valuation)(?:\s*\(rs\.?\))?\s*[:\-]?\s*([\d,]+(?:\.\d+)?)/i
      )?.[1]
    ) ||
    (() => {
      const nav = parseAmount(normalized.match(/nav(?: on [^:]+)?\s*[:\-]?\s*([\d,]+(?:\.\d+)?)/i)?.[1])
      const units = parseAmount(
        normalized.match(/closing unit balance\s*[:\-]?\s*([\d,]+(?:\.\d+)?)/i)?.[1]
      )
      return nav && units ? nav * units : 0
    })()

  const amountInvested =
    parseAmount(
      normalized.match(
        /(?:cost value|invested amount|purchase value|book value)(?:\s*\(rs\.?\))?\s*[:\-]?\s*([\d,]+(?:\.\d+)?)/i
      )?.[1]
    ) || 0

  const detectedAmounts = Array.from(normalized.matchAll(/\b\d[\d,]{3,}(?:\.\d+)?\b/g))
    .map((match) => parseAmount(match[0]))
    .filter((value) => value > 1_000)
    .sort((a, b) => b - a)

  const fallbackCurrentValue = currentValue || detectedAmounts[0] || 0
  const fallbackInvested =
    amountInvested ||
    detectedAmounts.find((value) => value < fallbackCurrentValue) ||
    Math.round(fallbackCurrentValue * 0.82)

  if (!fallbackCurrentValue) {
    return null
  }

  return {
    name: cleanFundName(name),
    category: inferCategory(name),
    amountInvested: Math.round(fallbackInvested),
    currentValue: Math.round(fallbackCurrentValue),
  }
}

export function parseCamsStatementText(text: string): ManualFundEntry[] {
  const lines = text
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)

  const funds = new Map<string, ManualFundEntry>()

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (!isFundLine(line)) {
      continue
    }

    const block = lines.slice(index, index + 18).join("\n")
    const extracted = extractFundFromBlock(line, block)

    if (!extracted) {
      continue
    }

    const existing = funds.get(extracted.name)

    if (existing) {
      existing.amountInvested += extracted.amountInvested
      existing.currentValue += extracted.currentValue
      continue
    }

    funds.set(extracted.name, extracted)
  }

  return Array.from(funds.values())
}
