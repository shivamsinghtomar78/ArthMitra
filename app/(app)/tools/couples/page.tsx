"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { CouplesForm, type CouplesFormValues } from "@/components/tools/couples/CouplesForm"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { useAppStore } from "@/store/useAppStore"
import { useFirestore } from "@/hooks/useFirestore"
import type { ApiToolResponse, CouplesResult } from "@/types"

const CouplesResults = dynamic(
  () => import("@/components/tools/couples/CouplesResults").then((m) => ({ default: m.CouplesResults })),
  { ssr: false }
)

export default function CouplesPage() {
  const user = useAppStore((state) => state.user)
  const result = useAppStore((state) => state.results.couplesPlanner)
  const { saveToolResult } = useFirestore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [values, setValues] = useState<CouplesFormValues>({
    partner1Name: "",
    partner1Income: 80000,
    partner1NPS: 0,
    partner1SIPs: 5000,
    partner1HRA: 0,
    partner1Rent: 15000,
    partner2Name: "",
    partner2Income: 60000,
    partner2NPS: 0,
    partner2SIPs: 3000,
    partner2HRA: 0,
    partner2Rent: 0,
    combinedLoans: 0,
    jointGoals: ["Retire Early"],
  })

  function updateValue<Key extends keyof CouplesFormValues>(key: Key, value: CouplesFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit() {
    if (!user) {
      setError("Sign in to optimize your finances.")
      return
    }

    if (!values.partner1Name.trim() || !values.partner2Name.trim()) {
      setError("Please enter both partners' names.")
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const apiPayload = {
        partner1: {
          name: values.partner1Name,
          monthlyIncome: values.partner1Income,
          employerNPS: values.partner1NPS,
          existingSIPs: values.partner1SIPs,
          hraClaimed: values.partner1HRA,
          rentPaid: values.partner1Rent,
        },
        partner2: {
          name: values.partner2Name,
          monthlyIncome: values.partner2Income,
          employerNPS: values.partner2NPS,
          existingSIPs: values.partner2SIPs,
          hraClaimed: values.partner2HRA,
          rentPaid: values.partner2Rent,
        },
        combinedLoans: values.combinedLoans,
        jointGoals: values.jointGoals,
      }

      const response = await fetch("/api/ai/couples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, userInputs: apiPayload }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Unable to generate your joint plan.")
      }

      const payload = (await response.json()) as ApiToolResponse<CouplesResult>
      await saveToolResult(user.uid, "couplesPlanner", payload.result)
      toast.success("Joint plan saved!")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to generate plan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <section className="rounded-lg border border-line bg-white p-6">
        <CouplesForm values={values} onChange={updateValue} onSubmit={handleSubmit} loading={loading} />
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      </section>
      <section>
        <CouplesResults result={result} />
      </section>
    </div>
  )
}
