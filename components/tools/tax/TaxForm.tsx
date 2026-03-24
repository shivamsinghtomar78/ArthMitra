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

export interface TaxFormValues {
  annualCTC: number
  basicSalaryPercent: number
  hraReceivedMonthly: number
  specialAllowances: number
  bonusAnnual: number
  eightyC: number
  npsContribution: number
  homeLoanInterest: number
  hraClaimed: boolean
  medicalInsurance: number
  educationLoan: number
  ageBracket: string
  cityType: string
}

export function TaxForm({
  values,
  onChange,
  onSubmit,
  loading,
}: {
  values: TaxFormValues
  onChange: <Key extends keyof TaxFormValues>(key: Key, value: TaxFormValues[Key]) => void
  onSubmit: () => void
  loading: boolean
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Tool</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Tax Wizard</h1>
        <p className="mt-3 text-base leading-8 text-bodyText">
          Compare old vs new regime and surface every deduction available to you.
        </p>
      </div>

      <div className="space-y-4">
        <details open className="rounded-lg border border-line p-5">
          <summary className="cursor-pointer text-lg font-bold text-foreground">Income Details</summary>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {([
              { key: "annualCTC", label: "Annual CTC" },
              { key: "hraReceivedMonthly", label: "HRA received/month" },
              { key: "specialAllowances", label: "Special Allowances" },
              { key: "bonusAnnual", label: "Bonus (annual)" },
            ] as const).map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-semibold text-foreground">{label}</label>
                <Input
                  type="number"
                  value={values[key]}
                  onChange={(event) => onChange(key, Number(event.target.value))}
                />
              </div>
            ))}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Basic Salary (% of CTC)</label>
                <span className="text-2xl font-black tracking-[-0.05em] text-foreground">
                  {values.basicSalaryPercent}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={60}
                value={values.basicSalaryPercent}
                onChange={(event) => onChange("basicSalaryPercent", Number(event.target.value))}
                className="w-full accent-[#16a34a]"
              />
            </div>
          </div>
        </details>

        <details open className="rounded-lg border border-line p-5">
          <summary className="cursor-pointer text-lg font-bold text-foreground">Deductions</summary>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {([
              { key: "eightyC", label: "PPF / ELSS / LIC (80C)" },
              { key: "npsContribution", label: "NPS Contribution (80CCD)" },
              { key: "homeLoanInterest", label: "Home Loan Interest (24b)" },
              { key: "medicalInsurance", label: "Medical Insurance (80D)" },
              { key: "educationLoan", label: "Education Loan (80E)" },
            ] as const).map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-semibold text-foreground">{label}</label>
                <Input
                  type="number"
                  value={values[key]}
                  onChange={(event) => onChange(key, Number(event.target.value))}
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">HRA exemption claimed</label>
              <div className="flex gap-3">
                {[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onChange("hraClaimed", item.value)}
                    className={`border px-4 py-3 text-sm font-medium ${
                      values.hraClaimed === item.value
                        ? "border-brand bg-brandLight text-foreground"
                        : "border-line text-bodyText"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </details>

        <details open className="rounded-lg border border-line p-5">
          <summary className="cursor-pointer text-lg font-bold text-foreground">Other</summary>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Age bracket</label>
              <Select
                value={values.ageBracket}
                onValueChange={(value) => onChange("ageBracket", value ?? "<60")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<60">{"< 60"}</SelectItem>
                  <SelectItem value="60-80">60-80</SelectItem>
                  <SelectItem value=">80">{"> 80"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">City for HRA</label>
              <Select
                value={values.cityType}
                onValueChange={(value) => onChange("cityType", value ?? "metro")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metro">Metro</SelectItem>
                  <SelectItem value="non-metro">Non-metro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Standard deduction</label>
              <Input value="₹50,000 old / ₹75,000 new" disabled />
            </div>
          </div>
        </details>
      </div>

      <Button type="button" size="lg" className="w-full" onClick={onSubmit} disabled={loading}>
        {loading ? "Calculating..." : "Calculate & Compare Regimes →"}
      </Button>
    </div>
  )
}
