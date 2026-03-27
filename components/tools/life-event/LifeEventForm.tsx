"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CurrencyInput } from "@/components/shared/CurrencyInput"
import type { LifeEventType, RiskProfile } from "@/types"

export interface LifeEventFormValues {
  event: LifeEventType
  amount: number
  currentAge: number
  monthlyIncome: number
  existingInvestments: number
  riskProfile: RiskProfile
  taxBracket: string
}

const eventOptions: { value: LifeEventType; label: string; emoji: string }[] = [
  { value: "bonus", label: "Received a Bonus", emoji: "💰" },
  { value: "inheritance", label: "Received Inheritance", emoji: "🏛️" },
  { value: "marriage", label: "Getting Married", emoji: "💍" },
  { value: "new_baby", label: "Expecting a Baby", emoji: "👶" },
  { value: "job_change", label: "Changed Jobs", emoji: "💼" },
  { value: "home_purchase", label: "Buying a Home", emoji: "🏠" },
]

export function LifeEventForm({
  values,
  onChange,
  onSubmit,
  loading,
}: {
  values: LifeEventFormValues
  onChange: <Key extends keyof LifeEventFormValues>(key: Key, value: LifeEventFormValues[Key]) => void
  onSubmit: () => void
  loading: boolean
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Tool</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Life Event Advisor</h1>
        <p className="mt-3 text-base leading-8 text-bodyText">
          Big life change? Get a personalized financial game plan.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">What happened?</label>
          <div className="grid grid-cols-2 gap-3">
            {eventOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange("event", opt.value)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  values.event === opt.value
                    ? "border-brand bg-brandLight text-foreground"
                    : "border-line text-mutedText hover:border-brand/40"
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Amount involved (₹)</label>
          <CurrencyInput value={values.amount} onChange={(val) => onChange("amount", val)} />
        </div>

        {[
          ["currentAge", "Current Age"],
          ["monthlyIncome", "Monthly Income"],
          ["existingInvestments", "Existing Investments"],
        ].map(([key, label]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-semibold text-foreground">{label}</label>
            <Input
              type="number"
              value={values[key as keyof LifeEventFormValues]}
              onChange={(e) =>
                onChange(key as keyof LifeEventFormValues, Number(e.target.value) as never)
              }
            />
          </div>
        ))}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Risk Profile</label>
          <Select
            value={values.riskProfile}
            onValueChange={(v) => onChange("riskProfile", v as RiskProfile)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Tax Bracket</label>
          <Select
            value={values.taxBracket}
            onValueChange={(v) => { if (v) onChange("taxBracket", v) }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0%">0% (Below ₹2.5L)</SelectItem>
              <SelectItem value="5%">5% (₹2.5L – ₹5L)</SelectItem>
              <SelectItem value="20%">20% (₹5L – ₹10L)</SelectItem>
              <SelectItem value="30%">30% (Above ₹10L)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="button" size="lg" className="w-full" onClick={onSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Get My Action Plan →"}
      </Button>
    </div>
  )
}
