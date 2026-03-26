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
