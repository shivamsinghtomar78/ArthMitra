"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { FireForm, type FireFormValues } from "@/components/tools/fire/FireForm"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { useAppStore } from "@/store/useAppStore"
import { useFirestore } from "@/hooks/useFirestore"
import type { ApiToolResponse, FireResult } from "@/types"

const FireResults = dynamic(
  () => import("@/components/tools/fire/FireResults").then((m) => ({ default: m.FireResults })),
  { ssr: false }
)

export default function FireToolPage() {
  const user = useAppStore((state) => state.user)
  const profile = useAppStore((state) => state.profile)
  const financials = useAppStore((state) => state.financials)
  const result = useAppStore((state) => state.results.fireplan)
  const { saveToolResult } = useFirestore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [values, setValues] = useState<FireFormValues>({
    currentAge: profile?.age || 28,
    monthlyIncome: financials?.monthlyIncome || 80000,
    monthlyExpenses: financials?.monthlyExpense || 45000,
    currentSavings: (financials?.currentSavings || 0) + (financials?.existingInvestments || 0),
    targetRetireAge: financials?.retirementAge || 45,
    expectedReturns: 12,
    inflationRate: 6,
  })

  function updateValue<Key extends keyof FireFormValues>(key: Key, value: FireFormValues[Key]) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function handleSubmit() {
    if (!user) {
      setError("Sign in to generate your FIRE plan.")
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const response = await fetch("/api/ai/fire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          userInputs: values,
        }),
      })

      if (!response.ok) {
        throw new Error("Unable to generate your FIRE plan right now.")
      }

      let finalResult: FireResult

      const contentType = response.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const payload = (await response.json()) as ApiToolResponse<FireResult>
        finalResult = payload.result
      } else {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullText = ""

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            fullText += decoder.decode(value, { stream: true })
          }
        }
        finalResult = JSON.parse(fullText) as FireResult
      }

      await saveToolResult(user.uid, "fireplan", finalResult)
      toast.success("FIRE plan saved!")
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to generate your FIRE plan."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
      <section className="rounded-lg border border-line bg-white p-6">
        <FireForm values={values} onChange={updateValue} onSubmit={handleSubmit} loading={loading} />
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      </section>
      <section>
        <FireResults result={result} />
      </section>
    </div>
  )
}
