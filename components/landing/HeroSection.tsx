"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Lock, Sparkles, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const scoreDimensions = [
  { label: "Emergency fund", value: 84 },
  { label: "Insurance", value: 61 },
  { label: "Debt health", value: 91 },
  { label: "Retirement", value: 58 },
  { label: "Tax efficiency", value: 63 },
  { label: "Investments", value: 74 },
]

export function HeroSection() {
  return (
    <section className="subtle-grid border-b border-line bg-white">
      <div className="section-shell grid min-h-[calc(100vh-80px)] gap-14 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-mutedText">
            For 14 crore+ Indian investors
          </p>
          <div className="space-y-3">
            <h1 className="text-balance text-5xl font-black leading-[0.98] text-foreground sm:text-6xl lg:text-[72px]">
              <span className="block">Your money,</span>
              <span className="block">finally making</span>
              <span className="block text-brand">sense.</span>
            </h1>
            <p className="max-w-2xl text-pretty text-lg leading-8 text-mutedText">
              ArthMitra is the AI financial mentor that 95% of Indians never had.
              No jargon. No advisor fees. Just clarity.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/auth/signup"
              className={cn(buttonVariants({ size: "lg" }), "min-w-[220px]")}
            >
              Start for free
              <ArrowRight />
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-mutedText underline decoration-line underline-offset-4 hover:text-foreground"
            >
              See how it works
            </Link>
          </div>
          <div className="flex flex-col gap-4 border-t border-line pt-6 text-sm text-bodyText sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-brand" />
              <span>Bank-level security</span>
            </div>
            <div className="hidden h-4 w-px bg-line sm:block" />
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              <span>Results in 30 seconds</span>
            </div>
            <div className="hidden h-4 w-px bg-line sm:block" />
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-brand" />
              <span>Always free</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[460px]"
        >
          <Card className="-rotate-2 shadow-soft">
            <div className="border-b border-line px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mutedText">
                Money Health Score
              </p>
            </div>
            <div className="space-y-6 px-6 py-7">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-5xl font-black tracking-[-0.06em] text-foreground">72</p>
                  <p className="text-sm text-mutedText">out of 100</p>
                </div>
                <div className="rounded-full border border-brand/20 bg-brandLight px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                  Stable
                </div>
              </div>
              <div className="space-y-4">
                {scoreDimensions.map((dimension) => (
                  <div key={dimension.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-bodyText">{dimension.label}</span>
                      <span className="font-medium text-foreground">{dimension.value}/100</span>
                    </div>
                    <Progress value={dimension.value} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card className="absolute -right-6 top-10 -z-10 w-[78%] rotate-3 border-dashed bg-surface">
            <div className="space-y-3 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mutedText">
                Today&apos;s focus
              </p>
              <p className="text-lg font-bold leading-7 text-foreground">
                Shift to the better tax regime and free up an extra ₹42,000 this year.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
