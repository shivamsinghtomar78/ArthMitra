"use client"

import { useState } from "react"
import { TaxForm, type TaxFormValues } from "@/components/tools/tax/TaxForm"
import { TaxResults } from "@/components/tools/tax/TaxResults"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { useAppStore } from "@/store/useAppStore"
import { useFirestore } from "@/hooks/useFirestore"
import type { ApiToolResponse, TaxResult } from "@/types"

export default function TaxToolPage() {
  const user = useAppStore((state) => state.user)
  const financials = useAppStore((state) => state.financials)
  const result = useAppStore((state) => state.results.taxAnalysis)
  const { saveToolResult } = useFirestore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [values, setValues] = useState<TaxFormValues>({
    annualCTC: (financials?.monthlyIncome || 80000) * 12,
    basicSalaryPercent: 40,
    hraReceivedMonthly: 20000,
    specialAllowances: 0,
    bonusAnnual: 0,
    eightyC: 150000,
    npsContribution: 0,
    homeLoanInterest: 0,
    hraClaimed: true,
    medicalInsurance: 0,
    educationLoan: 0,
    ageBracket: "<60",
    cityType: "metro",
  })

  function updateValue<Key extends keyof TaxFormValues>(key: Key, value: TaxFormValues[Key]) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function handleSubmit() {
    if (!user) {
      setError("Sign in to calculate your tax comparison.")
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const response = await fetch("/api/ai/tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          userInputs: values,
        }),
      })

      if (!response.ok) {
        throw new Error("Unable to calculate taxes right now.")
      }

      const payload = (await response.json()) as ApiToolResponse<TaxResult>
      await saveToolResult(user.uid, "taxAnalysis", payload.result)
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to calculate taxes right now."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
      <section className="rounded-lg border border-line bg-white p-6">
        <TaxForm values={values} onChange={updateValue} onSubmit={handleSubmit} loading={loading} />
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      </section>
      <section>
        <TaxResults result={result} />
      </section>
    </div>
  )
}
