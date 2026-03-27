"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/shared/CurrencyInput"

export interface CouplesFormValues {
  partner1Name: string
  partner1Income: number
  partner1NPS: number
  partner1SIPs: number
  partner1HRA: number
  partner1Rent: number
  partner2Name: string
  partner2Income: number
  partner2NPS: number
  partner2SIPs: number
  partner2HRA: number
  partner2Rent: number
  combinedLoans: number
  jointGoals: string[]
}

const goalOptions = [
  "Retire Early",
  "Buy a Home",
  "Child's Education",
  "Emergency Fund",
  "Vacation Fund",
  "Start a Business",
]

function PartnerColumn({
  prefix,
  label,
  values,
  onChange,
}: {
  prefix: "partner1" | "partner2"
  label: string
  values: CouplesFormValues
  onChange: <K extends keyof CouplesFormValues>(key: K, value: CouplesFormValues[K]) => void
}) {
  const nameKey = `${prefix}Name` as keyof CouplesFormValues
  const incomeKey = `${prefix}Income` as keyof CouplesFormValues
  const npsKey = `${prefix}NPS` as keyof CouplesFormValues
  const sipsKey = `${prefix}SIPs` as keyof CouplesFormValues
  const hraKey = `${prefix}HRA` as keyof CouplesFormValues
  const rentKey = `${prefix}Rent` as keyof CouplesFormValues

  return (
    <div className="space-y-4 rounded-lg border border-line p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{label}</p>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Name</label>
        <Input
          value={values[nameKey] as string}
          onChange={(e) => onChange(nameKey, e.target.value as never)}
          placeholder="Enter name"
        />
      </div>

      {[
        [incomeKey, "Monthly Income"],
        [npsKey, "Employer NPS"],
        [sipsKey, "Existing SIPs"],
        [hraKey, "HRA Claimed"],
        [rentKey, "Rent Paid"],
      ].map(([key, label]) => (
        <div key={key} className="space-y-2">
          <label className="text-sm font-semibold text-foreground">{label}</label>
          <CurrencyInput
            value={values[key as keyof CouplesFormValues] as number}
            onChange={(val) => onChange(key as keyof CouplesFormValues, val as never)}
          />
        </div>
      ))}
    </div>
  )
}

export function CouplesForm({
  values,
  onChange,
  onSubmit,
  loading,
}: {
  values: CouplesFormValues
  onChange: <Key extends keyof CouplesFormValues>(key: Key, value: CouplesFormValues[Key]) => void
  onSubmit: () => void
  loading: boolean
}) {
  function toggleGoal(goal: string) {
    const updated = values.jointGoals.includes(goal)
      ? values.jointGoals.filter((g) => g !== goal)
      : [...values.jointGoals, goal]
    onChange("jointGoals", updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Tool</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Couple&apos;s Money Planner</h1>
        <p className="mt-3 text-base leading-8 text-bodyText">
          India&apos;s first AI joint financial optimizer. Both incomes. One plan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PartnerColumn prefix="partner1" label="Partner 1" values={values} onChange={onChange} />
        <PartnerColumn prefix="partner2" label="Partner 2" values={values} onChange={onChange} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Combined Loans / EMIs</label>
        <CurrencyInput value={values.combinedLoans} onChange={(val) => onChange("combinedLoans", val)} />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">Joint Goals</label>
        <div className="flex flex-wrap gap-2">
          {goalOptions.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                values.jointGoals.includes(goal)
                  ? "border-brand bg-brandLight text-foreground"
                  : "border-line text-mutedText hover:border-brand/40"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <Button type="button" size="lg" className="w-full" onClick={onSubmit} disabled={loading}>
        {loading ? "Optimizing..." : "Optimize Our Finances →"}
      </Button>
    </div>
  )
}
