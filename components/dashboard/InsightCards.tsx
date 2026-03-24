import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function InsightCards({
  insights,
}: {
  insights: Array<{
    title: string
    body: string
    href: string
  }>
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {insights.map((insight) => (
        <Card key={insight.title}>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">{insight.title}</h3>
              <p className="text-base leading-8 text-bodyText">{insight.body}</p>
            </div>
            <Link
              href={insight.href}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand"
            >
              Fix this
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
