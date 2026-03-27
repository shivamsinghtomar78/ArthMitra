"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { LifeEventForm, type LifeEventFormValues } from "@/components/tools/life-event/LifeEventForm"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { useAppStore } from "@/store/useAppStore"
import { useFirestore } from "@/hooks/useFirestore"
import type { ApiToolResponse, LifeEventResult } from "@/types"

const LifeEventResults = dynamic(
  () => import("@/components/tools/life-event/LifeEventResults").then((m) => ({ default: m.LifeEventResults })),
  { ssr: false }
)

export default function LifeEventPage() {
  const user = useAppStore((state) => state.user)
  const profile = useAppStore((state) => state.profile)
  const financials = useAppStore((state) => state.financials)
  const result = useAppStore((state) => state.results.lifeEvent)
  const { saveToolResult } = useFirestore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [values, setValues] = useState<LifeEventFormValues>({
    event: "bonus",
    amount: 200000,
    currentAge: profile?.age || 28,
    monthlyIncome: financials?.monthlyIncome || 80000,
    existingInvestments: financials?.existingInvestments || 150000,
    riskProfile: financials?.riskProfile || "moderate",
    taxBracket: "20%",
  })

  function updateValue<Key extends keyof LifeEventFormValues>(key: Key, value: LifeEventFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit() {
    if (!user) {
      setError("Sign in to get your financial advice.")
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const response = await fetch("/api/ai/life-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, userInputs: values }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Unable to generate your action plan.")
      }

      const payload = (await response.json()) as ApiToolResponse<LifeEventResult>
      await saveToolResult(user.uid, "lifeEvent", payload.result)
      toast.success("Life event plan saved!")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to generate advice.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
      <section className="rounded-lg border border-line bg-white p-6">
        <LifeEventForm values={values} onChange={updateValue} onSubmit={handleSubmit} loading={loading} />
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      </section>
      <section>
        <LifeEventResults result={result} />
      </section>
    </div>
  )
}
