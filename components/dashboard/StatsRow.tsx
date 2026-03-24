import { MetricCard } from "@/components/shared/MetricCard"

export function StatsRow({
  items,
}: {
  items: Array<{
    label: string
    value: string
    hint?: string
    tone?: "neutral" | "success" | "warning"
  }>
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <MetricCard
          key={item.label}
          label={item.label}
          value={item.value}
          hint={item.hint}
          tone={item.tone}
        />
      ))}
    </div>
  )
}
