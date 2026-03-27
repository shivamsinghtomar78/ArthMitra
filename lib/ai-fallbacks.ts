import type {
  FireRequestBody,
  FireResult,
  HealthAnswer,
  HealthResult,
  ManualFundEntry,
  MFXrayResult,
  TaxBreakdown,
  TaxResult,
  TaxUserInputs,
} from "@/types"
import {
  calculateNewRegimeTax,
  calculateOldRegimeTax,
  calculateRequiredSIP,
  calculateSIPCorpus,
} from "@/lib/utils"

function round(value: number) {
  return Math.round(value)
}

function roundTo(value: number, digits = 1) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function buildTaxBreakdown(
  grossIncome: number,
  totalDeductions: number,
  totalTax: number
): TaxBreakdown {
  const taxableIncome = Math.max(0, grossIncome - totalDeductions)
  const taxBeforeCess = totalTax / 1.04
  const cess = totalTax - taxBeforeCess

  return {
    grossIncome: round(grossIncome),
    totalDeductions: round(totalDeductions),
    taxableIncome: round(taxableIncome),
    taxBeforeCess: round(taxBeforeCess),
    cess: round(cess),
    totalTax: round(totalTax),
    effectiveRate: grossIncome > 0 ? roundTo((totalTax / grossIncome) * 100, 1) : 0,
  }
}

export function buildFireFallback(input: FireRequestBody["userInputs"]): FireResult {
  const currentSurplus = Math.max(0, input.monthlyIncome - input.monthlyExpenses)
  const expectedYears = Math.max(1, input.targetRetireAge - input.currentAge)
  const annualExpenses = input.monthlyExpenses * 12
  const corpusNeeded =
    annualExpenses * 25 * (1 + input.inflationRate / 100) ** expectedYears
  const currentSavingsFuture =
    input.currentSavings * (1 + input.expectedReturns / 100) ** expectedYears
  const targetFromSip = Math.max(0, corpusNeeded - currentSavingsFuture)
  const recommendedMonthlySIP = round(
    calculateRequiredSIP(targetFromSip, expectedYears, input.expectedReturns)
  )

  function estimateRetirementAge(monthlyContribution: number) {
    for (let years = 1; years <= 35; years += 1) {
      const targetCorpus =
        annualExpenses * 25 * (1 + input.inflationRate / 100) ** years
      const futureValue =
        input.currentSavings * (1 + input.expectedReturns / 100) ** years +
        calculateSIPCorpus(monthlyContribution, years, input.expectedReturns)

      if (futureValue >= targetCorpus) {
        return input.currentAge + years
      }
    }

    return input.targetRetireAge + 3
  }

  const canRetireAtAge = estimateRetirementAge(currentSurplus)
  const yearsToFIRE = Math.max(1, canRetireAtAge - input.currentAge)
  const sipGap = Math.max(0, recommendedMonthlySIP - currentSurplus)

  const yearlyProjections = Array.from({ length: 20 }, (_, index) => {
    const yearOffset = index + 1
    return {
      year: new Date().getFullYear() + index,
      corpus: round(
        input.currentSavings * (1 + input.expectedReturns / 100) ** yearOffset +
          calculateSIPCorpus(recommendedMonthlySIP, yearOffset, input.expectedReturns)
      ),
      baselineCorpus: round(
        input.currentSavings * (1 + input.expectedReturns / 100) ** yearOffset +
          calculateSIPCorpus(Math.max(currentSurplus * 0.45, 0), yearOffset, input.expectedReturns)
      ),
    }
  })

  return {
    canRetireAtAge,
    yearsToFIRE,
    corpusNeeded: round(corpusNeeded),
    recommendedMonthlySIP,
    currentSurplus: round(currentSurplus),
    sipGap: round(sipGap),
    assetAllocation: {
      largeCap: 40,
      midCap: 25,
      debt: 20,
      gold: 10,
      emergency: 5,
    },
    yearlyProjections,
    actionSteps: [
      `Start a monthly SIP of ₹${recommendedMonthlySIP.toLocaleString("en-IN")} immediately.`,
      `Keep at least ₹${Math.round(input.monthlyExpenses * 6).toLocaleString("en-IN")} in an emergency bucket.`,
      "Increase your SIP by 10% every April when income grows.",
      "Review the plan every 6 months and rebalance if your expenses change materially.",
    ],
    narrative:
      sipGap > 0
        ? `Based on your current surplus, you need to increase monthly investing by about ₹${sipGap.toLocaleString(
            "en-IN"
          )} to stay on track for your target. The plan below shows the SIP required to build your inflation-adjusted retirement corpus.`
        : `Your current surplus is strong enough to support your target timeline. Staying disciplined with the recommended SIP can help you retire around age ${canRetireAtAge}.`,
    warnings:
      currentSurplus <= 0
        ? ["Your monthly expenses are too close to income. Increase surplus before relying on this plan."]
        : sipGap > 0
          ? ["Your current surplus is below the required SIP. You may need to trim expenses or delay retirement slightly."]
          : [],
  }
}

