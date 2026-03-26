"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Rocket, Shield, Target } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CurrencyInput } from "@/components/shared/CurrencyInput"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useAuth } from "@/hooks/useAuth"
import { useFirestore } from "@/hooks/useFirestore"
import type { Occupation, RiskProfile } from "@/types"
import { useAppStore } from "@/store/useAppStore"

const cityOptions = [
  "Bengaluru",
  "Delhi",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Ahmedabad",
  "Kolkata",
]

const goalOptions = [
  "Retire Early",
  "Buy a house",
  "Child's education",
  "Build emergency fund",
  "Travel",
  "Start a business",
]

const riskOptions: Array<{
  value: RiskProfile
  title: string
  description: string
  icon: typeof Shield
}> = [
  {
    value: "conservative",
    title: "Conservative",
    description: "Steady growth with lower volatility.",
    icon: Shield,
  },
  {
    value: "moderate",
    title: "Moderate",
    description: "Balanced across growth and stability.",
    icon: Target,
  },
  {
    value: "aggressive",
    title: "Aggressive",
    description: "Higher upside with higher swings.",
    icon: Rocket,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, authLoading } = useAuth()
  const profile = useAppStore((state) => state.profile)
  const financials = useAppStore((state) => state.financials)
  const { saveOnboarding } = useFirestore()

  const [step, setStep] = useState(1)
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<{
    name: string
    age: number
    city: string
    occupation: Occupation
    monthlyIncome: number
    monthlyExpense: number
    currentSavings: number
    existingInvestments: number
    loans: number
    retirementAge: number
    riskProfile: RiskProfile
    goals: string[]
  }>({
    name: profile?.name || user?.displayName || "",
    age: profile?.age || 28,
    city: profile?.city || "Bengaluru",
    occupation: profile?.occupation ?? "Salaried",
    monthlyIncome: financials?.monthlyIncome || 80000,
    monthlyExpense: financials?.monthlyExpense || 45000,
    currentSavings: financials?.currentSavings || 200000,
    existingInvestments: financials?.existingInvestments || 150000,
    loans: financials?.loans || 0,
    retirementAge: financials?.retirementAge || 55,
    riskProfile: financials?.riskProfile || ("moderate" as RiskProfile),
    goals: profile?.goals || ["Retire Early"],
  })

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      router.replace("/auth/login")
      return
    }

    if (profile?.onboardingComplete) {
      router.replace("/dashboard")
    }
  }, [authLoading, profile?.onboardingComplete, router, user])

  const progress = useMemo(() => (step / 3) * 100, [step])

  function updateValue<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function toggleGoal(goal: string) {
    setForm((current) => ({
      ...current,
      goals: current.goals.includes(goal)
        ? current.goals.filter((item) => item !== goal)
        : [...current.goals, goal],
    }))
  }

  function validateStep() {
    if (step === 1) {
      if (!form.name.trim() || !form.city.trim()) {
        return "Complete your basic profile before continuing."
      }
    }

    if (step === 2) {
      if (form.monthlyIncome <= 0 || form.monthlyExpense < 0) {
        return "Add your income and expenses to continue."
      }
    }

    if (step === 3) {
      if (form.goals.length === 0) {
        return "Pick at least one primary financial goal."
      }
    }

    return undefined
  }

  async function handleNext() {
    const validationError = validateStep()

    if (validationError) {
      setError(validationError)
      return
    }

    setError(undefined)

    if (step < 3) {
      setStep((current) => current + 1)
      return
    }

    if (!user) {
      return
    }

    setSaving(true)

    try {
      await saveOnboarding(user.uid, {
        profile: {
          name: form.name,
          age: form.age,
          city: form.city,
          occupation: form.occupation as Occupation,
          goals: form.goals,
        },
        financials: {
          monthlyIncome: form.monthlyIncome,
          monthlyExpense: form.monthlyExpense,
          currentSavings: form.currentSavings,
          existingInvestments: form.existingInvestments,
          loans: form.loans,
          riskProfile: form.riskProfile,
          retirementAge: form.retirementAge,
        },
      })
      toast.success("Profile saved! Generating your plan...")
      router.replace("/dashboard")
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save your onboarding details."
      )
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <LoadingSpinner label="Loading onboarding" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white py-10">
      <div className="section-shell max-w-4xl space-y-8">
        <div className="space-y-5">
          <Progress value={progress} />
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Step {step} of 3
            </p>
            <h1 className="text-4xl font-black tracking-[-0.05em]">
              {step === 1
                ? "Tell us about you"
                : step === 2
                  ? "Your money picture"
                  : "Your goals"}
            </h1>
          </div>
        </div>

        <Card className="p-6">
          {step === 1 ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground">Full Name</label>
                <Input value={form.name} onChange={(event) => updateValue("name", event.target.value)} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">Age</label>
                  <span className="text-3xl font-black tracking-[-0.05em] text-foreground">
                    {form.age}
                  </span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={65}
                  value={form.age}
                  onChange={(event) => updateValue("age", Number(event.target.value))}
                  className="w-full accent-[#16a34a]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">City</label>
                <Input
                  list="indian-cities"
                  value={form.city}
                  onChange={(event) => updateValue("city", event.target.value)}
                />
                <datalist id="indian-cities">
                  {cityOptions.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground">Occupation</label>
                <Select
                  value={form.occupation}
                  onValueChange={(value) =>
                    updateValue("occupation", (value ?? "Salaried") as Occupation)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Salaried", "Self-employed", "Business owner", "Student", "Other"].map(
                      (occupation) => (
                        <SelectItem key={occupation} value={occupation}>
                          {occupation}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[
                ["monthlyIncome", "Monthly take-home income"],
                ["monthlyExpense", "Monthly expenses"],
                ["currentSavings", "Current savings"],
                ["existingInvestments", "Existing investments"],
                ["loans", "Any loans / EMIs"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">{label}</label>
                  <CurrencyInput
                    value={form[key as keyof typeof form] as number}
                    onChange={(val) =>
                      updateValue(key as keyof typeof form, val as never)
                    }
                  />
                </div>
              ))}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    I want to retire by age
                  </label>
                  <span className="text-3xl font-black tracking-[-0.05em] text-foreground">
                    {form.retirementAge}
                  </span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={65}
                  value={form.retirementAge}
                  onChange={(event) => updateValue("retirementAge", Number(event.target.value))}
                  className="w-full accent-[#16a34a]"
                />
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground">Risk appetite</p>
                <div className="grid gap-4 md:grid-cols-3">
                  {riskOptions.map((option) => {
                    const Icon = option.icon
                    const selected = form.riskProfile === option.value

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateValue("riskProfile", option.value)}
                        className={`rounded-lg border p-5 text-left transition-colors ${
                          selected
                            ? "border-brand bg-brandLight"
                            : "border-line hover:border-brand/40"
                        }`}
                      >
                        <Icon className="mb-5 size-5 text-brand" />
                        <p className="font-heading text-xl font-bold text-foreground">{option.title}</p>
                        <p className="mt-2 text-sm leading-7 text-bodyText">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground">Primary financial goal</p>
                <div className="flex flex-wrap gap-3">
                  {goalOptions.map((goal) => {
                    const selected = form.goals.includes(goal)

                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`border px-4 py-3 text-sm font-medium transition-colors ${
                          selected
                            ? "border-brand bg-brandLight text-foreground"
                            : "border-line text-bodyText hover:border-brand/40"
                        }`}
                      >
                        {goal}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        <ErrorMessage message={error} />

        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={step === 1 || saving}
          >
            Back
          </Button>
          <Button
            type="button"
            size="lg"
            className={step === 3 ? "bg-brand text-white hover:bg-[#15803d]" : undefined}
            onClick={handleNext}
            disabled={saving}
          >
            {saving ? "Saving..." : step === 3 ? "Generate My Plan →" : "Next"}
          </Button>
        </div>
      </div>
    </main>
  )
}
