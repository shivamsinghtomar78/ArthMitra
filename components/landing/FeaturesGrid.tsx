"use client"

import { motion } from "framer-motion"
import {
  CircleCheckBig,
  Flame,
  Heart,
  HeartPulse,
  PieChart,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Flame,
    title: "FIRE Path Planner",
    description:
      "Tell us your age and income. Get a month-by-month roadmap to retire early — with SIP amounts, asset allocation, and a 20-year projection chart.",
    tag: "Most popular",
  },
  {
    icon: CircleCheckBig,
    title: "Tax Wizard",
    description:
      "Old regime vs new regime — side by side. Every missed deduction found. Maximum savings calculated with exact ₹ amounts.",
  },
  {
    icon: PieChart,
    title: "MF Portfolio X-Ray",
    description:
      "Upload your CAMS statement or enter funds manually. Discover overlaps, compare expense ratios, and get AI rebalancing advice.",
  },
  {
    icon: HeartPulse,
    title: "Money Health Score",
    description:
      "A 5-minute check-up across 6 financial dimensions — emergency fund, insurance, investments, debt, tax, and retirement readiness.",
  },
  {
    icon: Sparkles,
    title: "Life Event Advisor",
    description:
      "Got a bonus? Getting married? Buying a home? Select your life event and get a priority-ranked action plan with a step-by-step timeline.",
    tag: "New",
  },
  {
    icon: Heart,
    title: "Couple's Money Planner",
    description:
      "India's first AI joint finance optimizer. Enter both incomes and get optimized SIP splits, HRA claims, NPS matching, and insurance recommendations.",
    tag: "New",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="bg-surface py-24">
      <div className="section-shell space-y-14">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mutedText">
            What ArthMitra does
          </p>
          <h2 className="text-balance text-4xl font-black sm:text-5xl">
            Six AI tools. One financial life.
          </h2>
          <p className="mx-auto max-w-xl text-base leading-8 text-bodyText">
            From retiring early to filing taxes to planning as a couple — every major financial decision, covered.
          </p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Card className="h-full">
                  <CardHeader className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg border border-brand/15 bg-white text-brand">
                        <Icon className="size-5" />
                      </div>
                      {feature.tag ? (
                        <Badge variant={feature.tag === "New" ? "default" : "success"}>
                          {feature.tag}
                        </Badge>
                      ) : null}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base leading-8 text-bodyText">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