function estimateMarginalRate(income: number) {
  if (income > 10_00_000) return 0.3
  if (income > 5_00_000) return 0.2
  if (income > 2_50_000) return 0.05
  return 0
}

export function buildTaxFallback(input: TaxUserInputs): TaxResult {
  const annualCTC = Number(input.annualCTC || 0)
  const hraReceivedMonthly = Number(input.hraReceivedMonthly || 0)
  const bonus = Number(input.bonusAnnual || 0)
  const basicSalaryPercent = Number(input.basicSalaryPercent || 40)
  const cityType = String(input.cityType || "metro")
  const claimsHra = Boolean(input.hraClaimed)
  const ageBracket = String(input.ageBracket || "<60")

  const grossIncome = annualCTC + bonus
  const basicSalary = annualCTC * (basicSalaryPercent / 100)
  const hraReceived = hraReceivedMonthly * 12
  const estimatedHraExemption = claimsHra
    ? Math.min(hraReceived, basicSalary * (cityType === "metro" ? 0.3 : 0.24))
    : 0

  const eightyCCap = Math.min(Number(input.eightyC || 0), 1_50_000)
  const npsCap = Math.min(Number(input.npsContribution || 0), 50_000)
  const homeLoanCap = Math.min(Number(input.homeLoanInterest || 0), 2_00_000)
  const medicalCap = Math.min(
    Number(input.medicalInsurance || 0),
    ageBracket === "<60" ? 25_000 : 50_000
  )
  const educationLoan = Number(input.educationLoan || 0)

  const oldDeductions =
    50_000 + eightyCCap + npsCap + homeLoanCap + medicalCap + educationLoan + estimatedHraExemption
  const newDeductions = 75_000

  const oldTotalTax = calculateOldRegimeTax(grossIncome, {
    standardDeduction: 0,
    eightyC: eightyCCap,
    nps: npsCap,
    homeLoan: homeLoanCap,
    medical: medicalCap,
    educationLoan,
    hra: estimatedHraExemption,
  })
  const newTotalTax = calculateNewRegimeTax(grossIncome)
  const betterRegime = oldTotalTax <= newTotalTax ? "old" : "new"
  const taxSaving = round(Math.abs(oldTotalTax - newTotalTax))
  const marginalRate = estimateMarginalRate(Math.max(0, grossIncome - oldDeductions))

  const missedDeductions = [
    npsCap < 50_000
      ? {
          section: "80CCD(1B)",
          description: "NPS investment",
          maxAmount: 50_000,
          estimatedTaxSaving: round((50_000 - npsCap) * marginalRate * 1.04),
          action: "Use the additional NPS limit to reduce your old-regime taxable income.",
        }
      : null,
    medicalCap < (ageBracket === "<60" ? 25_000 : 50_000)
      ? {
          section: "80D",
          description: "Medical insurance",
          maxAmount: ageBracket === "<60" ? 25_000 : 50_000,
          estimatedTaxSaving: round(
            ((ageBracket === "<60" ? 25_000 : 50_000) - medicalCap) * marginalRate * 1.04
          ),
          action: "Use your health insurance premium to claim the remaining 80D deduction.",
        }
      : null,
    !claimsHra && hraReceived > 0
      ? {
          section: "HRA",
          description: "House rent allowance",
          maxAmount: round(Math.min(hraReceived, basicSalary * 0.3)),
          estimatedTaxSaving: round(Math.min(hraReceived, basicSalary * 0.3) * marginalRate * 1.04),
          action: "If you pay rent, claim HRA with rent receipts to reduce taxable income.",
        }
      : null,
  ].filter(Boolean) as TaxResult["missedDeductions"]

  return {
    oldRegime: buildTaxBreakdown(grossIncome, oldDeductions, oldTotalTax),
    newRegime: buildTaxBreakdown(grossIncome, newDeductions, newTotalTax),
    betterRegime,
    taxSaving,
    missedDeductions,
    totalPotentialSaving: round(
      missedDeductions.reduce((sum, item) => sum + item.estimatedTaxSaving, 0)
    ),
  }
}

function getScoreLabel(score: number) {
  if (score >= 85) return { grade: "A", label: "Excellent" }
  if (score >= 75) return { grade: "B", label: "Good" }
  if (score >= 60) return { grade: "C", label: "Fair" }
  if (score >= 40) return { grade: "D", label: "Poor" }
  return { grade: "F", label: "Critical" }
}

