"use client"

import React from "react"

import {
  Bar,
  BarChart,
  CartesianGrid,
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
import type { TaxResult } from "@/types"

export const TaxResults = React.memo(function TaxResults({ result }: { result?: TaxResult }) {
  if (!result) {
    return (
      <Card className="flex min-h-[720px] items-center justify-center">
        <CardContent className="space-y-4 p-10 text-center">
          <h2 className="text-2xl font-bold text-foreground">Your tax comparison will appear here</h2>
          <p className="max-w-lg text-base leading-8 text-mutedText">
            Add your income and deductions to compare regimes, estimate tax payable, and find missed savings.
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = [
    {
      name: "Old regime",
      taxBeforeCess: result.oldRegime.taxBeforeCess,
      totalTax: result.oldRegime.totalTax,
    },
    {
      name: "New regime",
      taxBeforeCess: result.newRegime.taxBeforeCess,
      totalTax: result.newRegime.totalTax,
    },
  ]

  const rows = [
    ["Gross Income", result.oldRegime.grossIncome, result.newRegime.grossIncome],
    ["Total Deductions", result.oldRegime.totalDeductions, result.newRegime.totalDeductions],
    ["Taxable Income", result.oldRegime.taxableIncome, result.newRegime.taxableIncome],
    ["Tax Payable", result.oldRegime.taxBeforeCess, result.newRegime.taxBeforeCess],
    ["Cess (4%)", result.oldRegime.cess, result.newRegime.cess],
    ["TOTAL TAX", result.oldRegime.totalTax, result.newRegime.totalTax],
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
              Comparison
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Old Regime</TableHead>
                  <TableHead>New Regime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(([label, oldValue, newValue]) => (
                  <TableRow key={label}>
                    <TableCell className="font-medium text-foreground">{label}</TableCell>
                    <TableCell>{formatIndianCurrency(Number(oldValue))}</TableCell>
                    <TableCell>{formatIndianCurrency(Number(newValue))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <section className="rounded-lg bg-brandLight px-6 py-5">
        <p className="text-lg font-bold text-foreground">
          ✓ {result.betterRegime === "old" ? "Old" : "New"} Regime saves you{" "}
          {formatIndianCurrency(result.taxSaving)} this year
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Missed deductions
              </p>
              <h3 className="text-2xl font-bold text-foreground">You&apos;re leaving money on the table</h3>
            </div>
            <div className="space-y-4">
              {result.missedDeductions.length ? (
                result.missedDeductions.map((item) => (
                  <div key={item.section} className="rounded-lg border border-line p-4">
                    <p className="font-medium text-foreground">
                      {item.section}: {item.description}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-bodyText">{item.action}</p>
                    <p className="mt-2 text-sm font-semibold text-brand">
                      Potential saving: {formatIndianCurrency(item.estimatedTaxSaving)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-line p-4 text-sm leading-7 text-mutedText">
                  No major missed deductions detected from the information provided.
                </div>
              )}
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
              Total potential additional savings: {formatIndianCurrency(result.totalPotentialSaving)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Breakdown
              </p>
              <h3 className="text-2xl font-bold text-foreground">Tax visualized</h3>
            </div>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => formatIndianCurrency(Number(value))} />
                  <Bar dataKey="taxBeforeCess" fill="#0a0a0a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="totalTax" fill="#16a34a" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})
