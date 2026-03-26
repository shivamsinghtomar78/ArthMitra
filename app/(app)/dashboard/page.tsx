"use client"

import Link from "next/link"
import { ArrowRight, Clock3, Flame, PieChart, ReceiptText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { StatsRow } from "@/components/dashboard/StatsRow"
import { InsightCards } from "@/components/dashboard/InsightCards"
import { useAppStore } from "@/store/useAppStore"
import { formatDateLabel, formatIndianCurrency, formatShortCurrency, getGreeting } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const profile = useAppStore((state) => state.profile)
  const financials = useAppStore((state) => state.financials)
  const results = useAppStore((state) => state.results)
  const monthlySurplus = (financials?.monthlyIncome || 0) - (financials?.monthlyExpense || 0)
  const fireTargetYear =
    results.fireplan && profile ? new Date().getFullYear() + results.fireplan.yearsToFIRE : undefined

  const stats = [
    {
      label: "Monthly Surplus",
      value: monthlySurplus ? formatIndianCurrency(monthlySurplus) : "—",
      hint: monthlySurplus > 0 ? "Available to save and invest" : "Complete onboarding to see this",
      tone: monthlySurplus > 0 ? "success" : "neutral",
    },
    {
      label: "Health Score",
      value: results.healthScore ? `${results.healthScore.overallScore}/100` : "—",
      hint: results.healthScore?.label || "Take the 5-min quiz →",
      tone: results.healthScore && results.healthScore.overallScore >= 75 ? "success" : results.healthScore ? "warning" : "neutral",
    },
    {
      label: "FIRE Target Date",
      value: fireTargetYear ? String(fireTargetYear) : "—",
      hint: results.fireplan ? `${results.fireplan.yearsToFIRE} years away` : "Run the FIRE planner →",
      tone: fireTargetYear ? "success" : "neutral",
    },
    {
      label: "Est. Tax Savings",
      value: results.taxAnalysis ? formatIndianCurrency(results.taxAnalysis.taxSaving) : "—",
      hint: results.taxAnalysis
        ? `Best under ${results.taxAnalysis.betterRegime === "old" ? "old" : "new"} regime`
        : "Compare both regimes →",
      tone: results.taxAnalysis && results.taxAnalysis.taxSaving > 0 ? "success" : "neutral",
    },
  ] as const

  const insights = [
    results.taxAnalysis
      ? {
          title: "Tax opportunity",
          body: `${results.taxAnalysis.betterRegime === "old" ? "Old" : "New"} regime saves you ${formatIndianCurrency(
            results.taxAnalysis.taxSaving
          )} this year.`,
          href: "/tools/tax",
        }
      : {
          title: "Tax opportunity",
          body: "Run the tax wizard to compare both regimes and uncover missed deductions.",
          href: "/tools/tax",
        },
    results.fireplan
      ? {
          title: "Retirement readiness",
          body: `Your recommended SIP is ${formatIndianCurrency(
            results.fireplan.recommendedMonthlySIP
          )} per month. ${
            results.fireplan.sipGap > 0
              ? `You still have a gap of ${formatIndianCurrency(results.fireplan.sipGap)}.`
              : "You are on track if you stay consistent."
          }`,
          href: "/tools/fire",
        }
      : {
          title: "Retirement readiness",
          body: "Run the FIRE planner to turn your current surplus into a target retirement date.",
          href: "/tools/fire",
        },
  ]

  const activity = [
    results.fireplan?.updatedAt
      ? { label: "Ran FIRE Planner", date: results.fireplan.updatedAt, href: "/tools/fire" }
      : null,
    results.taxAnalysis?.updatedAt
      ? { label: "Compared tax regimes", date: results.taxAnalysis.updatedAt, href: "/tools/tax" }
      : null,
    results.healthScore?.updatedAt
      ? {
          label: "Updated Money Health Score",
          date: results.healthScore.updatedAt,
          href: "/tools/health-score",
        }
      : null,
    results.mfXray?.updatedAt
      ? { label: "Analysed mutual fund portfolio", date: results.mfXray.updatedAt, href: "/tools/mf-xray" }
      : null,
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime())
    .slice(0, 3) as Array<{ label: string; date: string; href: string }>

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mutedText">
          {getGreeting()}
        </p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-[-0.05em]">
              {getGreeting()}, {profile?.name?.split(" ")[0] || "there"}.
            </h1>
            <p className="text-lg leading-8 text-bodyText">
              {results.healthScore
                ? `Your financial health score is ${results.healthScore.overallScore}/100. Here's what to focus on today.`
                : "You’ve built your profile. Now run the first tools and turn it into an action plan."}
            </p>
          </div>
        </div>
      </section>

      <StatsRow items={[...stats]} />

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link href="/tools/tax" className="rounded-lg border border-line p-5 transition-colors hover:border-brand">
              <ReceiptText className="mb-4 size-5 text-brand" />
              <p className="text-xl font-bold text-foreground">Run Tax Wizard</p>
              <p className="mt-2 text-sm leading-7 text-bodyText">
                Compare regimes, spot missed deductions, and lower your annual tax bill.
              </p>
            </Link>
            <Link href="/tools/mf-xray" className="rounded-lg border border-line p-5 transition-colors hover:border-brand">
              <PieChart className="mb-4 size-5 text-brand" />
              <p className="text-xl font-bold text-foreground">Analyse My Portfolio</p>
              <p className="mt-2 text-sm leading-7 text-bodyText">
                Detect overlaps, benchmark expenses, and rebalance with confidence.
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length ? (
              activity.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg border border-line px-4 py-4 transition-colors hover:border-brand"
                >
                  <div className="flex items-center gap-3">
                    <Clock3 className="size-4 text-brand" />
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-mutedText">{formatDateLabel(item.date)}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-mutedText" />
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line p-5 text-sm leading-7 text-mutedText">
                No recent activity yet. Start with the FIRE planner or the tax wizard.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">AI insights</h2>
          <Link href="/tools/fire" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Open tools
          </Link>
        </div>
        <InsightCards insights={insights} />
      </section>

      <section className="rounded-lg border border-line bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mutedText">
              Snapshot
            </p>
            <h2 className="mt-2 text-2xl font-bold">Your current baseline</h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-bodyText">
            <Flame className="size-4 text-brand" />
            {financials?.currentSavings
              ? `Current savings + investments: ${formatShortCurrency(
                  financials.currentSavings + financials.existingInvestments
                )}`
              : "Add more data from the tools to strengthen your plan."}
          </div>
        </div>
      </section>
    </div>
  )
}