function dimensionFeedback(name: string, score: number) {
  if (score >= 75) return `${name} is in good shape. Keep this discipline in place.`
  if (score >= 55) return `${name} is workable, but there is a visible gap to close.`
  return `${name} needs attention soon to avoid becoming a larger drag on your finances.`
}

const healthPriorityMap: Record<string, { action: string; timeframe: string }> = {
  emergencyFund: {
    action: "Build your emergency fund to 6 months of expenses.",
    timeframe: "Next 90 days",
  },
  insurance: {
    action: "Review and strengthen life and health insurance coverage.",
    timeframe: "This month",
  },
  investments: {
    action: "Diversify your investment mix and automate monthly contributions.",
    timeframe: "Next 30 days",
  },
  debtHealth: {
    action: "Reduce revolving debt and keep credit utilisation low.",
    timeframe: "Immediate",
  },
  taxEfficiency: {
    action: "Use 80C, 80D, and NPS deductions more efficiently.",
    timeframe: "Before year-end",
  },
  retirement: {
    action: "Increase your long-term retirement SIP and review the FIRE plan.",
    timeframe: "This quarter",
  },
}

export function buildHealthFallback(answers: HealthAnswer[]): HealthResult {
  const grouped = answers.reduce<Record<string, number[]>>((accumulator, answer) => {
    accumulator[answer.dimension] ||= []
    accumulator[answer.dimension].push(answer.score)
    return accumulator
  }, {})

  const dimensions = {
    emergencyFund: {
      score: round(((grouped.emergencyFund || [2]).reduce((a, b) => a + b, 0) / (grouped.emergencyFund || [2]).length) * 25),
      feedback: "",
    },
    insurance: {
      score: round(((grouped.insurance || [2]).reduce((a, b) => a + b, 0) / (grouped.insurance || [2]).length) * 25),
      feedback: "",
    },
    investments: {
      score: round(((grouped.investments || [2]).reduce((a, b) => a + b, 0) / (grouped.investments || [2]).length) * 25),
      feedback: "",
    },
    debtHealth: {
      score: round(((grouped.debtHealth || [2]).reduce((a, b) => a + b, 0) / (grouped.debtHealth || [2]).length) * 25),
      feedback: "",
    },
    taxEfficiency: {
      score: round(((grouped.taxEfficiency || [2]).reduce((a, b) => a + b, 0) / (grouped.taxEfficiency || [2]).length) * 25),
      feedback: "",
    },
    retirement: {
      score: round(((grouped.retirement || [2]).reduce((a, b) => a + b, 0) / (grouped.retirement || [2]).length) * 25),
      feedback: "",
    },
  }

  dimensions.emergencyFund.feedback = dimensionFeedback("Emergency preparedness", dimensions.emergencyFund.score)
  dimensions.insurance.feedback = dimensionFeedback("Insurance coverage", dimensions.insurance.score)
  dimensions.investments.feedback = dimensionFeedback("Investment diversification", dimensions.investments.score)
  dimensions.debtHealth.feedback = dimensionFeedback("Debt health", dimensions.debtHealth.score)
  dimensions.taxEfficiency.feedback = dimensionFeedback("Tax efficiency", dimensions.taxEfficiency.score)
  dimensions.retirement.feedback = dimensionFeedback("Retirement readiness", dimensions.retirement.score)

  const dimensionEntries = Object.entries(dimensions)
  const overallScore = round(
    dimensionEntries.reduce((sum, [, value]) => sum + value.score, 0) / dimensionEntries.length
  )
  const scoreLabel = getScoreLabel(overallScore)

  const topPriorities = dimensionEntries
    .sort((a, b) => a[1].score - b[1].score)
    .slice(0, 3)
    .map(([key, value], index) => ({
      priority: index + 1,
      action: healthPriorityMap[key].action,
      impact: value.score < 50 ? "high" : value.score < 70 ? "medium" : "low",
      timeframe: healthPriorityMap[key].timeframe,
    })) as HealthResult["topPriorities"]

  return {
    overallScore,
    grade: scoreLabel.grade as HealthResult["grade"],
    label: scoreLabel.label as HealthResult["label"],
    dimensions,
    topPriorities,
    summary: `Your current financial health is rated ${scoreLabel.label.toLowerCase()}. Focus first on ${topPriorities[0]?.action.toLowerCase()} to improve the weakest part of your plan.`,
  }
}

function inferExpenseRatio(fund: ManualFundEntry) {
  const text = `${fund.name} ${fund.category}`.toLowerCase()
  if (text.includes("index") || text.includes("nifty")) return 0.15
  if (text.includes("small")) return 1.2
  if (text.includes("mid")) return 0.95
  if (text.includes("flexi") || text.includes("multi")) return 0.85
  if (text.includes("international")) return 0.8
  if (text.includes("debt") || text.includes("liquid")) return 0.35
  return 0.9
}

