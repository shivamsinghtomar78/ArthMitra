"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface FireFormValues {
  currentAge: number
  monthlyIncome: number
  monthlyExpenses: number
  currentSavings: number
  targetRetireAge: number
  expectedReturns: number
  inflationRate: number
}

export function FireForm({
  values,
  onChange,
  onSubmit,
  loading,
}: {
  values: FireFormValues
  onChange: <Key extends keyof FireFormValues>(key: Key, value: FireFormValues[Key]) => void
  onSubmit: () => void
  loading: boolean
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Tool</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">FIRE Path Planner</h1>
        <p className="mt-3 text-base leading-8 text-bodyText">Retire early. On your terms.</p>
      </div>

      <div className="space-y-5">
        {[
          ["currentAge", "Current Age"],
          ["monthlyIncome", "Monthly Income"],
          ["monthlyExpenses", "Monthly Expenses"],
          ["currentSavings", "Current Savings"],
        ].map(([key, label]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-semibold text-foreground">{label}</label>
            <Input
              type="number"
              value={values[key as keyof FireFormValues]}
              onChange={(event) =>
                onChange(key as keyof FireFormValues, Number(event.target.value) as never)
              }
            />
          </div>
        ))}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Target Retire Age</label>
            <span className="text-2xl font-black tracking-[-0.05em] text-foreground">
              {values.targetRetireAge}
            </span>
          </div>
          <input
            type="range"
            min={35}
            max={65}
            value={values.targetRetireAge}
            onChange={(event) => onChange("targetRetireAge", Number(event.target.value))}
            className="w-full accent-[#16a34a]"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Expected Returns</label>
            <span className="text-2xl font-black tracking-[-0.05em] text-foreground">
              {values.expectedReturns}%
            </span>
          </div>
          <input
            type="range"
            min={8}
            max={15}
            step={0.5}
            value={values.expectedReturns}
            onChange={(event) => onChange("expectedReturns", Number(event.target.value))}
            className="w-full accent-[#16a34a]"
          />
          <p className="text-sm text-mutedText">Conservative 8% → Aggressive 15%</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Inflation Rate</label>
          <Input
            type="number"
            step="0.1"
            value={values.inflationRate}
            onChange={(event) => onChange("inflationRate", Number(event.target.value))}
          />
        </div>
      </div>

      <Button type="button" size="lg" className="w-full" onClick={onSubmit} disabled={loading}>
        {loading ? "Generating..." : "Generate My FIRE Plan →"}
      </Button>
    </div>
  )
}
