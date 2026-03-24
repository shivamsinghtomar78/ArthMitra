"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { formatIndianCurrency, formatShortCurrency } from "@/lib/utils"
import type { FireResult } from "@/types"

export function FireResults({ result }: { result?: FireResult }) {
  if (!result) {
    return (
      <Card className="flex min-h-[680px] items-center justify-center">
        <CardContent className="space-y-6 p-10 text-center">
          <svg width="220" height="160" viewBox="0 0 220 160" className="mx-auto">
            <path d="M25 120 C75 60 145 60 195 120" fill="none" stroke="#d1d5db" strokeWidth="4" />
            <path d="M82 98 C105 88 130 88 153 98 C143 118 96 118 82 98Z" fill="#16A34A" opacity="0.2" />
            <circle cx="104" cy="85" r="10" fill="#0A0A0A" />
            <path d="M104 95 L96 120 M108 99 L121 118 M104 102 L89 107 M108 102 L123 104" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Your personalized FIRE roadmap will appear here
            </h2>
            <p className="text-base leading-8 text-mutedText">
              Add your numbers on the left and generate a plan built around your monthly surplus and target retirement age.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const pieData = [
    { name: "Large Cap MF", value: result.assetAllocation.largeCap, color: "#16a34a" },
    { name: "Mid Cap MF", value: result.assetAllocation.midCap, color: "#0a0a0a" },
    { name: "Debt / PPF", value: result.assetAllocation.debt, color: "#6b7280" },
    { name: "Gold ETF", value: result.assetAllocation.gold, color: "#d1d5db" },
    { name: "Emergency Fund", value: result.assetAllocation.emergency, color: "#dcfce7" },
  ]
  const gapMessage =
    result.sipGap > 0
      ? `You still have a monthly investing gap of ${formatIndianCurrency(result.sipGap)}.`
      : "Your current surplus is broadly aligned with the recommended SIP."

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-brand px-6 py-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Your result</p>
        <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
          You can retire at {result.canRetireAtAge}
        </h2>
        <p className="mt-3 text-base leading-8 text-white/85">
          {`${result.yearsToFIRE} years to FIRE if you stay consistent. ${gapMessage}`}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Corpus Needed", formatIndianCurrency(result.corpusNeeded)],
          ["Monthly SIP", formatIndianCurrency(result.recommendedMonthlySIP)],
          ["Years to FIRE", `${result.yearsToFIRE} years`],
          ["Current Gap", formatIndianCurrency(result.sipGap)],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">{label}</p>
              <p className="mt-4 text-3xl font-black tracking-[-0.05em] text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                SIP breakdown
              </p>
              <h3 className="text-2xl font-bold text-foreground">Projected corpus growth</h3>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.yearlyProjections}>
                  <CartesianGrid stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => formatShortCurrency(Number(value))}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => formatIndianCurrency(Number(value))}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="baselineCorpus"
                    stroke="#6b7280"
                    fill="#e5e7eb"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="corpus"
                    stroke="#16a34a"
                    fill="#16a34a"
                    fillOpacity={0.18}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Asset allocation
              </p>
              <h3 className="text-2xl font-bold text-foreground">Recommended split</h3>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={86}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-brand">
        <CardContent className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">AI narrative</p>
          <p className="mt-4 text-base leading-8 text-bodyText">{result.narrative}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h3 className="text-2xl font-bold text-foreground">Action steps</h3>
          <ol className="space-y-3 text-base leading-8 text-bodyText">
            {result.actionSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="font-heading text-xl font-bold text-brand">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
