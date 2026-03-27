"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { HealthQuiz } from "@/components/tools/health/HealthQuiz"

const HealthResults = dynamic(
  () => import("@/components/tools/health/HealthResults").then((m) => ({ default: m.HealthResults })),
  { ssr: false }
)
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useAppStore } from "@/store/useAppStore"
import { useFirestore } from "@/hooks/useFirestore"
import type { ApiToolResponse, HealthAnswer, HealthResult } from "@/types"

const questions = [
  {
    id: "q1",
    question: "Do you have an emergency fund?",
    options: [
      { label: "Yes, 6+ months of expenses", score: 4, dimension: "emergencyFund" },
      { label: "Yes, 3-6 months", score: 3, dimension: "emergencyFund" },
      { label: "Less than 3 months", score: 2, dimension: "emergencyFund" },
      { label: "No emergency fund at all", score: 1, dimension: "emergencyFund" },
    ],
  },
  {
    id: "q2",
    question: "What % of income do you invest monthly?",
    options: [
      { label: "More than 30%", score: 4, dimension: "investments" },
      { label: "20-30%", score: 3, dimension: "investments" },
      { label: "10-20%", score: 2, dimension: "investments" },
      { label: "Less than 10%", score: 1, dimension: "investments" },
    ],
  },
  {
    id: "q3",
    question: "Do you have term life insurance?",
    options: [
      { label: "Yes, adequate cover", score: 4, dimension: "insurance" },
      { label: "Yes, but unsure if enough", score: 3, dimension: "insurance" },
      { label: "Only employer cover", score: 2, dimension: "insurance" },
      { label: "No insurance", score: 1, dimension: "insurance" },
    ],
  },
  {
    id: "q4",
    question: "How much credit card debt do you carry?",
    options: [
      { label: "Zero", score: 4, dimension: "debtHealth" },
      { label: "I pay in full monthly", score: 3, dimension: "debtHealth" },
      { label: "I carry some balance", score: 2, dimension: "debtHealth" },
      { label: "I carry significant balance", score: 1, dimension: "debtHealth" },
    ],
  },
  {
    id: "q5",
    question: "Have you invested in tax-saving instruments?",
    options: [
      { label: "Yes, maximized 80C", score: 4, dimension: "taxEfficiency" },
      { label: "Partially", score: 3, dimension: "taxEfficiency" },
      { label: "Only employer PF", score: 2, dimension: "taxEfficiency" },
      { label: "No", score: 1, dimension: "taxEfficiency" },
    ],
  },
  {
    id: "q6",
    question: "How diversified is your investment portfolio?",
    options: [
      { label: "Well diversified across assets", score: 4, dimension: "investments" },
      { label: "Mostly mutual funds", score: 3, dimension: "investments" },
      { label: "Concentrated in one asset class", score: 2, dimension: "investments" },
      { label: "I have barely started", score: 1, dimension: "investments" },
    ],
  },
  {
    id: "q7",
    question: "How close are you to your retirement savings target?",
    options: [
      { label: "Ahead of plan", score: 4, dimension: "retirement" },
      { label: "On track", score: 3, dimension: "retirement" },
      { label: "Behind by a bit", score: 2, dimension: "retirement" },
      { label: "I have no retirement plan yet", score: 1, dimension: "retirement" },
    ],
  },
  {
    id: "q8",
    question: "How stable is your monthly cash flow?",
    options: [
      { label: "Very stable with strong surplus", score: 4, dimension: "emergencyFund" },
      { label: "Stable enough", score: 3, dimension: "emergencyFund" },
      { label: "Often tight", score: 2, dimension: "emergencyFund" },
      { label: "Frequently negative", score: 1, dimension: "emergencyFund" },
    ],
  },
  {
    id: "q9",
    question: "How often do you review your insurance and nominations?",
    options: [
      { label: "Every year", score: 4, dimension: "insurance" },
      { label: "Sometimes", score: 3, dimension: "insurance" },
      { label: "Rarely", score: 2, dimension: "insurance" },
      { label: "Never", score: 1, dimension: "insurance" },
    ],
  },
  {
    id: "q10",
    question: "How disciplined are you with long-term investing?",
    options: [
      { label: "Automated SIPs and regular reviews", score: 4, dimension: "retirement" },
      { label: "Mostly consistent", score: 3, dimension: "retirement" },
      { label: "On and off", score: 2, dimension: "retirement" },
      { label: "Not started", score: 1, dimension: "retirement" },
    ],
  },
] as const

export default function HealthScorePage() {
  const user = useAppStore((state) => state.user)
  const storedResult = useAppStore((state) => state.results.healthScore)
  const { saveToolResult } = useFirestore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<HealthAnswer[]>([])
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HealthResult | undefined>(storedResult)

  async function submitQuiz(nextAnswers: HealthAnswer[]) {
    if (!user) {
      setError("Sign in to calculate your health score.")
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const response = await fetch("/api/ai/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          userInputs: {
            answers: nextAnswers,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Unable to calculate your score right now.")
      }

      const payload = (await response.json()) as ApiToolResponse<HealthResult>
      await saveToolResult(user.uid, "healthScore", payload.result)
      toast.success("Health score saved!")
      setResult(payload.result)
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to calculate your score."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSelect(option: {
    label: string
    score: number
    dimension: string
  }) {
    const question = questions[currentIndex]
    const nextAnswers = [
      ...answers,
      {
        id: question.id,
        question: question.question,
        answer: option.label,
        score: option.score,
        dimension: option.dimension as HealthAnswer["dimension"],
      },
    ]

    setAnswers(nextAnswers)

    if (currentIndex === questions.length - 1) {
      await submitQuiz(nextAnswers)
      return
    }

    setCurrentIndex((index) => index + 1)
  }

  function handleRetake() {
    setAnswers([])
    setCurrentIndex(0)
    setResult(undefined)
    setError(undefined)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-lg border border-line bg-white">
        <LoadingSpinner label="Scoring your financial health" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ErrorMessage message={error} />
      {result ? (
        <HealthResults result={result} onRetake={handleRetake} />
      ) : (
        <HealthQuiz
          question={questions[currentIndex]}
          currentIndex={currentIndex}
          total={questions.length}
          onSelect={handleSelect}
        />
      )}
    </div>
  )
}
