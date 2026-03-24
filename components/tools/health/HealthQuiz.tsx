"use client"

import { Progress } from "@/components/ui/progress"

interface HealthQuestion {
  id: string
  question: string
  options: ReadonlyArray<{
    label: string
    score: number
    dimension: string
  }>
}

export function HealthQuiz({
  question,
  currentIndex,
  total,
  onSelect,
}: {
  question: HealthQuestion
  currentIndex: number
  total: number
  onSelect: (option: HealthQuestion["options"][number]) => void
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mutedText">
            {currentIndex + 1} of {total}
          </p>
          <Progress value={((currentIndex + 1) / total) * 100} />
          <h1 className="max-w-3xl text-3xl font-black tracking-[-0.05em] text-foreground sm:text-4xl">
            {question.question}
          </h1>
        </div>
        <div className="grid gap-4">
          {question.options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => onSelect(option)}
              className="rounded-lg border border-line p-5 text-left transition-colors hover:border-brand hover:bg-brandLight"
            >
              <p className="text-lg font-medium text-foreground">{option.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
