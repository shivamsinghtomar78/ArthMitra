"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { formatIndianCurrency } from "@/lib/utils"
import type { CouplesResult } from "@/types"

export const CouplesResults = React.memo(function CouplesResults({
  result,
}: {
  result?: CouplesResult
}) {
  if (!result) {
    return (
      <Card className="flex min-h-[680px] items-center justify-center">
        <CardContent className="space-y-4 p-10 text-center">
          <h2 className="text-2xl font-bold text-foreground">Your joint plan will appear here</h2>
          <p className="max-w-lg text-base leading-8 text-mutedText">
            Enter both partners&apos; details and AI will optimize across both incomes for maximum savings.
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Combined overview</p>
        <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
          {formatIndianCurrency(result.combinedNetWorth)}
        </h2>
        <p className="mt-1 text-sm text-white/70">Combined net worth</p>
        <p className="mt-3 text-base leading-8 text-white/85">
          Recommended monthly investment: {formatIndianCurrency(result.combinedMonthlyInvestment)}
        </p>
      </motion.section>

      <div className="grid gap-4 sm:grid-cols-2">
        {[result.partner1, result.partner2].map((partner, i) => (
          <motion.div
            key={partner.name || i}
            variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { type: "spring" } } }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                  Partner {i + 1}
                </p>
                <p className="mt-2 text-xl font-bold text-foreground">{partner.name}</p>
                <div className="mt-4 space-y-3">
                  {[
                    ["Income", formatIndianCurrency(partner.income)],
                    ["Effective Tax", `${partner.effectiveTaxRate}%`],
                    ["Recommended SIP", formatIndianCurrency(partner.recommendedSIP)],
                    ["NPS Optimal", formatIndianCurrency(partner.npsOptimal)],
                    ["HRA Benefit", formatIndianCurrency(partner.hraBenefit)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-bodyText">{label}</span>
                      <span className="font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {result.optimizedSplits.length > 0 && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Optimized investment splits
              </p>
              <div className="mt-4 space-y-4">
                {result.optimizedSplits.map((split) => (
                  <div key={split.category} className="rounded-lg border border-line p-4">
                    <p className="text-lg font-bold text-foreground">{split.category}</p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-mutedText">{result.partner1.name}</p>
                        <p className="text-xl font-black text-brand">{split.partner1Share}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-mutedText">{result.partner2.name}</p>
                        <p className="text-xl font-black text-brand">{split.partner2Share}%</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-bodyText">{split.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {result.insuranceRecommendations.length > 0 && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Insurance recommendations
              </p>
              <div className="mt-4 space-y-3">
                {result.insuranceRecommendations.map((ins) => (
                  <div key={ins.type} className="flex items-start justify-between gap-4 rounded-lg border border-line p-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">{ins.type}</p>
                      <p className="mt-1 text-sm text-bodyText">{ins.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-brand">{formatIndianCurrency(ins.coverAmount)}</p>
                      <p className="text-xs text-mutedText">
                        {ins.holder === "both" ? "Both" : ins.holder === "partner1" ? result.partner1.name : result.partner2.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {result.recommendations.length > 0 && (
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="text-2xl font-bold text-foreground">Action steps</h3>
              <ol className="space-y-3 text-base leading-8 text-bodyText">
                {result.recommendations.map((rec, i) => (
                  <li key={rec} className="flex gap-3">
                    <span className="font-heading text-xl font-bold text-brand">{i + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
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
    </motion.div>
  )
})