function pairOverlap(a: ManualFundEntry, b: ManualFundEntry) {
  const aText = `${a.name} ${a.category}`.toLowerCase()
  const bText = `${b.name} ${b.category}`.toLowerCase()

  if (a.name === b.name) return 0
  if (aText.includes("international") || bText.includes("international")) return 10
  if (aText.includes("debt") || bText.includes("debt")) return 8
  if (a.category === b.category) return 46
  if ((aText.includes("large") && bText.includes("flexi")) || (bText.includes("large") && aText.includes("flexi"))) return 38
  if ((aText.includes("mid") && bText.includes("small")) || (bText.includes("mid") && aText.includes("small"))) return 24
  if (aText.includes("large") && bText.includes("large")) return 41
  return 18
}

function bucketForFund(fund: ManualFundEntry) {
  const text = `${fund.name} ${fund.category}`.toLowerCase()
  if (text.includes("debt") || text.includes("liquid")) return "Debt / Hybrid"
  if (text.includes("gold") || text.includes("international")) return "Gold / International"
  if (text.includes("small")) return "Mid / Small Cap"
  if (text.includes("mid")) return "Mid / Small Cap"
  return "Large / Flexi Cap"
}

export function buildMfXrayFallback(funds: ManualFundEntry[]): MFXrayResult {
  const normalizedFunds = funds.filter((fund) => fund.name.trim())
  const totalInvested = normalizedFunds.reduce((sum, fund) => sum + fund.amountInvested, 0)
  const currentValue = normalizedFunds.reduce((sum, fund) => sum + fund.currentValue, 0)
  const xirr =
    totalInvested > 0 ? roundTo((((currentValue || totalInvested) / totalInvested) ** (1 / 3) - 1) * 100, 1) : 0

  const overlapMatrix = normalizedFunds.map((source) => ({
    source: source.name,
    values: normalizedFunds.map((target) => ({
      target: target.name,
      overlap: source.name === target.name ? 0 : pairOverlap(source, target),
    })),
  }))

  const allocationBuckets = normalizedFunds.reduce<Record<string, number>>((accumulator, fund) => {
    const bucket = bucketForFund(fund)
    accumulator[bucket] = (accumulator[bucket] || 0) + fund.currentValue
    return accumulator
  }, {})

  const totalAllocationValue = Object.values(allocationBuckets).reduce((sum, value) => sum + value, 0) || 1
  const recommendedMix: Record<string, number> = {
    "Large / Flexi Cap": 40,
    "Mid / Small Cap": 25,
    "Debt / Hybrid": 20,
    "Gold / International": 15,
  }

  const allocation = Object.entries(recommendedMix).map(([name, recommended]) => ({
    name,
    actual: roundTo(((allocationBuckets[name] || 0) / totalAllocationValue) * 100, 1),
    recommended,
  }))

  const expenseRatios = normalizedFunds.map((fund) => ({
    fund: fund.name,
    ratio: fund.expenseRatio ?? inferExpenseRatio(fund),
  }))

  const highestOverlap = overlapMatrix.flatMap((row) => row.values).sort((a, b) => b.overlap - a.overlap)[0]
  const mostExpensive = [...expenseRatios].sort((a, b) => b.ratio - a.ratio)[0]
  const projectedImprovement = roundTo(
    0.4 + (highestOverlap?.overlap || 0) / 100 + (mostExpensive?.ratio || 0) / 2,
    1
  )

  return {
    totalInvested: round(totalInvested),
    currentValue: round(currentValue),
    xirr,
    fundsHeld: normalizedFunds.length,
    overlapMatrix,
    allocation,
    expenseRatios,
    warning:
      highestOverlap && highestOverlap.overlap > 40
        ? `⚠ ${highestOverlap.target} has a high stock overlap with another fund at ${highestOverlap.overlap}%.`
        : "No major overlap warning detected from the current mix.",
    recommendations: [
      highestOverlap && highestOverlap.overlap > 40
        ? "Reduce duplicate large-cap exposure where two funds are holding similar top stocks."
        : "Keep your top holdings diversified across distinct categories.",
      mostExpensive && mostExpensive.ratio > 0.8
        ? `Consider replacing ${mostExpensive.fund} with a lower-cost alternative.`
        : "Your portfolio costs are fairly contained, but index exposure can still reduce drag.",
      allocation.find((item) => item.name === "Gold / International" && item.actual < 5)
        ? "Add a small international or gold allocation for better diversification."
        : "Review the allocation against your risk profile every 6 months.",
    ],
    projectedImprovement,
  }
}
