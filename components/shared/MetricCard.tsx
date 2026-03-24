import { ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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

  return (
    <Card className={cn("min-h-[140px]", className)}>
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mutedText">
            {label}
          </p>
          <p className={cn("text-3xl font-heading font-black tracking-[-0.05em]", toneClass)}>
            {value}
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
