"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingDown,
  TrendingUp,
  Percent,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatIndianCurrency } from "@/lib/utils"
import type { ManualFundEntry } from "@/types"

interface TaxFundState {
  name: string
  category: string
  amountInvested: number
  currentValue: number
  holdingTerm: "long" | "short" | "debt"
  unrealizedGainOrLoss: number
  gainType: "gain" | "loss"
}

export function TaxRebalancingExecutor({
  funds = [],
  recommendedAllocation = [],
}: {
  funds?: ManualFundEntry[]
  recommendedAllocation?: Array<{ name: string; actual: number; recommended: number }>
}) {
  // 1. Interactive settings states
  const [taxSlab, setTaxSlab] = useState<number>(30) // Default 30% slab for Debt
  const [harvestLosses, setHarvestLosses] = useState<boolean>(true)
  const [lockLtcgExemption, setLockLtcgExemption] = useState<boolean>(true)
  const [rebalanceAllocation, setRebalanceAllocation] = useState<boolean>(false)

  // 2. Initialize and manage fund-by-fund states
  const initialFundStates: TaxFundState[] = useMemo(() => {
    return funds.map((fund) => {
      const isDebt = fund.category.toLowerCase().includes("debt") || fund.category.toLowerCase().includes("hybrid")
      const gain = fund.currentValue - fund.amountInvested
      
      return {
        name: fund.name,
        category: fund.category,
        amountInvested: fund.amountInvested,
        currentValue: fund.currentValue,
        holdingTerm: isDebt ? "debt" : "long", // Default equity to Long-term (>1y)
        unrealizedGainOrLoss: Math.abs(gain),
        gainType: gain >= 0 ? "gain" : "loss",
      }
    })
  }, [funds])

  const [fundStates, setFundStates] = useState<TaxFundState[]>(initialFundStates)

  function updateFundState<Key extends keyof TaxFundState>(
    index: number,
    field: Key,
    value: TaxFundState[Key]
  ) {
    setFundStates((current) =>
      current.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    )
  }

  // 3. Tax Math & Harvesting Calculations
  const calculations = useMemo(() => {
    let estStcgGains = 0
    let estLtcgGains = 0
    let estDebtGains = 0

    let harvestableStcl = 0
    let harvestableLtcl = 0

    fundStates.forEach((fund) => {
      const val = fund.unrealizedGainOrLoss
      if (fund.gainType === "gain") {
        if (fund.holdingTerm === "short") {
          estStcgGains += val
        } else if (fund.holdingTerm === "long") {
          estLtcgGains += val
        } else {
          estDebtGains += val
        }
      } else {
        if (fund.holdingTerm === "short" || fund.holdingTerm === "debt") {
          harvestableStcl += val
        } else {
          harvestableLtcl += val
        }
      }
    })

    // Calculate baseline tax liability (WITHOUT harvesting/optimizing realized losses)
    // In this case, active loss offsets are 0 because the user hasn't harvested/sold anything.
    const baselineLtcgTax = Math.max(0, estLtcgGains - 125000) * 0.125
    const baselineStcgTax = estStcgGains * 0.20
    const baselineDebtTax = estDebtGains * (taxSlab / 100)
    const baselineTotalTax = (baselineLtcgTax + baselineStcgTax + baselineDebtTax) * 1.04 // 4% Cess

    // Calculate optimized tax liability (WITH harvesting/optimizing enabled)
    const activeStcl = harvestLosses ? harvestableStcl : 0
    const activeLtcl = harvestLosses ? harvestableLtcl : 0

    // Offset LT Losses first against LT Equity Gains
    const remainingLtcgGains = Math.max(0, estLtcgGains - activeLtcl)

    // Offset ST Losses: ST losses can offset STCG first, then Debt Gains, then remaining LTCG
    let remainingStcl = activeStcl
    
    const remainingStcgGains = Math.max(0, estStcgGains - remainingStcl)
    remainingStcl = Math.max(0, remainingStcl - estStcgGains)

    const remainingDebtGains = Math.max(0, estDebtGains - remainingStcl)
    remainingStcl = Math.max(0, remainingStcl - estDebtGains)

    const remainingLtcgAfterStcl = Math.max(0, remainingLtcgGains - remainingStcl)

    // Calculate optimized taxes
    const optLtcgTax = Math.max(0, remainingLtcgAfterStcl - 125000) * 0.125
    const optStcgTax = remainingStcgGains * 0.20
    const optDebtTax = remainingDebtGains * (taxSlab / 100)
    const optTotalTax = (optLtcgTax + optStcgTax + optDebtTax) * 1.04 // 4% Cess

    // LTCG Exemption Lock-in logic (Harvest gains tax-free up to ₹1.25L threshold)
    const currentRealizedLtcg = remainingLtcgAfterStcl
    const remainingLtcgHeadroom = Math.max(0, 125000 - currentRealizedLtcg)
    
    // Find how much additional LTCG can be locked in tax-free from current Long Term gains
    // which are NOT yet harvested (i.e. we have room to lock them in if the toggle is checked)
    let potentialLtcgToLock = 0
    if (lockLtcgExemption && remainingLtcgHeadroom > 0) {
      // Find long-term equity funds with unrealized gains that haven't been accounted for yet
      fundStates.forEach((fund) => {
        if (fund.holdingTerm === "long" && fund.gainType === "gain") {
          potentialLtcgToLock += fund.unrealizedGainOrLoss
        }
      })
      potentialLtcgToLock = Math.min(potentialLtcgToLock, remainingLtcgHeadroom)
    }

    const futureLtcgTaxSaved = potentialLtcgToLock * 0.125 * 1.04 // 12.5% tax + 4% cess saved in future
    const instantTaxSaved = Math.max(0, baselineTotalTax - optTotalTax)
    const totalTaxSaved = instantTaxSaved + futureLtcgTaxSaved

    return {
      baselineTotalTax,
      optTotalTax,
      instantTaxSaved,
      futureLtcgTaxSaved,
      totalTaxSaved,
      remainingLtcgHeadroom,
      potentialLtcgToLock,
      estStcgGains,
      estLtcgGains,
      estDebtGains,
      harvestableStcl,
      harvestableLtcl,
      remainingStcgGains,
      remainingLtcgAfterStcl,
      remainingDebtGains
    }
  }, [fundStates, taxSlab, harvestLosses, lockLtcgExemption])

  // 4. Allocation rebalancing suggestions
  const rebalancingSteps = useMemo(() => {
    if (!rebalanceAllocation || !recommendedAllocation.length) return []
    
    const steps: string[] = []
    
    // Sort actual vs recommended deviations
    recommendedAllocation.forEach((alloc) => {
      const deviation = alloc.actual - alloc.recommended
      const absoluteDeviationAmount = Math.round((Math.abs(deviation) / 100) * calculations.baselineTotalTax * 15) // Approximate corpus weight
      
      if (deviation > 3 && absoluteDeviationAmount > 5000) {
        // Over-allocated: Recommend Sell
        steps.push(
          `Over-allocated in ${alloc.name} by ${alloc.actual - alloc.recommended}%. Redeem around ₹${absoluteDeviationAmount.toLocaleString("en-IN")} in a tax-optimal way (starting with loss-making assets first).`
        )
      } else if (deviation < -3 && absoluteDeviationAmount > 5000) {
        // Under-allocated: Recommend Buy
        steps.push(
          `Under-allocated in ${alloc.name} by ${alloc.recommended - alloc.actual}%. Reinvest ₹${absoluteDeviationAmount.toLocaleString("en-IN")} here to restore your recommended risk mix.`
        )
      }
    })

    return steps
  }, [rebalanceAllocation, recommendedAllocation, calculations])

  // 5. Generate Execution checklist steps
  const executionChecklist = useMemo(() => {
    const checklist: Array<{ id: string; text: string; detail: string; highlight: string }> = []

    // 1. Loss harvesting steps
    if (harvestLosses && (calculations.harvestableStcl > 0 || calculations.harvestableLtcl > 0)) {
      fundStates.forEach((fund) => {
        if (fund.gainType === "loss") {
          checklist.push({
            id: `harvest-${fund.name}`,
            text: `Redeem units in ${fund.name} to realize ₹${fund.unrealizedGainOrLoss.toLocaleString("en-IN")} of losses.`,
            detail: `This creates a realized capital loss which offsets your current taxable gains, saving you up to 20.8% in taxes immediately.`,
            highlight: "Harvest Loss"
          })
        }
      })
    }

    // 2. LTCG Exemption Lock-in steps
    if (lockLtcgExemption && calculations.potentialLtcgToLock > 0) {
      let lockedAmount = 0
      fundStates.forEach((fund) => {
        if (fund.holdingTerm === "long" && fund.gainType === "gain" && lockedAmount < calculations.potentialLtcgToLock) {
          const roomLeft = calculations.potentialLtcgToLock - lockedAmount
          const amountToSell = Math.min(fund.unrealizedGainOrLoss, roomLeft)
          lockedAmount += amountToSell

          checklist.push({
            id: `lock-${fund.name}`,
            text: `Sell units of ${fund.name} to capture ₹${amountToSell.toLocaleString("en-IN")} of LTCG, then buy back immediately.`,
            detail: `This uses your ₹1.25 Lakhs tax-free LTCG exemption threshold to reset your cost basis upward. You pay ₹0 tax today and lock in ₹${Math.round(amountToSell * 0.125 * 1.04).toLocaleString("en-IN")} of future tax savings.`,
            highlight: "Tax-Free Reset"
          })
        }
      })
    }

    // 3. Rebalancing steps
    if (rebalanceAllocation && rebalancingSteps.length > 0) {
      rebalancingSteps.forEach((step, idx) => {
        checklist.push({
          id: `rebalance-${idx}`,
          text: step,
          detail: "Rebalancing ensures your portfolio does not carry excess risk or drag relative to your selected risk appetite.",
          highlight: "Rebalance"
        })
      })
    }

    // Default step if nothing is selected
    if (checklist.length === 0) {
      checklist.push({
        id: "default-step",
        text: "Select optimization triggers above (Loss Harvesting or LTCG reset) to generate custom execution steps.",
        detail: "Toggle the harvesting and rebalancing switches on the left card to customize your workflow.",
        highlight: "Info"
      })
    }

    return checklist
  }, [fundStates, harvestLosses, lockLtcgExemption, rebalanceAllocation, calculations, rebalancingSteps])

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr] animate-fade-in">
      {/* LEFT COLUMN: Controls & Fund Editor */}
      <div className="space-y-6">
        {/* Simulator controls */}
        <Card className="shadow-soft border-line bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Zap className="size-5 text-brand" />
              Tax Optimization Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Your Debt Slab Rate
                  <span className="group relative cursor-pointer text-mutedText hover:text-foreground">
                    <Info className="size-3.5" />
                    <span className="absolute bottom-full left-1/2 z-10 hidden w-64 -translate-x-1/2 rounded bg-black p-2 text-xs leading-normal text-white group-hover:block">
                      Debt mutual fund gains are taxed as ordinary income according to your regular income tax bracket.
                    </span>
                  </span>
                </label>
                <Select
                  value={String(taxSlab)}
                  onValueChange={(val) => setTaxSlab(Number(val))}
                >
                  <SelectTrigger className="bg-surface border-line">
                    <SelectValue placeholder="Select Slab Rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 30, 39].map((slab) => (
                      <SelectItem key={slab} value={String(slab)}>
                        {slab}% Slab Rate
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col justify-end">
                <p className="text-xs text-mutedText leading-relaxed">
                  Calculates taxes under Indian FY 2024-25 guidelines. Equity STCG is taxed at 20%, LTCG at 12.5% with ₹1.25L free limits.
                </p>
              </div>
            </div>

            <div className="stat-line" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mutedText">
                Optimization Triggers
              </p>
              <div className="space-y-3">
                {[
                  {
                    id: "losses",
                    label: "Harvest Unrealized Losses",
                    desc: "Redeem loss-making holdings to offset existing tax liabilities.",
                    checked: harvestLosses,
                    onChange: setHarvestLosses,
                  },
                  {
                    id: "exemption",
                    label: "Lock-in LTCG Exemption",
                    desc: "Capture up to ₹1.25L of tax-free Equity LTCG and reset the cost basis.",
                    checked: lockLtcgExemption,
                    onChange: setLockLtcgExemption,
                  },
                  {
                    id: "rebalance",
                    label: "Allocation Rebalancing",
                    desc: "Trigger trades to restore your recommended category splits.",
                    checked: rebalanceAllocation,
                    onChange: setRebalanceAllocation,
                  },
                ].map((trigger) => (
                  <label
                    key={trigger.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                      trigger.checked
                        ? "border-brand bg-brandLight/30"
                        : "border-line hover:bg-surface/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={trigger.checked}
                      onChange={(e) => trigger.onChange(e.target.checked)}
                      className="mt-1 size-4 rounded accent-brand"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground text-sm">{trigger.label}</p>
                      <p className="mt-1 text-xs text-mutedText leading-normal">{trigger.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Parameter Editor */}
        <Card className="shadow-soft border-line bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              <span>Fund Gain & Term Configuration</span>
              <span className="text-xs font-normal text-mutedText">Customize holding details below</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fundStates.length === 0 ? (
              <p className="text-sm text-mutedText p-4 text-center">No funds available. Please input manual portfolios or parse CAMS PDF statement.</p>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {fundStates.map((fund, index) => (
                  <div
                    key={fund.name}
                    className="rounded-lg border border-line p-4 space-y-4 bg-surface/30 hover:border-brand/30 transition-colors"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="font-bold text-foreground truncate max-w-sm sm:max-w-md">{fund.name}</h4>
                        <p className="text-xs text-mutedText">{fund.category}</p>
                      </div>
                      <span className="text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-medium self-start sm:self-center">
                        Value: {formatIndianCurrency(fund.currentValue)}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {/* Term Toggle */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-mutedText uppercase">Holding Term</label>
                        <Select
                          value={fund.holdingTerm}
                          onValueChange={(val) =>
                            updateFundState(index, "holdingTerm", val as never)
                          }
                        >
                          <SelectTrigger className="h-9 bg-white border-line text-xs font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="long">Equity Long (&gt;1y)</SelectItem>
                            <SelectItem value="short">Equity Short (&lt;1y)</SelectItem>
                            <SelectItem value="debt">Debt / Slab Asset</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Gain or Loss Type Toggle */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-mutedText uppercase">Gain Status</label>
                        <div className="flex h-9 rounded-md border border-line p-0.5 bg-white">
                          <button
                            type="button"
                            onClick={() => updateFundState(index, "gainType", "gain")}
                            className={`flex-1 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                              fund.gainType === "gain"
                                ? "bg-brandLight text-brand"
                                : "text-mutedText hover:text-foreground"
                            }`}
                          >
                            <TrendingUp className="size-3" /> Gains
                          </button>
                          <button
                            type="button"
                            onClick={() => updateFundState(index, "gainType", "loss")}
                            className={`flex-1 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                              fund.gainType === "loss"
                                ? "bg-danger/10 text-danger"
                                : "text-mutedText hover:text-foreground"
                            }`}
                          >
                            <TrendingDown className="size-3" /> Losses
                          </button>
                        </div>
                      </div>

                      {/* Gain/Loss Amount Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-mutedText uppercase">
                          Unrealized {fund.gainType === "gain" ? "Gains" : "Losses"}
                        </label>
                        <Input
                          type="number"
                          className="h-9 bg-white border-line text-xs font-bold text-foreground"
                          value={fund.unrealizedGainOrLoss || ""}
                          min={0}
                          max={fund.currentValue}
                          onChange={(e) =>
                            updateFundState(
                              index,
                              "unrealizedGainOrLoss",
                              Math.min(fund.currentValue, Number(e.target.value))
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Results, Live Counter, Execution Plan */}
      <div className="space-y-6">
        {/* Live Saved Tax Banner */}
        <Card className="overflow-hidden border-2 border-brand bg-brandLight/10 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full -translate-y-12 translate-x-12" />
          <CardContent className="p-6 relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> Real-Time Optimization Yield
            </p>
            <div className="mt-4 flex flex-col justify-between sm:flex-row sm:items-end">
              <div>
                <h3 className="text-sm font-semibold text-mutedText">Total Tax Saved Today</h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={calculations.totalTaxSaved}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="mt-1 text-5xl font-black tracking-tight text-brand font-heading"
                  >
                    {formatIndianCurrency(calculations.totalTaxSaved)}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="mt-4 sm:mt-0 text-left sm:text-right border-l-2 border-l-brand/20 pl-4 sm:border-l-0 sm:pl-0">
                <p className="text-xs font-medium text-mutedText leading-relaxed">
                  Instant Savings: <span className="font-bold text-foreground">{formatIndianCurrency(calculations.instantTaxSaved)}</span>
                </p>
                <p className="mt-1 text-xs font-medium text-mutedText leading-relaxed">
                  Future Exemption Locking: <span className="font-bold text-foreground">{formatIndianCurrency(calculations.futureLtcgTaxSaved)}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capital Gains Summary */}
        <Card className="shadow-soft border-line bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Capital Gains & Exposure Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "LTCG Gains (Equity)",
                  val: calculations.estLtcgGains,
                  color: "text-foreground",
                  desc: "Held > 1 Year"
                },
                {
                  label: "STCG Gains (Equity)",
                  val: calculations.estStcgGains,
                  color: "text-foreground",
                  desc: "Held < 1 Year"
                },
                {
                  label: "Debt / Slab gains",
                  val: calculations.estDebtGains,
                  color: "text-foreground",
                  desc: `Taxed at ${taxSlab}%`
                }
              ].map((item) => (
                <div key={item.label} className="bg-surface rounded-lg p-4 border border-line text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mutedText block">
                    {item.label}
                  </span>
                  <span className={`text-xl font-extrabold block mt-2 ${item.color}`}>
                    {formatIndianCurrency(item.val)}
                  </span>
                  <span className="text-[10px] text-mutedText block mt-1">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-danger/5 rounded-lg p-4 border border-danger/10">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-danger block">
                  Harvestable Losses
                </span>
                <span className="text-xl font-extrabold block mt-2 text-danger">
                  {formatIndianCurrency(calculations.harvestableStcl + calculations.harvestableLtcl)}
                </span>
                <span className="text-[10px] text-mutedText block mt-1">
                  STCL: {formatIndianCurrency(calculations.harvestableStcl)} | LTCL: {formatIndianCurrency(calculations.harvestableLtcl)}
                </span>
              </div>

              <div className="bg-brandLight/20 rounded-lg p-4 border border-brand/10">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand block">
                  LTCG Tax-free Headroom
                </span>
                <span className="text-xl font-extrabold block mt-2 text-brand">
                  {formatIndianCurrency(calculations.remainingLtcgHeadroom)}
                </span>
                <span className="text-[10px] text-mutedText block mt-1">
                  Exempt limit: ₹1,25,000 / year
                </span>
              </div>
            </div>

            <div className="stat-line" />

            {/* Tax Comparison */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm leading-relaxed">
                <span className="text-bodyText font-medium">Standard Tax Liability (Before Optimization)</span>
                <span className="font-bold text-foreground">{formatIndianCurrency(calculations.baselineTotalTax)}</span>
              </div>
              <div className="flex justify-between text-sm leading-relaxed">
                <span className="text-bodyText font-medium">Optimized Tax Liability (Today)</span>
                <span className="font-bold text-brand">{formatIndianCurrency(calculations.optTotalTax)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-line pt-2 font-bold leading-relaxed">
                <span className="text-foreground">Immediate Cash Tax Saved</span>
                <span className="text-brand">{formatIndianCurrency(calculations.instantTaxSaved)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Execution Rebalancing Plan Checklist */}
        <Card className="shadow-soft border-line bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <span>Execution Trade Checklist</span>
              <span className="text-xs bg-slate-100 border px-2 py-0.5 rounded text-mutedText font-normal">
                {executionChecklist.length} Action{executionChecklist.length === 1 ? "" : "s"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-line border-t border-line">
              {executionChecklist.map((item) => (
                <div key={item.id} className="p-5 flex gap-4 items-start bg-white hover:bg-surface/30 transition-colors">
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      className="size-4 rounded accent-brand cursor-pointer"
                      id={`check-${item.id}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          item.highlight === "Harvest Loss"
                            ? "bg-danger/10 text-danger"
                            : item.highlight === "Tax-Free Reset"
                              ? "bg-brandLight text-brand"
                              : item.highlight === "Rebalance"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.highlight}
                      </span>
                      <label htmlFor={`check-${item.id}`} className="font-bold text-foreground text-sm cursor-pointer hover:text-brand transition-colors select-none">
                        {item.text}
                      </label>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-mutedText">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-5 bg-surface/50 border-t border-line rounded-b-lg flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-mutedText flex items-center gap-1">
                <CheckCircle className="size-3.5 text-brand" /> Check items off as you execute them in your broker account.
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="h-8 text-xs font-semibold uppercase tracking-[0.14em]"
              >
                Print Action Steps
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
