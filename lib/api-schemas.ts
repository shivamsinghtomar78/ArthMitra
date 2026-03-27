import "server-only"
import { z } from "zod"

/** FIRE Planner inputs */
export const fireInputSchema = z.object({
  currentAge: z.number().min(18).max(80),
  monthlyIncome: z.number().min(0),
  monthlyExpenses: z.number().min(0),
  currentSavings: z.number().min(0),
  targetRetireAge: z.number().min(30).max(80),
  expectedReturns: z.number().min(0).max(30),
  inflationRate: z.number().min(0).max(20),
})

/** Tax Wizard inputs */
export const taxInputSchema = z.object({
  grossIncome: z.number().min(0),
  deductions80C: z.number().min(0).default(0),
  deductions80D: z.number().min(0).default(0),
  deductionsHRA: z.number().min(0).default(0),
  homeLoanInterest: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),
  npsContribution: z.number().min(0).default(0),
  regime: z.enum(["compare", "old", "new"]).default("compare"),
})

/** Health Score answers */
const healthAnswerSchema = z.object({
  questionId: z.string(),
  selectedOption: z.string(),
})
export const healthInputSchema = z.object({
  answers: z.array(healthAnswerSchema).min(1),
})

/** MF X-Ray inputs */
const manualFundSchema = z.object({
  name: z.string().min(1),
  category: z.string(),
  amountInvested: z.number().min(0),
  currentValue: z.number().min(0).optional(),
})
export const mfXrayInputSchema = z.object({
  funds: z.array(manualFundSchema).default([]),
  statementName: z.string().optional(),
  statementText: z.string().optional(),
})

/** Life Event Advisor inputs */
export const lifeEventInputSchema = z.object({
  event: z.enum(["bonus", "inheritance", "marriage", "new_baby", "job_change", "home_purchase"]),
  amount: z.number().min(0),
  currentAge: z.number().min(18).max(80),
  monthlyIncome: z.number().min(0),
  existingInvestments: z.number().min(0),
  riskProfile: z.enum(["conservative", "moderate", "aggressive"]),
  taxBracket: z.enum(["0%", "5%", "20%", "30%"]),
})

/** Couple's Money Planner inputs */
const partnerSchema = z.object({
  name: z.string().min(1),
  monthlyIncome: z.number().min(0),
  employerNPS: z.number().min(0).default(0),
  existingSIPs: z.number().min(0).default(0),
  hraClaimed: z.number().min(0).default(0),
  rentPaid: z.number().min(0).default(0),
})
export const couplesInputSchema = z.object({
  partner1: partnerSchema,
  partner2: partnerSchema,
  combinedLoans: z.number().min(0).default(0),
  jointGoals: z.array(z.string()).min(1),
})
