import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function formatCompactValue(value: number, divisor: number, suffix: string) {
  const compact = value / divisor
  const digits = compact >= 100 ? 0 : compact >= 10 ? 1 : 2

  return `${Number(compact.toFixed(digits))} ${suffix}`
}

export function formatIndianCurrency(amount: number): string {
  const absolute = Math.abs(amount)
  const prefix = amount < 0 ? "-₹" : "₹"

  if (absolute >= 1_00_00_000) {
    return `${prefix}${formatCompactValue(absolute, 1_00_00_000, "Crore")}`
  }

  if (absolute >= 1_00_000) {
    return `${prefix}${formatCompactValue(absolute, 1_00_000, "Lakh")}`
  }

  return `${prefix}${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(absolute)}`
}

export function formatShortCurrency(amount: number): string {
  const absolute = Math.abs(amount)
  const prefix = amount < 0 ? "-" : ""

  if (absolute >= 1_00_00_000) {
    return `${prefix}${Number((absolute / 1_00_00_000).toFixed(2))} Cr`
  }

  if (absolute >= 1_00_000) {
    return `${prefix}${Number((absolute / 1_00_000).toFixed(1))} L`
  }

  if (absolute >= 1_000) {
    return `${prefix}${Number((absolute / 1_000).toFixed(1))}K`
  }

  return `${prefix}${Math.round(absolute)}`
}

export function calculateSIPCorpus(
  monthlyAmount: number,
  years: number,
  annualReturn: number
): number {
  const months = years * 12
  const monthlyRate = annualReturn / 12 / 100

  if (months <= 0) {
    return 0
  }

  if (monthlyRate === 0) {
    return monthlyAmount * months
  }

  return monthlyAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate)
}

export function calculateRequiredSIP(
  targetCorpus: number,
  years: number,
  annualReturn: number
): number {
  const months = years * 12
  const monthlyRate = annualReturn / 12 / 100

  if (months <= 0) {
    return targetCorpus
  }

  if (monthlyRate === 0) {
    return targetCorpus / months
  }

  return targetCorpus / ((((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate))
}

function calculateSlabTax(income: number, slabs: Array<[number, number]>) {
  let tax = 0
  let previousLimit = 0

  for (const [limit, rate] of slabs) {
    const taxablePortion = Math.min(income, limit) - previousLimit

    if (taxablePortion > 0) {
      tax += taxablePortion * rate
      previousLimit = limit
    }
  }

  if (income > previousLimit) {
    tax += (income - previousLimit) * slabs[slabs.length - 1][1]
  }

  return tax
}

export function calculateOldRegimeTax(
  income: number,
  deductions: Record<string, number>
): number {
  const totalDeductions = Object.values(deductions).reduce((sum, value) => sum + (value || 0), 0)
  const taxableIncome = Math.max(0, income - 50_000 - totalDeductions)
  const taxBeforeCess = calculateSlabTax(taxableIncome, [
    [2_50_000, 0],
    [5_00_000, 0.05],
    [10_00_000, 0.2],
    [Number.MAX_SAFE_INTEGER, 0.3],
  ])

  return taxBeforeCess * 1.04
}

export function calculateNewRegimeTax(income: number): number {
  const taxableIncome = Math.max(0, income - 75_000)
  const taxBeforeCess = calculateSlabTax(taxableIncome, [
    [3_00_000, 0],
    [7_00_000, 0.05],
    [10_00_000, 0.1],
    [12_00_000, 0.15],
    [15_00_000, 0.2],
    [Number.MAX_SAFE_INTEGER, 0.3],
  ])

  return taxBeforeCess * 1.04
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours()

  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function parseCurrencyInput(value: string | number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  return Number(value.replace(/[^\d.-]/g, "")) || 0
}

export function formatDateLabel(input: string) {
  return new Date(input).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
