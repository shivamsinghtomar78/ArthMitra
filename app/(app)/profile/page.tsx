"use client"

import Link from "next/link"
import { Database, RefreshCcw, ShieldCheck, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"
import { formatIndianCurrency } from "@/lib/utils"
import { isFirebaseConfigured } from "@/lib/firebase"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const profile = useAppStore((state) => state.profile)
  const financials = useAppStore((state) => state.financials)
  const results = useAppStore((state) => state.results)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Profile & settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-line p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">Name</p>
              <p className="mt-3 text-2xl font-bold text-foreground">{profile?.name || "Not set"}</p>
            </div>
            <div className="rounded-lg border border-line p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">City</p>
              <p className="mt-3 text-2xl font-bold text-foreground">{profile?.city || "Not set"}</p>
            </div>
            <div className="rounded-lg border border-line p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">Age</p>
              <p className="mt-3 text-2xl font-bold text-foreground">{profile?.age || "—"}</p>
            </div>
            <div className="rounded-lg border border-line p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">Risk profile</p>
              <p className="mt-3 text-2xl font-bold capitalize text-foreground">
                {financials?.riskProfile || "Not set"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-line p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Monthly income
              </p>
              <p className="mt-3 text-2xl font-bold text-foreground">
                {financials ? formatIndianCurrency(financials.monthlyIncome) : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-line p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mutedText">
                Monthly expenses
              </p>
              <p className="mt-3 text-2xl font-bold text-foreground">
                {financials ? formatIndianCurrency(financials.monthlyExpense) : "—"}
              </p>
            </div>
          </div>

          <Link href="/onboarding" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            <RefreshCcw className="size-4" />
            Update onboarding
          </Link>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Connected services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-line p-5">
              <div className="flex items-center gap-3">
                <Database className="size-4 text-brand" />
                <p className="font-medium text-foreground">Firebase</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-bodyText">
                {isFirebaseConfigured
                  ? "Authentication and Firestore are configured."
                  : "Add NEXT_PUBLIC_FIREBASE_* values in .env.local."}
              </p>
            </div>
            <div className="rounded-lg border border-line p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="size-4 text-brand" />
                <p className="font-medium text-foreground">AI tools</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-bodyText">
                FIRE, tax, health score, and MF X-Ray results appear here after you run them.
              </p>
            </div>
            <div className="rounded-lg border border-line p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-brand" />
                <p className="font-medium text-foreground">Security posture</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-bodyText">
                ArthMitra stores your profile baseline and computed insights so the dashboard stays personalized.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-bodyText">
            <p>Health Score: {results.healthScore ? "Ready" : "Pending"}</p>
            <p>FIRE Planner: {results.fireplan ? "Ready" : "Pending"}</p>
            <p>Tax Wizard: {results.taxAnalysis ? "Ready" : "Pending"}</p>
            <p>MF X-Ray: {results.mfXray ? "Ready" : "Pending"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
