export type RiskProfile = "conservative" | "moderate" | "aggressive"

export type Occupation =
  | "Salaried"
  | "Self-employed"
  | "Business owner"
  | "Student"
  | "Other"

export interface UserProfile {
  name: string
  age: number
  city: string
  occupation: Occupation
  goals: string[]
  createdAt: string
  onboardingComplete: boolean
}

export interface UserFinancials {
  monthlyIncome: number
  monthlyExpense: number
  currentSavings: number
  existingInvestments: number
  loans: number
  riskProfile: RiskProfile
  retirementAge: number
}

export interface FireProjection {
  year: number
  corpus: number
  baselineCorpus?: number
}

export interface FireResult {
  canRetireAtAge: number
  yearsToFIRE: number
  corpusNeeded: number
  recommendedMonthlySIP: number
  currentSurplus: number
  sipGap: number
  assetAllocation: {
    largeCap: number
    midCap: number
    debt: number
    gold: number
    emergency: number
  }
  yearlyProjections: FireProjection[]
  actionSteps: string[]
  narrative: string
  warnings: string[]
  updatedAt?: string
}

export interface TaxBreakdown {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  taxBeforeCess: number
  cess: number
  totalTax: number
  effectiveRate: number
}

export interface MissedDeduction {
  section: string
  description: string
  maxAmount: number
  estimatedTaxSaving: number
  action: string
}

export interface TaxResult {
  oldRegime: TaxBreakdown
  newRegime: TaxBreakdown
  betterRegime: "old" | "new"
  taxSaving: number
  missedDeductions: MissedDeduction[]
  totalPotentialSaving: number
  updatedAt?: string
}

export interface HealthDimension {
  score: number
  feedback: string
}

export interface HealthResult {
  overallScore: number
  grade: "A" | "B" | "C" | "D" | "F"
  label: "Excellent" | "Good" | "Fair" | "Poor" | "Critical"
  dimensions: {
    emergencyFund: HealthDimension
    insurance: HealthDimension
    investments: HealthDimension
    debtHealth: HealthDimension
    taxEfficiency: HealthDimension
    retirement: HealthDimension
  }
  topPriorities: Array<{
    priority: number
    action: string
    impact: "high" | "medium" | "low"
    timeframe: string
  }>
  summary: string
  updatedAt?: string
}

export interface ManualFundEntry {
  name: string
  category: string
  amountInvested: number
  currentValue: number
  expenseRatio?: number
}

export interface MFXrayResult {
  totalInvested: number
  currentValue: number
  xirr: number
  fundsHeld: number
  overlapMatrix: Array<{
    source: string
    values: Array<{
      target: string
      overlap: number
    }>
  }>
  allocation: Array<{
    name: string
    actual: number
    recommended: number
  }>
  expenseRatios: Array<{
    fund: string
    ratio: number
  }>
  warning: string
  recommendations: string[]
  projectedImprovement: number
  updatedAt?: string
}

export interface UserResults {
  healthScore?: HealthResult
  fireplan?: FireResult
  taxAnalysis?: TaxResult
  mfXray?: MFXrayResult
}

export interface UserDocument {
  profile?: UserProfile
  financials?: UserFinancials
  results?: UserResults
}

export type ToolResultKey = keyof UserResults

export interface ApiToolResponse<T> {
  result: T
  timestamp: string
}

export interface FireRequestBody {
  uid: string
  userInputs: {
    currentAge: number
    monthlyIncome: number
    monthlyExpenses: number
    currentSavings: number
    targetRetireAge: number
    expectedReturns: number
    inflationRate: number
  }
}

export interface TaxRequestBody {
  uid: string
  userInputs: Record<string, number | string | boolean>
}

export interface HealthAnswer {
  id: string
  question: string
  answer: string
  score: number
  dimension: keyof HealthResult["dimensions"]
}
