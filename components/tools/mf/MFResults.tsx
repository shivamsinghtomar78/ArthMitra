"use client"

import React from "react"

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatIndianCurrency } from "@/lib/utils"
import type { MFXrayResult } from "@/types"

const pieColors = ["#16a34a", "#0a0a0a", "#6b7280", "#dcfce7"]

export const MFResults = React.memo(function MFResults({ result }: { result?: MFXrayResult }) {
  if (!result) {
    return (
      <Card className="flex min-h-[720px] items-center justify-center">
        <CardContent className="space-y-4 p-10 text-center">
          <h2 className="text-2xl font-bold text-foreground">Your portfolio analysis will appear here</h2>
          <p className="max-w-lg text-base leading-8 text-mutedText">
            Add fund names and values to identify overlap, expense drag, and the most useful rebalance actions.
          </p>
        </CardContent>
      </Card>
    )
  }

  const actualPie = result.allocation.map((item) => ({ name: item.name, value: item.actual }))
  const recommendedPie = result.allocation.map((item) => ({ name: item.name, value: item.recommended }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Invested", formatIndianCurrency(result.totalInvested)],
          ["Current Value", formatIndianCurrency(result.currentValue)],
          ["XIRR", `${result.xirr}%`],
          ["Funds Held", String(result.fundsHeld)],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">{label}</p>
              <p className="mt-4 text-3xl font-black tracking-[-0.05em] text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
              Overlap matrix
            </p>
            <h2 className="text-2xl font-bold text-foreground">Duplicate exposure across funds</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fund</TableHead>
                {result.overlapMatrix.map((column) => (
                  <TableHead key={column.source}>{column.source}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.overlapMatrix.map((row) => (
                <TableRow key={row.source}>
                  <TableCell className="font-medium text-foreground">{row.source}</TableCell>
                  {row.values.map((value) => (
                    <TableCell key={`${row.source}-${value.target}`}>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          value.overlap > 40
                            ? "bg-danger/10 text-danger"
                            : value.overlap > 20
                              ? "bg-warning/10 text-warning"
                              : "bg-brandLight text-brand"
                        }`}
                      >
                        {value.target === row.source ? "—" : `${value.overlap}%`}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-sm leading-7 text-bodyText">{result.warning}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Allocation
              </p>
              <h3 className="text-2xl font-bold text-foreground">Actual allocation</h3>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={actualPie} dataKey="value" nameKey="name" outerRadius={96}>
                    {actualPie.map((item, index) => (
                      <Cell key={item.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Allocation
              </p>
              <h3 className="text-2xl font-bold text-foreground">Recommended allocation</h3>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={recommendedPie} dataKey="value" nameKey="name" outerRadius={96}>
                    {recommendedPie.map((item, index) => (
                      <Cell key={item.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Expense ratio
              </p>
              <h3 className="text-2xl font-bold text-foreground">Cost drag by fund</h3>
            </div>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.expenseRatios} layout="vertical">
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis dataKey="fund" type="category" tickLine={false} axisLine={false} width={120} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="ratio" fill="#16a34a" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-brand">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Rebalancing plan
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                Projected improvement: +{result.projectedImprovement}% CAGR
              </h3>
            </div>
            <ol className="space-y-3 text-base leading-8 text-bodyText">
              {result.recommendations.map((recommendation, index) => (
                <li key={recommendation} className="flex gap-3">
                  <span className="font-heading text-xl font-bold text-brand">{index + 1}.</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})
