"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { HealthResult } from "@/types"

function getScoreColor(score: number) {
  if (score < 40) return "#dc2626"
  if (score < 60) return "#d97706"
  if (score < 75) return "#ca8a04"
  return "#16a34a"
}

export function HealthResults({
  result,
  onRetake,
}: {
  result: HealthResult
  onRetake: () => void
}) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let frame = 0
    const target = result.overallScore

    function tick() {
      frame += 1
      const next = Math.min(target, Math.round((frame / 30) * target))
      setAnimatedScore(next)
      if (next < target) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [result.overallScore])

  const gaugeColor = getScoreColor(result.overallScore)
  const dimensions = [
    ["Emergency Preparedness", result.dimensions.emergencyFund.score],
    ["Insurance Coverage", result.dimensions.insurance.score],
    ["Investment Diversification", result.dimensions.investments.score],
    ["Debt Health", result.dimensions.debtHealth.score],
    ["Tax Efficiency", result.dimensions.taxEfficiency.score],
    ["Retirement Readiness", result.dimensions.retirement.score],
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            <div
              className="relative flex size-64 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${gaugeColor} ${animatedScore * 3.6}deg, #e5e7eb 0deg)`,
              }}
            >
              <div className="flex size-48 flex-col items-center justify-center rounded-full bg-white">
                <p className="text-6xl font-black tracking-[-0.06em] text-foreground">{animatedScore}</p>
                <p className="text-sm text-mutedText">/100</p>
              </div>
            </div>
            <div className="max-w-xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mutedText">
                Money Health Score
              </p>
              <h1 className="text-4xl font-black tracking-[-0.05em]">{result.label}</h1>
              <p className="text-base leading-8 text-bodyText">{result.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="text-2xl font-bold text-foreground">6-dimension breakdown</h2>
          {dimensions.map(([label, score], index) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-bodyText">{label}</span>
                <span className="font-medium text-foreground">{score}/100</span>
              </div>
              <div className="h-3 rounded-full bg-line overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.15, ease: "easeOut" }}
                  style={{
                    backgroundColor: getScoreColor(Number(score)),
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="text-2xl font-bold text-foreground">Priority actions</h2>
          {result.topPriorities.map((priority) => (
            <div key={priority.priority} className="rounded-lg border border-line p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mutedText">
                    Priority {priority.priority}
                  </p>
                  <p className="mt-2 text-lg font-bold text-foreground">{priority.action}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                    priority.impact === "high"
                      ? "bg-danger/10 text-danger"
                      : priority.impact === "medium"
                        ? "bg-warning/10 text-warning"
                        : "bg-brandLight text-brand"
                  }`}
                >
                  {priority.impact}
                </span>
              </div>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                Learn more
                <ArrowRight className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onRetake}
            className="border border-line px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            Retake
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
