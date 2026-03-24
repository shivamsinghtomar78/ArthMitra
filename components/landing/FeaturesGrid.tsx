"use client"

import { motion } from "framer-motion"
import {
  CircleCheckBig,
  Flame,
  HeartPulse,
  PieChart,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Flame,
    title: "FIRE Path Planner",
    description:
      "Tell us your age and income. Get a month-by-month roadmap to retire early.",
    tag: "Most popular",
  },
  {
    icon: CircleCheckBig,
    title: "Tax Wizard",
    description:
      "Old regime vs new regime. Every deduction found. Maximum savings guaranteed.",
  },
  {
    icon: PieChart,
    title: "MF Portfolio X-Ray",
    description:
      "Upload your CAMS statement or enter funds manually. Discover overlaps and get rebalancing suggestions.",
  },
  {
    icon: HeartPulse,
    title: "Money Health Score",
    description:
      "A 5-minute check-up across 6 financial dimensions. Know where you stand.",
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
            Four tools. One financial life.
          </h2>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid gap-6 md:grid-cols-2"
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
                      {feature.tag ? <Badge variant="success">{feature.tag}</Badge> : null}
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
