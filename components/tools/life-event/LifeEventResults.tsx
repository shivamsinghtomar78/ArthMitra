"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { formatIndianCurrency } from "@/lib/utils"
import type { LifeEventResult } from "@/types"

const eventLabels: Record<string, string> = {
  bonus: "Bonus 💰",
  inheritance: "Inheritance 🏛️",
  marriage: "Marriage 💍",
  new_baby: "New Baby 👶",
  job_change: "Job Change 💼",
  home_purchase: "Home Purchase 🏠",
}

const priorityColors: Record<string, string> = {
  immediate: "bg-danger/10 text-danger",
  within_3_months: "bg-warning/10 text-warning",
  within_6_months: "bg-brandLight text-brand",
}

export const LifeEventResults = React.memo(function LifeEventResults({
  result,
}: {
  result?: LifeEventResult
}) {
  if (!result) {
    return (
      <Card className="flex min-h-[680px] items-center justify-center">
        <CardContent className="space-y-4 p-10 text-center">
          <h2 className="text-2xl font-bold text-foreground">Your action plan will appear here</h2>
          <p className="max-w-lg text-base leading-8 text-mutedText">
            Select a life event and fill in your details. AI will generate a personalized financial game plan.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
      }}
      className="space-y-6"
    >
      <motion.section
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
        className="rounded-lg bg-brand px-6 py-6 text-white"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Life event</p>
        <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
          {eventLabels[result.event] || result.event}
        </h2>
        <p className="mt-3 text-base leading-8 text-white/85">
          Amount: {formatIndianCurrency(result.eventAmount)} — Here&apos;s your personalized plan.
        </p>
      </motion.section>

      <div className="grid gap-4 sm:grid-cols-2">
        {result.immediateActions.map((action, i) => (
          <motion.div
            key={action.title}
            variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { type: "spring" } } }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                    Step {i + 1}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      priorityColors[action.priority] || "bg-line text-mutedText"
                    }`}
                  >
                    {action.priority.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-3 text-lg font-bold text-foreground">{action.title}</p>
                <p className="mt-2 text-sm leading-7 text-bodyText">{action.description}</p>
                {action.amount ? (
                  <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-brand">
                    {formatIndianCurrency(action.amount)}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {result.taxImplications.length > 0 && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Tax implications
              </p>
              <ul className="mt-4 space-y-3">
                {result.taxImplications.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-8 text-bodyText">
                    <span className="text-brand">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {result.portfolioChanges.length > 0 && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Portfolio adjustment
              </p>
              <div className="mt-4 space-y-4">
                {result.portfolioChanges.map((pc) => (
                  <div key={pc.asset} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-bodyText">{pc.asset}</span>
                      <span className="font-medium text-foreground">
                        {pc.currentAllocation}% → {pc.recommendedAllocation}%
                      </span>
                    </div>
                    <div className="flex h-3 rounded-full bg-line overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-400 transition-all"
                        style={{ width: `${pc.currentAllocation}%` }}
                      />
                      <div
                        className="h-full rounded-full bg-brand transition-all -ml-px"
                        style={{ width: `${pc.recommendedAllocation}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {result.timeline.length > 0 && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Your timeline
              </p>
              <div className="mt-4 space-y-0">
                {result.timeline.map((step, i) => (
                  <div key={step.month} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex size-8 items-center justify-center rounded-full border-2 border-brand bg-white text-xs font-bold text-brand">
                        {i + 1}
                      </div>
                      {i < result.timeline.length - 1 && <div className="w-0.5 flex-1 bg-line" />}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-semibold text-foreground">{step.month}</p>
                      <p className="mt-1 text-sm leading-7 text-bodyText">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <Card className="border-l-4 border-l-brand">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">AI narrative</p>
            <p className="mt-4 text-base leading-8 text-bodyText">{result.narrative}</p>
          </CardContent>
        </Card>
      </motion.div>

      {result.warnings.length > 0 && (
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">Warnings</p>
              <ul className="mt-4 space-y-2">
                {result.warnings.map((w) => (
                  <li key={w} className="text-sm leading-7 text-bodyText">⚠️ {w}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
})
