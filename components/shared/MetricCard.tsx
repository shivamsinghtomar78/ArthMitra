"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let frameId: number

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setValue(Math.round(easeOutQuart * target))

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [target, duration])

  return value
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
  className,
}: {
  label: string
  value: string
  hint?: string
  tone?: "neutral" | "success" | "warning"
  className?: string
}) {
  const toneClass =
    tone === "success"
      ? "text-brand"
      : tone === "warning"
        ? "text-warning"
        : "text-foreground"

  const match = value.match(/\d+(?:,\d+)*(?:\.\d+)?/)
  const isAnimatable = match !== null && value !== "—"
  
  const targetNumber = isAnimatable ? Number(match[0].replace(/,/g, "")) : 0
  const count = useCountUp(targetNumber, 1200)

  let displayValue = value
  if (isAnimatable) {
    // Re-format the counted value back to localized string
    const formattedCount = count.toLocaleString("en-IN")
    displayValue = value.replace(match[0], formattedCount)
  }

  return (
    <Card className={cn("min-h-[140px]", className)}>
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mutedText">
            {label}
          </p>
          <p className={cn("text-3xl font-heading font-black tracking-[-0.05em]", toneClass)}>
            {displayValue}
          </p>
        </div>
        {hint ? (
          <div className="flex items-center gap-2 text-sm text-bodyText">
            <ArrowUpRight className="size-4 text-brand" />
            <span>{hint}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
